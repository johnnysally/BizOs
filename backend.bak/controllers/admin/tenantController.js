const { asyncHandler } = require('../../utils/asyncHandler');
const { ok, paginated, noContent } = require('../../utils/apiResponse');
const { parsePagination } = require('../../utils/pagination');
const { assertObjectId } = require('../../utils/validateObjectId');
const { ApiError } = require('../../utils/apiError');
const { Tenant } = require('../../models/admin/Tenant');
const { User } = require('../../models/client/User');
const { PendingActivation } = require('../../models/admin/PendingActivation');
const emailService = require('../../services/emailService');
const { signAccessToken } = require('../../utils/jwt');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, country, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (country) filter.country = country;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const [items, total] = await Promise.all([
    Tenant.find(filter).sort({ registeredAt: -1 }).skip(skip).limit(limit).lean(),
    Tenant.countDocuments(filter),
  ]);

  return paginated(res, items, page, limit, total);
});

const get = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'tenantId');

  const tenant = await Tenant.findById(req.params.id).lean();
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  const owner = await User.findOne({ tenantId: tenant._id, role: 'owner' })
    .select('fullName email phone status')
    .lean();
  const pending = await PendingActivation.findOne({ tenantId: tenant._id }).lean();

  return ok(res, { tenant, owner, pending });
});

const update = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'tenantId');

  const allowed = ['name', 'country', 'businessType', 'planId'];
  const patch = {};
  for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];

  const tenant = await Tenant.findByIdAndUpdate(req.params.id, patch, { new: true }).lean();
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  return ok(res, tenant);
});

const suspend = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'tenantId');

  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  tenant.status = 'suspended';
  tenant.suspendedAt = new Date();
  tenant.suspendedBy = req.admin.id;
  tenant.suspendedReason = req.body.reason || null;
  await tenant.save();

  await User.updateMany({ tenantId: tenant._id }, { $set: { status: 'suspended' } });

  const owner = await User.findOne({ tenantId: tenant._id, role: 'owner' }).lean();
  if (owner?.email) {
    emailService
      .sendStaffDeactivatedEmail(owner.email, {
        fullName: owner.fullName,
        businessName: tenant.name,
      })
      .catch(() => {});
  }

  return ok(res, { suspended: true });
});

const reactivate = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'tenantId');

  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  tenant.status = 'active';
  tenant.suspendedAt = null;
  tenant.suspendedBy = null;
  tenant.suspendedReason = null;
  await tenant.save();

  await User.updateMany(
    { tenantId: tenant._id, status: 'suspended' },
    { $set: { status: 'active' } }
  );

  return ok(res, { reactivated: true });
});

const remove = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'tenantId');

  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  tenant.status = 'suspended';
  tenant.suspendedReason = 'Soft-deleted by admin';
  await tenant.save();

  await User.updateMany({ tenantId: tenant._id }, { $set: { status: 'suspended' } });

  return noContent(res);
});

const impersonate = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'tenantId');

  const tenant = await Tenant.findById(req.params.id).lean();
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  const owner = await User.findOne({ tenantId: tenant._id, role: 'owner' }).lean();
  if (!owner) throw ApiError.notFound('OWNER_NOT_FOUND', 'Owner not found');

  const token = signAccessToken({
    sub: owner._id.toString(),
    tenantId: tenant._id.toString(),
    role: 'owner',
    scope: 'active',
    impersonatedBy: req.admin.id,
  });

  return ok(res, {
    accessToken: token,
    tenant: { id: tenant._id, name: tenant.name },
    owner: { id: owner._id, email: owner.email, fullName: owner.fullName },
  });
});

module.exports = { list, get, update, suspend, reactivate, remove, impersonate };