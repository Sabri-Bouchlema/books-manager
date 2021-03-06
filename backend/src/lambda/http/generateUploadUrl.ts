import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { generateUploadUrl } from '../../businessLogic/books'
import { getUserId } from '../utils';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId;
  const userId = getUserId(event);

  const uploadUrl = await generateUploadUrl(userId, bookId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)