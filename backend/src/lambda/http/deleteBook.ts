import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils';
import { deleteBook } from '../../businessLogic/books';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId

  const userId = getUserId(event);

  await deleteBook(userId, bookId);

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
