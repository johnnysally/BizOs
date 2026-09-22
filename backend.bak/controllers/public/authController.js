const crypto = require('crypto');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/apiResponse');
const { ApiError } = require('../../utils/apiError');
const { env } = require('../../config/env');
const { Tenant } = require('../../models/admin/Tenant');
const { User } = require('../../models/client/User');
const SuperAdmin = require('../../models/admin/SuperAdmin');
const { PendingActivation } = require('../../models/admin/PendingActivation');
const { PlatformSetting } = require('../../models/admin/PlatformSetting');
const { hashPassword, signAccessToken, signRefreshToken } = require('../../utils/jwt');
const { slugify } = require('../../utils/slugify');
const emailService = require('../../services/emailService');

function randomPassword(len = 12) {
  return crypto.randomBytes(len).toString('base64url').slice(0, len);
}

async function uniqueSlug(base) {
  let slug = slugify(base);
  if (!slug) slug = `biz-${Date.now()}`;

  let exists = await Tenant.findOne({ slug }).lean();
  let i = 1;
  while (exists) {
    slug = `${slugify(base)}-${i++}`;
    exists = await Tenant.findOne({ slug }).lean();
  }
  return slug;
}

const register = asyncHandler(async (req, res) => {
  const { businessName, ownerName, email, phone, country, businessType, password } = req.body;

  if (!businessName || !ownerName || !email || !password) {
    throw ApiError.badRequest(
      'MISSING_FIELDS',
      'businessName, ownerName, email, password required'
    );
  }
  if (password.length < 8) {
    throw ApiError.badRequest('WEAK_PASSWORD', 'Password must be at least 8 characters');
  }

  const registrationOpen = await PlatformSetting.getValue('registration_open', true);
  if (!registrationOpen) {
    throw ApiError.forbidden('REGISTRATION_CLOSED', 'Registration is closed');
  }

  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) throw ApiError.conflict('EMAIL_TAKEN', 'Email already registered');

  const slug = await uniqueSlug(businessName);
  const passwordHash = await hashPassword(password);

  const tenant = await Tenant.create({
    name: businessName,
    slug,
    country: country || 'KE',
    businessType: businessType || 'retail',
    status: 'pending_user',
    planId: 'free',
    registeredAt: new Date(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  const owner = await User.create({
    tenantId: tenant._id,
    email: email.toLowerCase(),
    phone,
    fullName: ownerName,
    role: 'owner',
    status: 'pending_user',
    passwordHash,
    emailVerified: true,
  });

  tenant.ownerId = owner._id;
  await tenant.save();

  await PendingActivation.create({
    tenantId: tenant._id,
    status: 'pending',
    priority: 'normal',
    registeredAt: new Date(),
    slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
  });

  emailService
    .sendPaymentReceivedEmail(owner.email, {
      name: owner.fullName,
      businessName: tenant.name,
      amount: req.body.amount || 0,
      currency: req.body.currency || 'KES',
      reference: req.body.reference || null,
      paidAt: new Date().toISOString(),
    })
    .catch(() => {});

  const admins = await SuperAdmin.find({ status: 'active' }).select('email').lean();
  for (const admin of admins) {
    emailService
      .sendAdminNewPendingEmail(admin.email, {
        businessName: tenant.name,
        ownerName: owner.fullName,
        ownerEmail: owner.email,
        ownerPhone: owner.phone,
        country: tenant.country,
        businessType: tenant.businessType,
        registeredAt: tenant.registeredAt.toISOString(),
        reviewUrl: `${env.adminUrl}/pending`,
      })
      .catch(() => {});
  }

  const scope = 'pending';
  const payload = {
    sub: owner._id.toString(),
    tenantId: tenant._id.toString(),
    role: owner.role,
    scope,
  };

  return created(res, {
    user: {
      id: owner._id,
      fullName: owner.fullName,
      email: owner.email,
      role: owner.role,
      status: owner.status,
    },
    tenant: {
      id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
    },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw ApiError.badRequest('MISSING_FIELDS', 'Email and password required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');

  if (['rejected', 'suspended'].includes(user.status)) {
    throw ApiError.forbidden('ACCOUNT_BLOCKED', `Account ${user.status}. Contact support.`);
  }

  const { comparePassword } = require('../../utils/jwt');
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');

  const tenant = await Tenant.findById(user.tenantId).lean();
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  if (tenant.status === 'rejected') {
    throw ApiError.forbidden('ACCOUNT_REJECTED', 'Registration was not approved');
  }
  if (tenant.status === 'suspended') {
    throw ApiError.forbidden('ACCOUNT_SUSPENDED', 'Account suspended');
  }
  if (tenant.status === 'expired') {
    throw ApiError.forbidden('ACCOUNT_EXPIRED', 'Registration expired');
  }

  const scope = tenant.status === 'active' ? 'active' : 'pending';
  const payload = {
    sub: user._id.toString(),
    tenantId: tenant._id.toString(),
    role: user.role,
    scope,
  };

  user.lastLoginAt = new Date();
  await user.save();

  return ok(res, {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
    },
    tenant: {
      id: tenant._id,
      name: tenant.name,
      status: tenant.status,
      planId: tenant.planId,
    },
    scope,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw ApiError.badRequest('NO_TOKEN', 'Verification token required');

  const user = await User.findOne({ verifyToken: token }).select('+verifyToken');
  if (!user) throw ApiError.badRequest('INVALID_TOKEN', 'Invalid or expired token');

  if (user.verifyExpiresAt && user.verifyExpiresAt < new Date()) {
    throw ApiError.badRequest('TOKEN_EXPIRED', 'Verification token expired');
  }

  user.emailVerified = true;
  user.verifyToken = undefined;
  user.verifyExpiresAt = undefined;
  await user.save();

  return ok(res, { verified: true });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest('EMAIL_REQUIRED', 'Email required');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return ok(res, { sent: true });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  emailService
    .sendPasswordResetEmail(user.email, {
      fullName: user.fullName,
      resetUrl: `${env.appUrl}/reset-password?token=${token}`,
      expiresIn: '1 hour',
    })
    .catch(() => {});

  return ok(res, { sent: true });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw ApiError.badRequest('MISSING_FIELDS', 'token and newPassword required');
  }
  if (newPassword.length < 8) {
    throw ApiError.badRequest('WEAK_PASSWORD', 'Password must be at least 8 characters');
  }

  const user = await User.findOne({ resetToken: token }).select('+resetToken');
  if (!user) throw ApiError.badRequest('INVALID_TOKEN', 'Invalid or expired token');
  if (user.resetExpiresAt && user.resetExpiresAt < new Date()) {
    throw ApiError.badRequest('TOKEN_EXPIRED', 'Reset token expired');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.resetToken = undefined;
  user.resetExpiresAt = undefined;
  await user.save();

  emailService
    .sendPasswordChangedEmail(user.email, {
      fullName: user.fullName,
      when: new Date().toISOString(),
      ip: req.ip,
    })
    .catch(() => {});

  return ok(res, { reset: true });
});

const acceptInvite = asyncHandler(async (req, res) => {
  const { token, password, fullName } = req.body;
  if (!token || !password) {
    throw ApiError.badRequest('MISSING_FIELDS', 'token and password required');
  }
  if (password.length < 8) {
    throw ApiError.badRequest('WEAK_PASSWORD', 'Password must be at least 8 characters');
  }

  const { UserInvitation } = require('../../models/client/UserInvitation');
  const inv = await UserInvitation.findOne({ token, acceptedAt: null });
  if (!inv) throw ApiError.badRequest('INVALID_INVITE', 'Invalid or expired invitation');
  if (inv.expiresAt < new Date()) throw ApiError.badRequest('INVITE_EXPIRED', 'Invitation expired');

  const user = await User.findById(inv.userId);
  if (!user) throw ApiError.notFound('USER_NOT_FOUND', 'User not found');

  user.passwordHash = await hashPassword(password);
  if (fullName) user.fullName = fullName;
  user.status = 'active';
  user.mustChangePassword = false;
  await user.save();

  inv.acceptedAt = new Date();
  await inv.save();

  const tenant = await Tenant.findById(user.tenantId).lean();
  const scope = tenant?.status === 'active' ? 'active' : 'pending';
  const payload = {
    sub: user._id.toString(),
    tenantId: user.tenantId.toString(),
    role: user.role,
    scope,
  };

  return ok(res, {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user._id, email: user.email, role: user.role },
  });
});

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  acceptInvite,
};