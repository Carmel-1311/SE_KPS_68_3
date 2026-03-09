export class AppError extends Error {

  status: number
  code: string
  category: string

  constructor(status: number, code: string, message: string, category: string) {
    super(message)
    this.status = status
    this.code = code
    this.category = category
  }

}