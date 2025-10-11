export class NotFoundException extends Error {
  constructor(name = "Url") {
    super("Not found " + name, { cause: 404 });
  }
}

export class NotValidEmailException extends Error {
  constructor() {
    super("Not valid email", { cause: 400 });
  }
}

export class InvalidCredentialsException extends Error {
  constructor() {
    super("Invalid credentials", { cause: 401 });
  }
}

export class InvalidTokenException extends Error {
  constructor() {
    super("Invalid token please send it!", { cause: 409 });
  }
}

export class InvalidOTPException extends Error {
  constructor() {
    super("Invalid OTP!", { cause: 409 });
  }
}

export class OTPExpiredException extends Error {
  constructor() {
    super("OTP expired!", { cause: 409 });
  }
}

export class NotConfiermedException extends Error {
  constructor() {
    super("Please confirm your email", { cause: 400 });
  }
}

export class LoginAgainException extends Error {
  constructor() {
    super("Please login again", { cause: 401 });
  }
}

export class InvalidLoginMethodException extends Error {
  constructor() {
    super("Invalid login method", { cause: 400 });
  }
}

export class UnAuthorizedException extends Error {
  constructor() {
    super("Unauthorized", { cause: 401 });
  }
}
