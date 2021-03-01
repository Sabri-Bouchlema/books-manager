import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { updateBook } from '../../businessLogic/books'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId
  const updatedBook: UpdateBookRequest = JSON.parse(event.body)
  const userId = getUserId(event);

  await updateBook(userId, bookId, updatedBook);

  return {
    statusCode: 204,
    body: ""
  }
})

handler.use(
  cors({
    credentials: true
  })
)

