const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  message: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Tip', tipSchema);
