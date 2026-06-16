const jwt = require('jsonwebtoken');

// 로그인 필수: 토큰이 없거나 유효하지 않으면 /login으로
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    res.locals.user = req.user; // 뷰에서 현재 사용자 접근
    next();
  } catch {
    res.clearCookie('token');
    return res.redirect('/login');
  }
}

// 이미 로그인 상태면 메인으로 (login/register 페이지 보호용)
function redirectIfAuth(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/');
    } catch {
      res.clearCookie('token');
    }
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };
