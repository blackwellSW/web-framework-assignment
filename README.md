# 콘텐츠 감상 기록기

영화·드라마 시청 기록을 관리하는 웹 서비스. 감상 상태, 평점, 감상평을 DB에 저장하고 조회·수정·삭제할 수 있다.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 서버 | Node.js + Express |
| 템플릿 엔진 | EJS |
| 데이터베이스 | MongoDB Atlas + Mongoose |
| 스타일 | Bootstrap 5 (CDN) |
| 배포 | Render |

---

## 프로젝트 구조

```
content-tracker/
├── server.js               # 앱 진입점, Express 설정
├── package.json
├── .env                    # MONGODB_URI, PORT (gitignore)
├── .gitignore
├── models/
│   └── Content.js          # Mongoose 스키마/모델
├── routes/
│   └── contents.js         # CRUD 라우터
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs           # 목록 + 필터
│   ├── add.ejs             # 추가 폼
│   ├── edit.ejs            # 수정 폼
│   └── detail.ejs          # 상세 보기
└── public/
    └── css/
        └── style.css
```

---

## 데이터 스키마

```js
{
  title:     String,   // 제목 (필수)
  type:      String,   // "영화" | "드라마"
  genre:     String,   // 장르 (액션, 로맨스, 공포 ...)
  status:    String,   // "봄" | "보는중" | "보고싶음"
  rating:    Number,   // 1~5점 (선택)
  memo:      String,   // 감상평 (선택)
  watchedAt: Date,     // 감상일 (선택)
  createdAt: Date      // 자동 생성
}
```

---

## 주요 라우트

| Method | Path | 기능 |
|--------|------|------|
| GET | `/` | 전체 목록 + 상태/장르 필터 |
| GET | `/add` | 추가 폼 |
| POST | `/add` | DB 저장 |
| GET | `/:id` | 상세 보기 |
| GET | `/:id/edit` | 수정 폼 |
| POST | `/:id/edit` | DB 업데이트 |
| POST | `/:id/delete` | DB 삭제 |
| GET | `/stats` | 통계 (총 감상 수, 평균 평점, 장르별 수) |

---

## 로컬 실행 방법

```bash
# 패키지 설치
npm install

# .env 파일 생성 후 MongoDB URI 입력
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/contentDB?retryWrites=true&w=majority
# PORT=3000

# 서버 실행
node server.js
```

브라우저에서 `http://localhost:3000` 접속

---

## 배포 (Render)

1. GitHub에 push
2. Render → **New Web Service** → GitHub 저장소 연결
3. Environment Variables에 `MONGODB_URI` 추가
4. **Deploy** 클릭

---

## 제출 일정

| 날짜 | 내용 |
|------|------|
| 6월 17일 | Render URL 과제 게시판 사전 제출 |
| 6월 21일 | 프로젝트 완료 + 문서화 최종 제출 |
