import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpsertBookRequest } from '../../requests/UpsertBookRequest'
import { createBook } from '../../businessLogic/books'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newBook: UpsertBookRequest = JSON.parse(event.body)

  const userId = getUserId(event);

  const item = await createBook(newBook, userId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
