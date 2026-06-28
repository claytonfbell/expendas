enum HttpStatus {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 415,
}

// fallow-ignore-next-line unused-export -- base class for subclasses that form the public API
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

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(HttpStatus.NotFound, message)
  }
}

export class UnauthorizedException extends HttpException {
  constructor() {
    super(HttpStatus.Unauthorized, "Unauthorized")
  }
}

export class ForbiddenException extends HttpException {
  constructor() {
    super(HttpStatus.Forbidden, "Forbidden")
  }
}

// fallow-ignore-next-line unused-export -- available exception variant for API handlers
export class MethodNotAllowedException extends HttpException {
  constructor() {
    super(HttpStatus.BadRequest, "API Method Not Allowed")
  }
}
