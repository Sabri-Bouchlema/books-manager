import * as uuid from 'uuid'

import { UpsertBookRequest } from '../requests/UpsertBookRequest'
import { BookAccess } from '../dataLayer/bookAccess'
import { BookItem } from '../models/BookItem';

const bookAccess = new BookAccess()

export async function getAllBooks(userId: string): Promise<BookItem[]> {
  return bookAccess.getAllBooks(userId);
}

export async function createBook(
  createBookRequest: UpsertBookRequest,
  userId: string
): Promise<BookItem> {

  return await bookAccess.createBook({
    bookId: uuid.v4(),
    userId: userId,
    name: createBookRequest.name,
    description: createBookRequest.description,
    published: createBookRequest.published,
    createdAt: new Date().toISOString()
  })
}

export async function getBook(
  userId: string,
  bookId: string
): Promise<BookItem> {
  return await bookAccess.getBookItem(userId, bookId);
}

export async function updateBook(
  userId: string,
  bookId: string,
  updatedBook: UpsertBookRequest
): Promise<void> {
  await bookAccess.updateBook(userId, bookId, updatedBook);
}

export async function deleteBook(
  userId: string,
  bookId: string
): Promise<void> {
  await bookAccess.deleteBook(userId, bookId);
}

export async function generateUploadUrl(
  userId: string,
  bookId: string
): Promise<string> {
  return await bookAccess.generateUploadUrl(userId, bookId);
}