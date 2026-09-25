export interface PrintOptions {
  title?: string;
  width?: number;
  height?: number;
  autoClose?: boolean;
  wide?: boolean;
}

export function printHtml(html: string, options: PrintOptions = {}): Window | null {
  const {
    title = 'Print',
    width = 420,
    height = 640,
    autoClose = true,
    wide = false,
  } = options;

  const w = window.open(
    '',
    '_blank',
    `width=${wide ? 900 : width},height=${wide ? 1000 : height},menubar=no,toolbar=no,location=no,status=no`
  );

  if (!w) return null;

  w.document.open();
  w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  ${PRINT_STYLES}
</head>
<body class="${wide ? 'a4' : 'thermal'}">
${html}
<script>
  window.onload = function () {
    try { window.focus(); window.print(); } catch (e) {}
    ${autoClose ? 'setTimeout(function(){ try { window.close(); } catch (e) {} }, 300);' : ''}
  };
</script>
</body>
</html>`);
  w.document.close();

  return w;
}

const PRINT_STYLES = `<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ---- thermal ---- */
  body.thermal {
    font-family: ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.45;
    color: #111;
    padding: 12px 10px;
    max-width: 320px;
    margin: 0 auto;
  }
  body.thermal h1 { font-size: 15px; text-align: center; margin: 0 0 4px; letter-spacing: 0.5px; }
  body.thermal h2 { font-size: 13px; margin: 10px 0 6px; }
  body.thermal .center { text-align: center; }
  body.thermal .muted { color: #555; }
  body.thermal .small { font-size: 11px; }
  body.thermal .row { display: flex; justify-content: space-between; gap: 8px; margin: 2px 0; }
  body.thermal .row .label { color: #333; }
  body.thermal .total { font-weight: bold; font-size: 14px; margin-top: 4px; }
  body.thermal hr {
    border: none;
    border-top: 1px dashed #999;
    margin: 8px 0;
  }
  body.thermal .logo { max-height: 44px; display: block; margin: 0 auto 6px; }
  body.thermal .paid-badge {
    display: inline-block;
    border: 1.5px solid #111;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 1.5px;
    margin-top: 6px;
  }

  /* ---- a4 ---- */
  body.a4 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: #1f2937;
    background: #ffffff;
    padding: 32px 40px;
  }
  body.a4 .doc { max-width: 780px; margin: 0 auto; }
  body.a4 .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    padding-bottom: 20px;
    border-bottom: 3px solid #2563eb;
    margin-bottom: 24px;
  }
  body.a4 .brand { display: flex; align-items: center; gap: 12px; }
  body.a4 .brand .logo { max-height: 56px; max-width: 56px; object-fit: contain; }
  body.a4 .brand-mark {
    width: 56px; height: 56px; border-radius: 12px;
    background: #2563eb; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 24px;
  }
  body.a4 .brand-text h1 { font-size: 18px; color: #111827; font-weight: 700; margin: 0; }
  body.a4 .brand-text p { font-size: 12px; color: #6b7280; margin: 2px 0 0; }
  body.a4 .doc-title { text-align: right; }
  body.a4 .doc-title h2 {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #2563eb;
    margin: 0;
    text-transform: uppercase;
  }
  body.a4 .doc-title .num {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 12px;
    color: #374151;
    margin-top: 4px;
  }
  body.a4 .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }
  body.a4 .meta-block h3 {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #6b7280;
    margin-bottom: 6px;
  }
  body.a4 .meta-block p { font-size: 13px; color: #111827; margin: 1px 0; }
  body.a4 .meta-block .strong { font-weight: 600; }
  body.a4 table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  body.a4 thead th {
    background: #eff6ff;
    color: #1e40af;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: left;
    padding: 10px 12px;
    border-bottom: 2px solid #2563eb;
  }
  body.a4 thead th.num { text-align: right; }
  body.a4 tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 13px;
    color: #111827;
  }
  body.a4 tbody tr:last-child td { border-bottom: none; }
  body.a4 tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
  body.a4 tbody td .sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  body.a4 .totals {
    margin-left: auto;
    width: 280px;
    padding-top: 12px;
  }
  body.a4 .totals .row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 13px;
  }
  body.a4 .totals .row .label { color: #6b7280; }
  body.a4 .totals .row .value { color: #111827; font-variant-numeric: tabular-nums; }
  body.a4 .totals .grand {
    border-top: 2px solid #2563eb;
    margin-top: 6px;
    padding-top: 10px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }
  body.a4 .totals .due {
    color: #2563eb;
    font-weight: 700;
  }
  body.a4 .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  body.a4 .badge.paid { background: #dcfce7; color: #166534; }
  body.a4 .badge.partial { background: #fef3c7; color: #92400e; }
  body.a4 .badge.due { background: #fee2e2; color: #991b1b; }
  body.a4 .badge.voided { background: #f3f4f6; color: #4b5563; }
  body.a4 .footer {
    margin-top: 36px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
  }
  body.a4 .footer p { margin: 2px 0; }

  @media print {
    body.thermal { padding: 4px; max-width: none; }
    body.a4 { padding: 16px; }
    .no-print { display: none !important; }
  }
</style>`;

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function money(amount: number, currency = 'KES'): string {
  const n = Number(amount) || 0;
  return `${currency} ${n.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}