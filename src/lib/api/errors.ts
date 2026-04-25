export class ApiError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST')
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT')
  }
}
