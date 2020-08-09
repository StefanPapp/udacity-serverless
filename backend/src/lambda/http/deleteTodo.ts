import 'source-map-support/register'
const logger = createLogger('deleteTodo')

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from "../../utils/logger";
import { deleteTodoItem } from "../../businessLogic/todos";
import { getUserId } from "../utils";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  logger.info('Delete item.', {"userId": userId, "todoId": todoId})

  await deleteTodoItem(todoId, userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
