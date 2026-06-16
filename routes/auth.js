const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { redirectIfAuth } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
};

function issueToken(res, user) {
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, COOKIE_OPTS);
}

// 회원가입 폼
router.get('/register', redirectIfAuth, (req, res) => {
  res.render('register', { error: null, username: '' });
});

// 회원가입 처리
router.post('/register', redirectIfAuth, async (req, res) => {
  const { username = '', password = '', confirm = '' } = req.body;
  const name = username.trim();
  try {
    if (name.length < 3) throw new Error('아이디는 3자 이상이어야 합니다.');
    if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.');
    if (password !== confirm) throw new Error('비밀번호가 일치하지 않습니다.');
    if (await User.findOne({ username: name })) throw new Error('이미 사용 중인 아이디입니다.');

    const user = await User.register(name, password);
    issueToken(res, user);
    res.redirect('/');
  } catch (err) {
    res.status(400).render('register', { error: err.message, username: name });
  }
});

// 로그인 폼
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: null, username: '' });
});

// 로그인 처리
router.post('/login', redirectIfAuth, async (req, res) => {
  const { username = '', password = '' } = req.body;
  const name = username.trim();
  try {
    const user = await User.findOne({ username: name });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    issueToken(res, user);
    res.redirect('/');
  } catch (err) {
    res.status(401).render('login', { error: err.message, username: name });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
