import type { Sale } from '@/types/sale';
import { escapeHtml, money } from './printHtml';

export type ReceiptFormat = 'thermal' | 'a4';

export interface ReceiptInput {
  business: {
    name: string;
    logoUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    taxPin?: string | null;
  };
  settings?: {
    taxRate?: number;
    taxInclusive?: boolean;
    receiptShowLogo?: boolean;
    receiptShowTax?: boolean;
    receiptShowCustomer?: boolean;
    receiptShowCashier?: boolean;
    receiptFooter?: string;
  };
  sale: Sale;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  cashierName?: string | null;
  format?: ReceiptFormat;
}

const DEFAULT_SETTINGS = {
  taxRate: 0,
  taxInclusive: false,
  receiptShowLogo: true,
  receiptShowTax: true,
  receiptShowCustomer: true,
  receiptShowCashier: false,
  receiptFooter: 'Thank you for your business.',
};

export function receiptHtml(input: ReceiptInput): string {
  const settings = { ...DEFAULT_SETTINGS, ...(input.settings || {}) };
  return input.format === 'a4'
    ? renderA4(input, settings)
    : renderThermal(input, settings);
}

/* ------------------------------------------------------------------ */
/* THERMAL                                                             */
/* ------------------------------------------------------------------ */

function renderThermal(
  input: ReceiptInput,
  settings: typeof DEFAULT_SETTINGS
): string {
  const { business, sale, customerName, cashierName } = input;
  const currency = sale.currency || 'KES';
  const lines: string[] = [];

  if (settings.receiptShowLogo && business.logoUrl) {
    lines.push(
      '<img class="logo" src="' +
        escapeHtml(business.logoUrl) +
        '" alt="' +
        escapeHtml(business.name) +
        '" />'
    );
  } else {
    lines.push('<h1>' + escapeHtml(business.name) + '</h1>');
  }

  if (business.address) {
    lines.push(
      '<p class="center small muted">' + escapeHtml(business.address) + '</p>'
    );
  }
  if (business.phone) {
    lines.push(
      '<p class="center small muted">' + escapeHtml(business.phone) + '</p>'
    );
  }

  lines.push('<hr />');
  lines.push('<p class="center small">' + escapeHtml(sale.saleNumber) + '</p>');
  lines.push(
    '<p class="center small muted">' +
      escapeHtml(new Date(sale.createdAt).toLocaleString()) +
      '</p>'
  );

  if (settings.receiptShowCustomer && customerName) {
    lines.push(
      '<p class="center small">Customer: ' + escapeHtml(customerName) + '</p>'
    );
  }
  if (settings.receiptShowCashier && cashierName) {
    lines.push(
      '<p class="center small muted">Served by: ' +
        escapeHtml(cashierName) +
        '</p>'
    );
  }

  lines.push('<hr />');

  for (const item of sale.items) {
    lines.push(
      '<div class="row"><span>' +
        escapeHtml(item.name) +
        ' × ' +
        item.qty +
        '</span><span>' +
        escapeHtml(money(item.subtotal, currency)) +
        '</span></div>'
    );
  }

  lines.push('<hr />');
  lines.push(
    '<div class="row"><span class="label">Subtotal</span><span>' +
      escapeHtml(money(sale.subtotal, currency)) +
      '</span></div>'
  );

  if (sale.discount > 0) {
    lines.push(
      '<div class="row"><span class="label">Discount</span><span>−' +
        escapeHtml(money(sale.discount, currency)) +
        '</span></div>'
    );
  }

  if (settings.receiptShowTax && settings.taxRate > 0 && sale.tax > 0) {
    const suffix = settings.taxInclusive ? ' (incl.)' : '';
    lines.push(
      '<div class="row"><span class="label">VAT ' +
        settings.taxRate +
        '%' +
        suffix +
        '</span><span>' +
        escapeHtml(money(sale.tax, currency)) +
        '</span></div>'
    );
  }

  if (sale.loyaltyDiscountValue && sale.loyaltyDiscountValue > 0) {
    lines.push(
      '<div class="row"><span class="label">Loyalty (−' +
        (sale.loyaltyPointsRedeemed || 0) +
        ' pts)</span><span>−' +
        escapeHtml(money(sale.loyaltyDiscountValue, currency)) +
        '</span></div>'
    );
  }

  lines.push(
    '<div class="row total"><span>Total</span><span>' +
      escapeHtml(money(sale.total, currency)) +
      '</span></div>'
  );

  if (sale.paymentMethod) {
    lines.push('<hr />');
    lines.push(
      '<div class="row"><span class="label">Payment</span><span>' +
        escapeHtml(sale.paymentMethod) +
        '</span></div>'
    );
  }

  if (sale.loyaltyPointsEarned && sale.loyaltyPointsEarned > 0) {
    lines.push(
      '<p class="center small muted">Earned ' +
        sale.loyaltyPointsEarned +
        ' points</p>'
    );
  }

  if (sale.voided) {
    lines.push('<hr />');
    lines.push('<p class="center"><span class="paid-badge">VOIDED</span></p>');
    if (sale.voidReason) {
      lines.push(
        '<p class="center small muted">' +
          escapeHtml(sale.voidReason) +
          '</p>'
      );
    }
  }

  lines.push('<hr />');
  lines.push(
    '<p class="center small">' +
      escapeHtml(settings.receiptFooter || 'Thank you for your business.') +
      '</p>'
  );

  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* A4                                                                  */
/* ------------------------------------------------------------------ */

function renderA4(
  input: ReceiptInput,
  settings: typeof DEFAULT_SETTINGS
): string {
  const {
    business,
    sale,
    customerName,
    customerPhone,
    customerEmail,
    cashierName,
  } = input;
  const currency = sale.currency || 'KES';
  const out: string[] = [];

  out.push('<div class="doc">');

  /* header */
  out.push('<div class="doc-header">');
  out.push('<div class="brand">');
  if (settings.receiptShowLogo && business.logoUrl) {
    out.push(
      '<img class="logo" src="' +
        escapeHtml(business.logoUrl) +
        '" alt="' +
        escapeHtml(business.name) +
        '" />'
    );
  } else {
    out.push(
      '<div class="brand-mark">' +
        escapeHtml((business.name || 'B').charAt(0).toUpperCase()) +
        '</div>'
    );
  }
  out.push('<div class="brand-text">');
  out.push('<h1>' + escapeHtml(business.name) + '</h1>');
  if (business.address) {
    out.push('<p>' + escapeHtml(business.address) + '</p>');
  }
  const contact = [business.phone, business.email].filter(Boolean).join(' · ');
  if (contact) out.push('<p>' + escapeHtml(contact) + '</p>');
  if (business.taxPin) {
    out.push('<p>Tax PIN: ' + escapeHtml(business.taxPin) + '</p>');
  }
  out.push('</div>');
  out.push('</div>');

  out.push('<div class="doc-title">');
  out.push('<h2>Receipt</h2>');
  out.push('<div class="num">' + escapeHtml(sale.saleNumber) + '</div>');
  out.push('</div>');
  out.push('</div>');

  /* meta grid */
  out.push('<div class="meta-grid">');

  out.push('<div class="meta-block">');
  out.push('<h3>Received from</h3>');
  if (customerName) {
    out.push('<p class="strong">' + escapeHtml(customerName) + '</p>');
    if (customerPhone) out.push('<p>' + escapeHtml(customerPhone) + '</p>');
    if (customerEmail) out.push('<p>' + escapeHtml(customerEmail) + '</p>');
  } else {
    out.push('<p class="strong">Walk-in customer</p>');
  }
  out.push('</div>');

  out.push('<div class="meta-block" style="text-align:right">');
  out.push('<h3>Transaction</h3>');
  out.push(
    '<p><strong>Date:</strong> ' +
      escapeHtml(new Date(sale.createdAt).toLocaleString()) +
      '</p>'
  );
  if (cashierName && settings.receiptShowCashier) {
    out.push('<p><strong>Cashier:</strong> ' + escapeHtml(cashierName) + '</p>');
  }

  const statusLabel = sale.voided
    ? 'Voided'
    : sale.paymentStatus === 'pending'
    ? 'Unpaid'
    : sale.paymentStatus === 'partial'
    ? 'Partial'
    : 'Paid';
  const statusClass = sale.voided
    ? 'voided'
    : sale.paymentStatus === 'pending'
    ? 'due'
    : sale.paymentStatus === 'partial'
    ? 'partial'
    : 'paid';
  out.push(
    '<p style="margin-top:8px"><span class="badge ' +
      statusClass +
      '">' +
      escapeHtml(statusLabel) +
      '</span></p>'
  );
  out.push('</div>');

  out.push('</div>');

  /* items table */
  out.push('<table>');
  out.push('<thead><tr>');
  out.push('<th>Item</th>');
  out.push('<th class="num">Qty</th>');
  out.push('<th class="num">Unit price</th>');
  out.push('<th class="num">Amount</th>');
  out.push('</tr></thead>');
  out.push('<tbody>');
  for (const item of sale.items) {
    out.push('<tr>');
    out.push(
      '<td>' +
        escapeHtml(item.name) +
        (item.sku
          ? '<div class="sub">' + escapeHtml(item.sku) + '</div>'
          : '') +
        '</td>'
    );
    out.push('<td class="num">' + item.qty + '</td>');
    out.push(
      '<td class="num">' + escapeHtml(money(item.price, currency)) + '</td>'
    );
    out.push(
      '<td class="num">' + escapeHtml(money(item.subtotal, currency)) + '</td>'
    );
    out.push('</tr>');
  }
  out.push('</tbody></table>');

  /* totals */
  out.push('<div class="totals">');
  out.push(
    '<div class="row"><span class="label">Subtotal</span><span class="value">' +
      escapeHtml(money(sale.subtotal, currency)) +
      '</span></div>'
  );

  if (sale.discount > 0) {
    out.push(
      '<div class="row"><span class="label">Discount</span><span class="value">−' +
        escapeHtml(money(sale.discount, currency)) +
        '</span></div>'
    );
  }

  if (settings.receiptShowTax && settings.taxRate > 0 && sale.tax > 0) {
    const suffix = settings.taxInclusive ? ' (incl.)' : '';
    out.push(
      '<div class="row"><span class="label">VAT ' +
        settings.taxRate +
        '%' +
        suffix +
        '</span><span class="value">' +
        escapeHtml(money(sale.tax, currency)) +
        '</span></div>'
    );
  }

  if (sale.loyaltyDiscountValue && sale.loyaltyDiscountValue > 0) {
    out.push(
      '<div class="row"><span class="label">Loyalty (−' +
        (sale.loyaltyPointsRedeemed || 0) +
        ' pts)</span><span class="value">−' +
        escapeHtml(money(sale.loyaltyDiscountValue, currency)) +
        '</span></div>'
    );
  }

  out.push(
    '<div class="row grand"><span>Total</span><span>' +
      escapeHtml(money(sale.total, currency)) +
      '</span></div>'
  );

  if (sale.paymentMethod) {
    out.push(
      '<div class="row" style="margin-top:8px"><span class="label">Payment method</span><span class="value">' +
        escapeHtml(sale.paymentMethod) +
        '</span></div>'
    );
  }

  if (sale.loyaltyPointsEarned && sale.loyaltyPointsEarned > 0) {
    out.push(
      '<div class="row"><span class="label">Points earned</span><span class="value">+' +
        sale.loyaltyPointsEarned +
        '</span></div>'
    );
  }

  out.push('</div>');

  /* footer */
  out.push('<div class="footer">');
  out.push(
    '<p>' +
      escapeHtml(settings.receiptFooter || 'Thank you for your business.') +
      '</p>'
  );
  out.push(
    '<p style="margin-top:4px">' +
      escapeHtml(business.name) +
      ' · Generated by BizOS</p>'
  );
  out.push('</div>');

  out.push('</div>');

  return out.join('\n');
}