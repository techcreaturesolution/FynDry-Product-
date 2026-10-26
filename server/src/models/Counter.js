import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Atomically generates next sequential order number (e.g. FD-2026-000123)
 * @param {string} prefix - Sequence identifier (default 'order')
 * @returns {Promise<string>}
 */
export const getNextOrderNumber = async (prefix = 'order') => {
  const currentYear = new Date().getFullYear();
  const counterId = `${prefix}_${currentYear}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const sequentialNumber = String(counter.seq).padStart(6, '0');
  return `FD-${currentYear}-${sequentialNumber}`;
};

export default Counter;
