import { sendError } from '../utils/response.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace with validated/sanitized data
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    const errorDetails = error.errors?.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })) || [{ message: error.message }];

    return sendError(res, 'Validation error', 400, errorDetails);
  }
};
