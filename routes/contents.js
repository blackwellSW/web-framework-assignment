const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Content = require('../models/Content');

// 정규식 특수문자 이스케이프 (검색어 안전 처리)
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SORT_MAP = {
  recent: { createdAt: -1 },
  rating: { rating: -1, createdAt: -1 },
  title: { title: 1 },
};

// 목록 + 필터 + 검색 + 정렬
router.get('/', async (req, res) => {
  const { status, genre, type, q, sort } = req.query;
  const filter = { owner: req.user.id };
  if (status) filter.status = status;
  if (genre) filter.genre = genre;
  if (type) filter.type = type;
  if (q && q.trim()) filter.title = new RegExp(escapeRegex(q.trim()), 'i');

  const sortKey = SORT_MAP[sort] ? sort : 'recent';
  const contents = await Content.find(filter).sort(SORT_MAP[sortKey]);
  const genres = await Content.distinct('genre', { owner: req.user.id });

  // 상단 통계 스트립 (필터와 무관한 전체 집계)
  const stats = {
    total: await Content.countDocuments({ owner: req.user.id }),
    watched: await Content.countDocuments({ owner: req.user.id, status: '봄' }),
    watching: await Content.countDocuments({ owner: req.user.id, status: '보는중' }),
    wishlist: await Content.countDocuments({ owner: req.user.id, status: '보고싶음' }),
  };

  res.render('index', {
    contents,
    genres,
    stats,
    selectedStatus: status || '',
    selectedGenre: genre || '',
    selectedType: type || '',
    query: q || '',
    sort: sortKey,
  });
});

// 추가 폼
router.get('/add', (req, res) => {
  res.render('add');
});

// 추가 처리
router.post('/add', async (req, res) => {
  const { title, type, genre, status, rating, memo, watchedAt } = req.body;
  await Content.create({
    owner: req.user.id,
    title, type, genre, status,
    rating: rating || undefined,
    memo,
    watchedAt: watchedAt || undefined,
  });
  res.redirect('/');
});

// 통계 (본인 데이터만)
router.get('/stats', async (req, res) => {
  const owner = req.user.id;
  const ownerId = new mongoose.Types.ObjectId(owner); // aggregate는 자동 캐스팅이 안 됨
  const total = await Content.countDocuments({ owner });
  const watched = await Content.countDocuments({ owner, status: '봄' });
  const watching = await Content.countDocuments({ owner, status: '보는중' });
  const wishlist = await Content.countDocuments({ owner, status: '보고싶음' });

  const ratingResult = await Content.aggregate([
    { $match: { owner: ownerId, rating: { $exists: true } } },
    { $group: { _id: null, avg: { $avg: '$rating' } } }
  ]);
  const avgRating = ratingResult.length ? ratingResult[0].avg.toFixed(1) : '-';

  const byGenre = await Content.aggregate([
    { $match: { owner: ownerId } },
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.render('stats', { total, watched, watching, wishlist, avgRating, byGenre });
});

// 상세 보기 (본인 것만)
router.get('/:id', async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.redirect('/');
  const content = await Content.findOne({ _id: req.params.id, owner: req.user.id });
  if (!content) return res.redirect('/');
  res.render('detail', { content });
});

// 수정 폼
router.get('/:id/edit', async (req, res) => {
  const content = await Content.findOne({ _id: req.params.id, owner: req.user.id });
  if (!content) return res.redirect('/');
  res.render('edit', { content });
});

// 수정 처리
router.post('/:id/edit', async (req, res) => {
  const { title, type, genre, status, rating, memo, watchedAt } = req.body;
  await Content.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    {
      title, type, genre, status,
      rating: rating || undefined,
      memo,
      watchedAt: watchedAt || undefined,
    }
  );
  res.redirect(`/${req.params.id}`);
});

// 삭제
router.post('/:id/delete', async (req, res) => {
  await Content.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  res.redirect('/');
});

module.exports = router;
