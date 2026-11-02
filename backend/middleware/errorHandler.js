module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Some submitted information is invalid.",
      errors: Object.values(err.errors).map(item => item.message)
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "That email address or username is already registered."
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "The supplied ID or value is invalid."
    });
  }

  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
    ? err.status
    : 500;

  res.status(status).json({
    success: false,
    message: status >= 500
      ? "An unexpected server error occurred."
      : err.message || "The request could not be completed."
  });
};
