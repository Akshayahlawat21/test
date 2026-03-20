/**
 * Admin authorization middleware.
 * Must be used after the auth middleware so req.user is populated.
 */
const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = admin;
