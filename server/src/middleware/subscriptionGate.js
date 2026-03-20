/**
 * Subscription gate middleware.
 * Ensures the user has an active subscription before proceeding.
 * Must be used after the auth middleware so req.user is populated.
 */
const subscriptionGate = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (!req.user.subscription || req.user.subscription.status !== 'active') {
    return res.status(403).json({
      error: 'Active subscription required.',
      message: 'You need an active subscription to access this feature. Please subscribe or renew your subscription.',
    });
  }

  next();
};

module.exports = subscriptionGate;
