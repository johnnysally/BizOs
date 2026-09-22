const { asyncHandler } = require('../../utils/asyncHandler');
const { logger } = require('../../utils/logger');
const mpesaService = require('../../services/mpesaService');
const { Payment } = require('../../models/client/Payment');
const { Sale } = require('../../models/client/Sale');

const mpesaCallback = asyncHandler(async (req, res) => {
  const payload = req.body;
  const parsed = mpesaService.parseCallback(payload);

  if (parsed.checkoutRequestId) {
    const payment = await Payment.findOne({ providerRef: parsed.checkoutRequestId });
    if (payment) {
      payment.status = parsed.success ? 'success' : 'failed';
      payment.providerPayload = payload;
      await payment.save();

      if (parsed.success && payment.saleId) {
        await Sale.updateOne({ _id: payment.saleId }, { $set: { paymentStatus: 'paid' } });
      }
    }
  }

  return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

const mpesaTimeout = asyncHandler(async (req, res) => {
  logger.warn({ body: req.body }, 'mpesa timeout');
  return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

const stripeWebhook = asyncHandler(async (req, res) => {
  logger.info('stripe webhook received');
  return res.status(200).json({ received: true });
});

const paystackWebhook = asyncHandler(async (req, res) => {
  logger.info('paystack webhook received');
  return res.status(200).json({ received: true });
});

const flutterwaveWebhook = asyncHandler(async (req, res) => {
  logger.info('flutterwave webhook received');
  return res.status(200).json({ received: true });
});

module.exports = {
  mpesaCallback,
  mpesaTimeout,
  stripeWebhook,
  paystackWebhook,
  flutterwaveWebhook,
};