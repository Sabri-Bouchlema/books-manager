import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import * as uuid from 'uuid'

import { BookItem } from '../models/BookItem'
import { UpsertBookRequest } from '../requests/UpsertBookRequest'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'


const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('book-access')

export class BookAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = createS3(),
    private readonly booksTable = process.env.BOOKS_TABLE,
    private readonly bookIdIndexName = process.env.BOOK_ID_INDEX_NAME,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {
  }

  async getAllBooks(userId: string): Promise<BookItem[]> {
    logger.info(`Getting all books for user ${userId}`)

    const result = await this.docClient.query({
      TableName: this.booksTable,
      IndexName: this.bookIdIndexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    logger.info("Books list has been fetched successfully")
    return items as BookItem[]
  }

  async createBook(book: BookItem): Promise<BookItem> {
    logger.info(`Start creating a book item ${book}`)

    await this.docClient.put({
      TableName: this.booksTable,
      Item: book
    }).promise()

    logger.info(`book item has been created successfully ${book}`)
    return book
  }

  async updateBook(userId: string, bookId: string, updatedbook: UpsertBookRequest): Promise<void> {
    logger.info(`Start updating book item  ${updatedbook}`)

    const bookItem = await this.getBookItem(userId, bookId);

    await this.docClient.update({
      TableName: this.booksTable,
      Key: {
        userId: bookItem.userId,
        createdAt: bookItem.createdAt
      },
      ConditionExpression: "bookId =:bookId",
      UpdateExpression: "set #namefield = :name, published=:published, description=:description",
      ExpressionAttributeValues: {
        ":bookId": bookItem.bookId,
        ":name": updatedbook.name,
        ":published": updatedbook.published,
        ":description": updatedbook.description
      },
      ExpressionAttributeNames: {
        "#namefield": "name"
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()

    logger.info(`book item has been successfully updated ${updatedbook}`)
  }

  async deleteBook(userId: string, bookId: string): Promise<void> {

    const bookItem = await this.getBookItem(userId, bookId);

    await this.docClient.delete({
      TableName: this.booksTable,
      Key: {
        userId: bookItem.userId,
        createdAt: bookItem.createdAt
      },
      ConditionExpression: "bookId =:bookId",
      ExpressionAttributeValues: {
        ":bookId": bookItem.bookId
      }
    }).promise()
  }

  async generateUploadUrl(userId: string, bookId: string): Promise<string> {

    const bookItem = await this.getBookItem(userId, bookId);

    if (!bookItem.attachmentUrl) {
      logger.info(`Set attachmentUrl for book item ${bookItem}`)
      await this.setAttachmentUrl(bookItem);
    } else {
      logger.info(`AttachmentUrl for book item already setted ${bookItem}`)
    }

    return this.getUploadUrl(bookItem.bookId);
  }

  getUploadUrl(imageId: string): string {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
  }

  async getBookItem(userId: string, bookId: string): Promise<BookItem> {
    const result = await this.docClient.query({
      TableName: this.booksTable,
      IndexName: this.bookIdIndexName,
      KeyConditionExpression: 'userId = :userId and bookId = :bookId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':bookId': bookId
      }
    }).promise()

    if (result.Count === 0) {
      throw new Error(`Cannot find book item with id : ${bookId}`);
    }

    return result.Items[0] as BookItem;
  }

  async setAttachmentUrl(bookItem: BookItem): Promise<void> {
    const attachmentUrl = 'https://' + this.bucketName + '.s3.amazonaws.com/' + bookItem.bookId

    await this.docClient.update({
      TableName: this.booksTable,
      Key: {
        userId: bookItem.userId,
        createdAt: bookItem.createdAt
      },
      ConditionExpression: "bookId =:bookId",
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":bookId": bookItem.bookId,
        ":attachmentUrl": attachmentUrl
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

function createS3() {
  return new XAWS.S3({
    signatureVersion: 'v4'
  })
}