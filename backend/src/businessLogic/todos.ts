import * as uuid from 'uuid'

import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { TodoUpdate } from "../models/TodoUpdate";
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/TodoAccess'
import { createLogger } from "../utils/logger";
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const logger = createLogger('todos')

const todoAccess = new TodoAccess()

export async function createTodoItem(todoItem: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info('Create new item.', {"userId": userId, "todoItem": todoItem})

    const todoId = uuid.v4()

    return await todoAccess.createTodoItem({
        todoId: todoId,
        userId: userId,
        done: false,
        createdAt: new Date().toISOString(),
        ...todoItem
    })
}

export async function getAllTodoItemsForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get all items for user.', {"userId": userId})
    return todoAccess.getAllTodoItemsForUser(userId)
}

export async function updateTodoItem(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<void> {
     logger.info('Update item.', {"updateTodoRequest": updateTodoRequest, "todoId": todoId, "userId": userId})
     const todoUpdate: TodoUpdate = updateTodoRequest as TodoUpdate
     await todoAccess.updateTodoItem(todoUpdate, todoId, userId)
 }

 export async function deleteTodoItem(todoId: string, userId: string): Promise<void> {
     logger.info('Delete item.', {"todoId": todoId, "userId": userId})
     await todoAccess.deleteTodoItem(todoId, userId)
     await todoAccess.deleteTodoItemAttachment(todoId)
 }

 export async function createUploadUrl(todoId: string, userId: string): Promise<string> {
     logger.info('Create upload url.', {"todoId": todoId, "userId": userId})

     const uploadUrl = await todoAccess.createUploadUrl(todoId)
     const downloadUrl = uploadUrl.split("?")[0]

     logger.info('Created signed url', {"signedUploadUrl": uploadUrl, "downloadUrl": downloadUrl})

     await todoAccess.updateAttachmentUrl(todoId, userId, downloadUrl)
     return uploadUrl
 }