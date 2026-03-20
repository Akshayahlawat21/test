const env = require('../config/env');
const stripe = env.stripeSecretKey
  ? require('stripe')(env.stripeSecretKey)
  : null;
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// POST /api/subscriptions/create-checkout
// Creates a Stripe Checkout Session for monthly or yearly subscription
exports.createCheckout = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'
    const user = req.user;

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Choose monthly or yearly.' });
    }

    // Check if user already has an active subscription
    if (user.subscription.status === 'active') {
      return res.status(400).json({ error: 'You already have an active subscription.' });
    }

    // Create or retrieve Stripe customer
    let customerId = user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    const priceId = plan === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?subscription=cancelled`,
      metadata: { userId: user._id.toString(), plan }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    next(error);
  }
};

// GET /api/subscriptions/status
exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('subscription');
    res.json({ subscription: user.subscription });
  } catch (error) {
    next(error);
  }
};

// POST /api/subscriptions/cancel
exports.cancelSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription to cancel.' });
    }

    // Cancel at period end (don't immediately revoke access)
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    user.subscription.status = 'cancelled';
    await user.save();

    res.json({ message: 'Subscription will be cancelled at the end of the current billing period.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/subscriptions/reactivate
exports.reactivateSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No subscription to reactivate.' });
    }

    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    user.subscription.status = 'active';
    await user.save();

    res.json({ message: 'Subscription reactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/webhooks/stripe — handle Stripe webhook events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const user = await User.findOne({ 'subscription.stripeCustomerId': subscription.customer });
        if (user) {
          user.subscription.stripeSubscriptionId = subscription.id;
          user.subscription.status = 'active';
          user.subscription.plan = subscription.items.data[0].price.id === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly';
          user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          user.subscription.renewalDate = new Date(subscription.current_period_end * 1000);
          await user.save();

          // Create transaction record
          await Transaction.create({
            userId: user._id,
            type: 'subscription',
            amount: subscription.items.data[0].price.unit_amount / 100,
            stripePaymentIntentId: subscription.latest_invoice,
            status: 'completed'
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const user = await User.findOne({ 'subscription.stripeCustomerId': subscription.customer });
        if (user) {
          user.subscription.status = subscription.cancel_at_period_end ? 'cancelled' :
            subscription.status === 'active' ? 'active' : 'inactive';
          user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          user.subscription.renewalDate = new Date(subscription.current_period_end * 1000);
          await user.save();
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const user = await User.findOne({ 'subscription.stripeCustomerId': subscription.customer });
        if (user) {
          user.subscription.status = 'lapsed';
          user.subscription.plan = 'none';
          user.subscription.stripeSubscriptionId = null;
          await user.save();
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
          if (user) {
            await Transaction.create({
              userId: user._id,
              type: 'subscription',
              amount: invoice.amount_paid / 100,
              stripeInvoiceId: invoice.id,
              status: 'completed'
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
        if (user) {
          user.subscription.status = 'lapsed';
          await user.save();
          // TODO: Send payment failed email
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
