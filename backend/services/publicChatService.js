const { chat } = require('./aiService');
const { PlatformSetting } = require('../models/admin/PlatformSetting');
const { Plan } = require('../models/admin/Plan');
const cacheService = require('./cacheService');
const { getRedis } = require('../config/redis');
const { logger } = require('../utils/logger');

const RATE_LIMIT_PER_IP = 30;
const WINDOW_SEC = 3600;
const PROMPT_CACHE_KEY = 'chat:public:system_prompt';
const PROMPT_TTL = 300;

async function buildSystemPrompt() {
  const cached = await cacheService.get(PROMPT_CACHE_KEY);
  if (cached) return cached;

  const [platformName, supportEmail, supportPhone, website] = await Promise.all([
    PlatformSetting.getValue('platform_name', 'BizOS'),
    PlatformSetting.getValue('support_email', null),
    PlatformSetting.getValue('support_phone', null),
    PlatformSetting.getValue('platform_website', null),
  ]);

  const features = await PlatformSetting.find({ key: /^feature_/ }).lean();
  const on = features.filter((f) => f.value === true).map((f) => f.key.replace('feature_', ''));
  const off = features.filter((f) => f.value !== true).map((f) => f.key.replace('feature_', ''));

  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

  const lines = [];
  lines.push(`You are the AI assistant on ${platformName}'s landing page. ${platformName} is a point-of-sale platform for small businesses.`);
  lines.push('');
  lines.push('Available features:');
  for (const f of on) lines.push(`- ${label(f)}`);
  lines.push('');
  if (off.length) {
    lines.push('Not yet available (do not promise these):');
    for (const f of off) lines.push(`- ${label(f)}`);
    lines.push('');
  }

  if (plans.length) {
    lines.push('Pricing:');
    for (const p of plans) {
      const price = p.price?.amount
        ? `${p.price.amount} ${p.price.currency}/${p.price.interval}`
        : 'Free';
      lines.push(`- ${p.name} — ${price}${p.description ? ` (${p.description})` : ''}`);
    }
    lines.push('');
  }

  lines.push('Staff roles: owner, manager, cashier.');
  lines.push('');
  if (supportEmail) lines.push(`Support email: ${supportEmail}`);
  if (supportPhone) lines.push(`Support phone: ${supportPhone}`);
  if (website) lines.push(`Website: ${website}`);
  lines.push('');
  lines.push('Rules:');
  lines.push('- Only describe features listed as available. Do not invent features.');
  lines.push('- If asked about something not listed, say you do not have that information and suggest contacting support.');
  lines.push('- Keep replies concise (2–4 short paragraphs max).');
  lines.push(`- Reply in the user's language.`);

  const prompt = lines.join('\n');
  await cacheService.set(PROMPT_CACHE_KEY, prompt, PROMPT_TTL);
  return prompt;
}

function label(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

async function invalidatePromptCache() {
  await cacheService.del(PROMPT_CACHE_KEY);
}

async function checkRateLimit(ip) {
  const redis = getRedis();
  if (!redis) return true;
  const key = `chat:public:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW_SEC);
  return count <= RATE_LIMIT_PER_IP;
}

async function reply({ text, ip }) {
  if (!text || !text.trim()) return { reply: 'Please type a question.' };

  const allowed = await checkRateLimit(ip);
  if (!allowed) return { reply: 'Too many messages. Please try again later.' };

  try {
    const systemPrompt = await buildSystemPrompt();
    const { reply: answer, tokensUsed } = await chat(text, systemPrompt, { type: 'public_chat' });
    return { reply: answer, tokensUsed };
  } catch (err) {
    logger.error({ err: err.message, ip }, 'publicChat failed');
    const fallback = await PlatformSetting.getValue('support_email', 'support@bizos.co.ke');
    return { reply: `Sorry, I'm having trouble right now. Email ${fallback}` };
  }
}

module.exports = { reply, buildSystemPrompt, invalidatePromptCache };