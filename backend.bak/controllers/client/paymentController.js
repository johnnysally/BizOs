const { asyncHandler } = require('../../utils/asyncHandler');
const { ok, created, paginated } = require('../../utils/apiResponse');
const { parsePagination } = require('../../utils/pagination');
const { assertObjectId } = require('../../utils/validateObjectId');
const { tenantFilter } = require('../../utils/tenantScope');
const { ApiError } = require('../../utils/apiError');
const { Payment } = require('../../models/client/Payment');
const { Sale } = require('../../models/client/Sale');
const mpesaService = require('../../services/mpesaService');

const initiate = asyncHandler(async (req, res) => {
  const { saleId, method, phone, amount } = req.body;
  if (!method) throw ApiError.badRequest('METHOD_REQUIRED', 'Payment method required');

  const sale = await Sale.findOne(tenantFilter(req, { _id: saleId })).lean();
  if (!sale) throw ApiError.notFound('SALE_NOT_FOUND', 'Sale not found');

  if (method === 'mpesa') {
    if (!phone) throw ApiError.badRequest('PHONE_REQUIRED', 'Phone number required for M-Pesa');

    const stk = await mpesaService.stkPush({
      phone,
      amount: amount || sale.total,
      accountRef: sale.saleNumber,
      description: `Payment for ${sale.saleNumber}`,
    });

    const payment = await Payment.create({
      tenantId: req.tenantId,
      saleId: sale._id,
      method: 'mpesa',
      amount: amount || sale.total,
      currency: sale.currency,
      status: 'pending',
      providerRef: stk.checkoutRequestId,
      providerPayload: stk.raw,
    });

    return created(res, {
      paymentId: payment._id,
      checkoutRequestId: stk.checkoutRequestId,
      message: stk.customerMessage,
    });
  }

  const payment = await Payment.create({
    tenantId: req.tenantId,
    saleId: sale._id,
    method,
    amount: amount || sale.total,
    currency: sale.currency,
    status: 'success',
  });

  return created(res, payment.toObject());
});

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = tenantFilter(req);
  if (req.query.saleId) filter.saleId = req.query.saleId;
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payment.countDocuments(filter),
  ]);

  return paginated(res, items, page, limit, total);
});

const refund = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'paymentId');

  const payment = await Payment.findOne(tenantFilter(req, { _id: req.params.id }));
  if (!payment) throw ApiError.notFound('PAYMENT_NOT_FOUND', 'Payment not found');
  if (payment.status !== 'success') {
    throw ApiError.badRequest('NOT_REFUNDABLE', 'Only successful payments can be refunded');
  }

  payment.status = 'refunded';
  payment.refundedAt = new Date();
  payment.refundedBy = req.user.id;
  await payment.save();

  await Sale.updateOne(
    tenantFilter(req, { _id: payment.saleId }),
    { $set: { paymentStatus: 'refunded' } }
  );

  return ok(res, payment.toObject());
});

module.exports = { initiate, list, refund };