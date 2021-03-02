export interface BookItem {
  userId: string
  bookId: string
  createdAt: string
  name: string
  description: string
  published: boolean
  attachmentUrl?: string
}
