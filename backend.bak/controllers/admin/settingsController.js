const { asyncHandler } = require('../../utils/asyncHandler');
const { ok } = require('../../utils/apiResponse');
const { PlatformSetting } = require('../../models/admin/PlatformSetting');

const PUBLIC_KEYS = [
  'platform_name',
  'platform_logo_url',
  'support_email',
  'support_phone',
  'default_currency',
  'default_country',
  'default_tax_rate',
  'tax_inclusive',
  'min_password_length',
  'registration_open',
  'maintenance_mode',
  'max_owners_per_tenant',
  'cashier_discount_limit',
  'cashier_refund_limit',
  'manager_can_invite_cashier',
  'require_shift_clock_in',
];

const FEATURE_KEYS = [
  'feature_pos',
  'feature_inventory',
  'feature_ai_insights',
  'feature_multi_location',
  'feature_loyalty',
  'feature_storefront',
  'feature_accounting',
  'feature_api',
  'feature_purchase_orders',
  'feature_invoices',
];

const get = asyncHandler(async (_req, res) => {
  const docs = await PlatformSetting.find().lean();
  const map = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  return ok(res, map);
});

const update = asyncHandler(async (req, res) => {
  const updates = req.body || {};
  const results = {};

  for (const [key, value] of Object.entries(updates)) {
    await PlatformSetting.setValue(key, value, req.admin.id);
    results[key] = value;
  }

  return ok(res, results);
});

const getPublic = asyncHandler(async (_req, res) => {
  const docs = await PlatformSetting.find({ key: { $in: PUBLIC_KEYS } }).lean();
  const map = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  return ok(res, map);
});

const features = asyncHandler(async (_req, res) => {
  const docs = await PlatformSetting.find({ key: { $in: FEATURE_KEYS } }).lean();
  const map = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  return ok(res, map);
});

module.exports = { get, update, getPublic, features };