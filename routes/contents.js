const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// 목록 + 필터
router.get('/', async (req, res) => {
  const { status, genre } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (genre) filter.genre = genre;

  const contents = await Content.find(filter).sort({ createdAt: -1 });
  const genres = await Content.distinct('genre');
  res.render('index', { contents, genres, selectedStatus: status || '', selectedGenre: genre || '' });
});

// 추가 폼
router.get('/add', (req, res) => {
  res.render('add');
});

// 추가 처리
router.post('/add', async (req, res) => {
  const { title, type, genre, status, rating, memo, watchedAt } = req.body;
  await Content.create({ title, type, genre, status, rating: rating || undefined, memo, watchedAt: watchedAt || undefined });
  res.redirect('/');
});

// 통계
router.get('/stats', async (req, res) => {
  const total = await Content.countDocuments();
  const watched = await Content.countDocuments({ status: '봄' });
  const watching = await Content.countDocuments({ status: '보는중' });
  const wishlist = await Content.countDocuments({ status: '보고싶음' });

  const ratingResult = await Content.aggregate([
    { $match: { rating: { $exists: true } } },
    { $group: { _id: null, avg: { $avg: '$rating' } } }
  ]);
  const avgRating = ratingResult.length ? ratingResult[0].avg.toFixed(1) : '-';

  const byGenre = await Content.aggregate([
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.render('stats', { total, watched, watching, wishlist, avgRating, byGenre });
});

// 상세 보기
router.get('/:id', async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.redirect('/');
  const content = await Content.findById(req.params.id);
  if (!content) return res.redirect('/');
  res.render('detail', { content });
});

// 수정 폼
router.get('/:id/edit', async (req, res) => {
  const content = await Content.findById(req.params.id);
  if (!content) return res.redirect('/');
  res.render('edit', { content });
});

// 수정 처리
router.post('/:id/edit', async (req, res) => {
  const { title, type, genre, status, rating, memo, watchedAt } = req.body;
  await Content.findByIdAndUpdate(req.params.id, {
    title, type, genre, status,
    rating: rating || undefined,
    memo,
    watchedAt: watchedAt || undefined
  });
  res.redirect(`/${req.params.id}`);
});

// 삭제
router.post('/:id/delete', async (req, res) => {
  await Content.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

module.exports = router;
