# 뷰로그 📽️

영화·드라마·애니메이션·소설 감상 기록을 개인별로 관리하는 웹 서비스.
JWT 기반 회원 인증, 사용자별 데이터 분리, 검색·정렬을 지원한다.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 서버 | Node.js + Express 5 |
| 템플릿 엔진 | EJS |
| 데이터베이스 | MongoDB Atlas + Mongoose |
| 스타일 | TailwindCSS v3 |
| 인증 | JWT (httpOnly 쿠키) + bcryptjs |
| 배포 | Render |

---

## 프로젝트 구조

```
content-tracker/
├── server.js                 # 앱 진입점, Express 설정
├── package.json
├── tailwind.config.js        # Tailwind 설정 (views/**/*.ejs 스캔)
├── src/
│   └── input.css             # Tailwind 입력 파일 (@layer 컴포넌트 포함)
├── .env                      # MONGODB_URI, JWT_SECRET, PORT (gitignore)
├── .gitignore
├── models/
│   ├── User.js               # 사용자 스키마 (bcrypt 해시)
│   └── Content.js            # 콘텐츠 스키마 (owner 기반 분리)
├── middleware/
│   └── auth.js               # JWT 검증 미들웨어
├── routes/
│   ├── auth.js               # 회원가입 / 로그인 / 로그아웃
│   └── contents.js           # 콘텐츠 CRUD + 검색/정렬/통계
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── login.ejs             # 로그인
│   ├── register.ejs          # 회원가입
│   ├── index.ejs             # 목록 + 통계 스트립 + 검색/필터/정렬
│   ├── add.ejs               # 추가 폼
│   ├── edit.ejs              # 수정 폼
│   ├── detail.ejs            # 상세 보기
│   └── stats.ejs             # 통계 (장르별 막대 그래프)
└── public/
    └── css/
        └── style.css         # Tailwind 빌드 산출물 (직접 수정 금지)
```

---

## 데이터 스키마

### User
```js
{
  username:     String,   // 아이디 (3자 이상, unique)
  passwordHash: String,   // bcrypt 해시
  createdAt:    Date
}
```

### Content
```js
{
  owner:     ObjectId,  // 사용자 참조 (데이터 분리 기준)
  title:     String,    // 제목 (필수)
  type:      String,    // "영화" | "드라마" | "애니메이션" | "소설"
  genre:     String,    // 장르
  status:    String,    // "봄" | "보는중" | "보고싶음"
  rating:    Number,    // 1~5점 (선택)
  memo:      String,    // 감상평 (선택)
  watchedAt: Date,      // 감상일 (선택)
  createdAt: Date       // 자동 생성
}
```

---

## 주요 라우트

### 인증
| Method | Path | 기능 |
|--------|------|------|
| GET | `/login` | 로그인 폼 |
| POST | `/login` | 로그인 처리 (JWT 쿠키 발급) |
| GET | `/register` | 회원가입 폼 |
| POST | `/register` | 회원가입 처리 |
| POST | `/logout` | 로그아웃 (쿠키 삭제) |

### 콘텐츠 (로그인 필수)
| Method | Path | 기능 |
|--------|------|------|
| GET | `/` | 목록 (검색·필터·정렬 + 상단 통계) |
| GET | `/add` | 추가 폼 |
| POST | `/add` | DB 저장 |
| GET | `/:id` | 상세 보기 |
| GET | `/:id/edit` | 수정 폼 |
| POST | `/:id/edit` | DB 업데이트 |
| POST | `/:id/delete` | 삭제 |
| GET | `/stats` | 통계 (총 감상 수, 평균 평점, 장르별 그래프) |

#### 목록 쿼리 파라미터
| 파라미터 | 값 | 설명 |
|----------|----|------|
| `q` | 문자열 | 제목 키워드 검색 |
| `type` | 영화 \| 드라마 \| 애니메이션 \| 소설 | 타입 필터 |
| `status` | 봄 \| 보는중 \| 보고싶음 | 상태 필터 |
| `genre` | 문자열 | 장르 필터 |
| `sort` | recent \| rating \| title | 정렬 (기본: 최신순) |

---

## 로컬 실행 방법

```bash
# 패키지 설치
npm install

# .env 파일 생성
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/contentDB
# JWT_SECRET=<32자 이상 랜덤 문자열>
# PORT=3000

# CSS 빌드
npm run build:css

# 서버 실행
npm start
```

브라우저에서 `http://localhost:3000` 접속 후 회원가입
