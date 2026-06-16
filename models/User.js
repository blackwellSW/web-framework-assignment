const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

// 비밀번호 검증
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// 회원 생성 (비밀번호 해시 처리)
userSchema.statics.register = async function (username, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return this.create({ username, passwordHash });
};

module.exports = mongoose.model('User', userSchema);
