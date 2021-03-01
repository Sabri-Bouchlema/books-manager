/**
 * Fields in a request to update a single BOOK item.
 */
export interface UpdateBookRequest {
  name: string
  dueDate: string
  done: boolean
}