import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getBook } from '../../businessLogic/books'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId

  const userId = getUserId(event);

  const item = await getBook(userId, bookId)

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
