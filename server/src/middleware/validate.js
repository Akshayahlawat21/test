/**
 * Generic Zod validation middleware factory.
 * Accepts a Zod schema and validates req.body against it.
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors || error.issues || [],
    });
  }
};

module.exports = validate;
