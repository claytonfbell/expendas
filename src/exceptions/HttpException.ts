enum HttpStatus {
  BadRequest = 400,
  MethodNotAllowed = 415,
}

export class HttpException {
  status: HttpStatus
  message: string

  constructor(status: HttpStatus, message: string) {
    this.status = status
    this.message = message
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(HttpStatus.BadRequest, message)
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor() {
    super(HttpStatus.BadRequest, "API Method Not Allowed")
  }
}
