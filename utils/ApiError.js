export class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor) //passing the current error instance and current constructor function to trace the origin of error
    }
}
