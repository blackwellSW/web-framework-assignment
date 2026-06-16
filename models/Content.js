const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['영화', '드라마', '애니메이션', '소설'], required: true },
  genre: { type: String, required: true },
  status: { type: String, enum: ['봄', '보는중', '보고싶음'], required: true },
  rating: { type: Number, min: 1, max: 5 },
  memo: { type: String },
  watchedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
