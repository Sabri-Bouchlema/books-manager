/**
 * Fields in a request to create a single BOOK item.
 */
export interface UpsertBookRequest {
  name: string
  description: string
  published: boolean
}
