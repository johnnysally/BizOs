const mongoose = require('mongoose');

const STATUSES = ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'];

const itemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerSnapshot: {
      name: String,
      phone: String,
      email: String,
      address: String,
    },
    items: { type: [itemSchema], default: [] },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: STATUSES, default: 'draft' },
    dueDate: Date,
    issuedAt: Date,
    sentAt: Date,
    paidAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    paymentMethod: String,
    paymentRef: String,
    notes: String,
    remindersSent: { type: Number, default: 0 },
    lastReminderAt: Date,
    pdfUrl: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

schema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
schema.index({ tenantId: 1, status: 1 });
schema.index({ tenantId: 1, customerId: 1 });
schema.index({ tenantId: 1, dueDate: 1 });
schema.index({ tenantId: 1, createdAt: -1 });

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Invoice', schema);