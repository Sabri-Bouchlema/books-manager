import * as uuid from 'uuid'

import { CreateBookRequest } from '../requests/CreateBookRequest'
import { BookAccess } from '../dataLayer/bookAccess'
import { BookItem } from '../models/BookItem';
import { UpdateBookRequest } from '../requests/UpdateBookRequest';

const bookAccess = new BookAccess()

export async function getAllBooks(userId: string): Promise<BookItem[]> {
  return bookAccess.getAllBooks(userId);
}

export async function createBook(
  createBookRequest: CreateBookRequest,
  userId: string
): Promise<BookItem> {

  return await bookAccess.createBook({
    bookId: uuid.v4(),
    userId: userId,
    name: createBookRequest.name,
    dueDate: createBookRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export async function updateBook(
  userId: string,
  bookId: string,
  updatedBook: UpdateBookRequest
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