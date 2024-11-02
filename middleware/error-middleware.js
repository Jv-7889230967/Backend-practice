import { ApiError } from "../utils/ApiError.js";

// middleware/error.middleware.js
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    // Handle custom ApiError

    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  // Handle generic server errors
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
