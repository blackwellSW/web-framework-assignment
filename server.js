const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRouter = require('./routes/auth');
const contentsRouter = require('./routes/contents');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// 미들웨어
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// 라우터
app.use('/', authRouter);                 // 회원가입 / 로그인 / 로그아웃
app.use('/', requireAuth, contentsRouter); // 콘텐츠 CRUD (로그인 필수)

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
