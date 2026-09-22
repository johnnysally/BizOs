const { asyncHandler } = require('../../utils/asyncHandler');
const { ok } = require('../../utils/apiResponse');
const siteService = require('../../services/siteService');

const getPublicSettings = asyncHandler(async (_req, res) => {
  const settings = await siteService.getSettings();
  return ok(res, settings);
});

const getBusinessTypes = asyncHandler(async (_req, res) => {
  return ok(res, siteService.BUSINESS_TYPES);
});

const getCountries = asyncHandler(async (_req, res) => {
  return ok(res, siteService.COUNTRIES);
});

const getCurrencies = asyncHandler(async (_req, res) => {
  return ok(res, siteService.CURRENCIES);
});

const getLegalLinks = asyncHandler(async (_req, res) => {
  const links = await siteService.getLegalLinks();
  return ok(res, links);
});

const getFeatureFlags = asyncHandler(async (_req, res) => {
  const flags = await siteService.getFeatureFlags();
  return ok(res, flags);
});

module.exports = {
  getPublicSettings,
  getBusinessTypes,
  getCountries,
  getCurrencies,
  getLegalLinks,
  getFeatureFlags,
};