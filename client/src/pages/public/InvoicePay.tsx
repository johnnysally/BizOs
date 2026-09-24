import { FormEvent, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  Printer,
  Phone,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { publicInvoiceApi, PublicInvoice } from '@/api/publicInvoices';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotifications } from '@/context/NotificationContext';
import { formatDate, formatDateTime } from '@/utils/date';
import { classNames } from '@/utils/classNames';

function money(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InvoicePay() {
  const { invoiceNumber = '' } = useParams();
  const { toast } = useNotifications();

  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [stkSending, setStkSending] = useState(false);
  const [stkSent, setStkSent] = useState(false);
  const [stkError, setStkError] = useState<string | null>(null);

  useEffect(() => {
    publicInvoiceApi
      .get(invoiceNumber)
      .then((data) => {
        setInvoice(data);
        if (data.customerSnapshot?.phone) {
          setPhone(data.customerSnapshot.phone);
        }
      })
      .catch((e) =>
        setError((e as { message?: string }).message || 'Invoice not found')
      )
      .finally(() => setLoading(false));
  }, [invoiceNumber]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast({ type: 'success', message: 'Copied' }),
      () => toast({ type: 'error', message: 'Could not copy' })
    );
  };

  const sendStk = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoice || !phone.trim()) return;
    setStkError(null);
    setStkSending(true);
    try {
      await publicInvoiceApi.sendStk(invoice.invoiceNumber, phone.trim());
      setStkSent(true);
      toast({ type: 'success', message: 'STK sent to your phone' });
    } catch (err) {
      setStkError(
        (err as { message?: string }).message || 'Could not send STK'
      );
    } finally {
      setStkSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h1 className="text-xl font-semibold text-slate-900">
            Invoice not found
          </h1>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          <Link to="/" className="inline-block mt-6">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';
  const isCancelled = invoice.status === 'cancelled';
  const isDue = invoice.amountDue > 0 && !isPaid && !isCancelled;

  const stkMethod = invoice.paymentInstructions?.find(
    (m) => m.code === 'mpesa_stk'
  );
  const manualMethods =
    invoice.paymentInstructions?.filter((m) => m.code !== 'mpesa_stk') || [];

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* status banner */}
        {isPaid && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900">
                Payment received
              </p>
              <p className="text-sm text-green-700">
                Thank you. Your account is being processed.
              </p>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <div>
              <p className="font-semibold text-red-900">
                Invoice cancelled
              </p>
              <p className="text-sm text-red-700">
                Contact support if you believe this is a mistake.
              </p>
            </div>
          </div>
        )}

        {/* invoice card */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {/* header */}
          <div className="bg-slate-900 p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white text-xl font-bold">BizOS</div>
                <div className="text-slate-400 text-xs mt-1">
                  Point of Sale Platform
                </div>
              </div>
              <div className="text-right">
                <div className="text-brand-500 text-xl font-bold tracking-widest">
                  INVOICE
                </div>
                <div className="text-slate-400 text-xs mt-1 font-mono">
                  {invoice.invoiceNumber}
                </div>
              </div>
            </div>
          </div>

          {/* details */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Billed to
              </p>
              <p className="font-semibold text-slate-900">
                {invoice.customerSnapshot.name}
              </p>
              {invoice.customerSnapshot.email && (
                <p className="text-sm text-slate-600">
                  {invoice.customerSnapshot.email}
                </p>
              )}
              {invoice.customerSnapshot.phone && (
                <p className="text-sm text-slate-600">
                  {invoice.customerSnapshot.phone}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Details
              </p>
              <p className="text-sm">
                <span className="font-semibold">Issued:</span>{' '}
                {formatDate(invoice.issuedAt)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Due:</span>{' '}
                {formatDate(invoice.dueDate)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={classNames(
                    'capitalize',
                    isPaid
                      ? 'text-green-600'
                      : isCancelled
                      ? 'text-red-600'
                      : 'text-amber-600'
                  )}
                >
                  {invoice.status}
                </span>
              </p>
            </div>
          </div>

          {/* items */}
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-3 py-2">
                    Description
                  </th>
                  <th className="text-right text-xs font-bold text-slate-600 uppercase px-3 py-2">
                    Qty
                  </th>
                  <th className="text-right text-xs font-bold text-slate-600 uppercase px-3 py-2">
                    Unit
                  </th>
                  <th className="text-right text-xs font-bold text-slate-600 uppercase px-3 py-2">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-3 py-3 text-sm">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-right">
                      {item.qty}
                    </td>
                    <td className="px-3 py-3 text-sm text-right">
                      {money(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="px-3 py-3 text-sm text-right font-semibold">
                      {money(item.subtotal, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* totals */}
            <div className="ml-auto mt-4 max-w-xs space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>{money(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span>-{money(invoice.discount, invoice.currency)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span>{money(invoice.tax, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-slate-200 text-base font-bold">
                <span>Total</span>
                <span>{money(invoice.total, invoice.currency)}</span>
              </div>
              {isDue && (
                <div className="flex justify-between text-brand-600 font-bold">
                  <span>Amount due</span>
                  <span>{money(invoice.amountDue, invoice.currency)}</span>
                </div>
              )}
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Amount paid</span>
                  <span>{money(invoice.amountPaid, invoice.currency)}</span>
                </div>
              )}
            </div>

            {invoice.notes && (
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-brand-500 rounded text-sm text-blue-900">
                <strong>Notes:</strong> {invoice.notes}
              </div>
            )}
          </div>

          {/* how to pay */}
          {isDue && invoice.paymentInstructions && invoice.paymentInstructions.length > 0 && (
            <div className="p-6 bg-sky-50 border-t border-sky-200">
              <h2 className="text-sm font-bold text-sky-900 uppercase tracking-wider mb-4">
                How to pay
              </h2>

              {/* STK form */}
              {stkMethod && !stkSent && (
                <form
                  onSubmit={sendStk}
                  className="mb-6 p-4 bg-white border border-sky-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={16} className="text-sky-700" />
                    <p className="font-semibold text-sky-900">
                      Pay via M-Pesa STK
                    </p>
                  </div>
                  <p className="text-xs text-sky-700 mb-3">
                    Enter your M-Pesa phone number and we'll send a payment
                    prompt to your phone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254712345678"
                      required
                    />
                    <Button type="submit" loading={stkSending}>
                      Send STK
                    </Button>
                  </div>
                  {stkError && (
                    <p className="text-xs text-red-600 mt-2">{stkError}</p>
                  )}
                </form>
              )}

              {stkSent && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-900">
                    STK sent to your phone
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Enter your M-Pesa PIN to complete the payment.
                  </p>
                </div>
              )}

              {/* manual methods */}
              {manualMethods.length > 0 && (
                <div className="space-y-3">
                  {manualMethods.map((method) => (
                    <div
                      key={method.code}
                      className="p-4 bg-white border border-sky-200 rounded-lg"
                    >
                      <p className="font-semibold text-sky-900 mb-1">
                        {method.title}
                      </p>
                      {method.description && (
                        <p className="text-xs text-sky-700 mb-3">
                          {method.description}
                        </p>
                      )}
                      {method.steps && method.steps.length > 0 && (
                        <ol className="text-sm text-sky-900 space-y-1.5 list-decimal list-inside">
                          {method.steps.map((s, i) => {
                            const isCopyable = /^\d{6,}$/.test(s.trim()) || /^[A-Z0-9]{8,}$/.test(s.trim());
                            return (
                              <li key={i} className="flex items-start justify-between gap-2">
                                <span className="flex-1">{s}</span>
                                {isCopyable && (
                                  <button
                                    type="button"
                                    onClick={() => copy(s.trim())}
                                    className="shrink-0 p-1 rounded hover:bg-sky-100 text-sky-600"
                                    title="Copy"
                                  >
                                    <Copy size={12} />
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Thank you for your business.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              support@bizos.co.ke · +254 700 000 000
            </p>
          </div>
        </div>

        {/* actions */}
        <div className="flex justify-between items-center">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to home
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}