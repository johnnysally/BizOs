const mongoose = require('mongoose');

const TYPES = ['manual', 'auto'];
const STATUSES = ['running', 'success', 'failed', 'expired'];

const schema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    sizeBytes: { type: Number, default: 0 },
    checksum: String,
    type: { type: String, enum: TYPES, required: true },
    status: { type: String, enum: STATUSES, default: 'running' },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    durationMs: Number,
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },
    error: String,
    collections: [String],
    recordCounts: { type: Object, default: {} },
    retentionUntil: Date,
  },
  { timestamps: true }
);

schema.index({ status: 1, startedAt: -1 });
schema.index({ type: 1, startedAt: -1 });
schema.index({ retentionUntil: 1 });

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Backup', schema);