# 🍔 바이브 딜리버리 (Vibe Delivery)
> **컴퓨터과학개론 기말 프로젝트 — Next.js 풀스택 배달 웹 애플리케이션 & 배포**

본 프로젝트는 한 학기 동안 학습한 **데이터베이스(PostgreSQL), 웹 프레임워크(Next.js), API 설계, Docker 컨테이너 격리 및 Vercel 배포**의 전 과정을 하나의 결합된 서비스로 실현해 낸 실시간 배달 주문 애플리케이션입니다.

---

## 🚀 실시간 공개 배포 주소 (Vercel)
- **배포 URL**: `[실제 배포 완료 후 본인의 Vercel URL을 여기에 기입해주세요]`
- **GitHub 저장소**: `[본인의 GitHub 저장소 주소]`

---

## ✨ 주요 제공 기능
1. **사용자 인증 (Authentication)**
   - 보안이 보장된 이메일/비밀번호 가입 및 로그인.
   - 비밀번호 솔팅/해싱 암호화(`bcryptjs`) 적용.
   - `JWT` 토큰 발행 및 클라이언트 변조를 방지하는 `httpOnly` 보안 세션 쿠키 기반 관리.
   - Next.js 16 최신 `proxy.ts` 규약을 이용한 라우트 가드(비인증 사용자 접근 제어).
2. **식당 및 메뉴판 조회**
   - 데이터베이스로부터 식당 리스트와 카테고리 정보 실시간 페칭.
   - 가산점 요건인 **식당 카테고리별 필터링 기능 (전체, 한식, 양식, 아시안)** 탑재.
3. **장바구니 (Cart)**
   - `LocalStorage`와 `Context API`를 결합하여 새로고침 시에도 장바구니 품목 유지.
   - 실제 배달앱 규칙과 동일하게 **동일한 식당의 메뉴만 한 장바구니에 담기도록** 예외 가드 구현.
4. **주문하기 (Order placement)**
   - 배송지 주소 유효성 검사 및 주문 생성.
   - **Prisma 트랜잭션(`db.$transaction`)**을 적용해 상위 주문(`Order`)과 하위 주문상세(`OrderItem`)를 원자적으로 동시 기록하여 데이터 이상현상 완전 방지.
5. **내 주문 내역 및 상태 모니터링 (Timeline)**
   - 최근 주문 역순으로 이력 조회.
   - **실시간 배달 단계 타임라인 UI** (접수대기 ➔ 조리중 ➔ 배달중 ➔ 완료) 구현.
   - 시연 및 평가 편의를 돕는 **배달 단계 강제 진전 데모 시뮬레이터 버튼** 탑재.

---

## 🛠️ 기술 스택 (Tech Stacks)
- **Frontend / Backend**: Next.js 16.2 (App Router), React 19, TypeScript
- **Database**: PostgreSQL 15, Neon DB (Serverless)
- **Database ORM**: Prisma ORM v7
- **Database Adapter**: `@prisma/adapter-pg`, `pg`
- **Authentication**: JWT (`jsonwebtoken`), `bcryptjs`, Cookies
- **Container / Devops**: Docker Compose, Makefile, Vercel

---

## 💻 로컬 개발 환경 실행 방법

### 1. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 `.env.example` 규격에 맞춰 로컬 DB 연결 주소 및 JWT 암호화 세션 키를 정의합니다.
```env
DATABASE_URL="postgresql://delivery_user:delivery_password@localhost:5432/delivery_db?schema=public"
JWT_SECRET="임의의_강력한_JWT_비밀키_문자열"
```

### 2. 데이터베이스 컨테이너 구동 및 스키마/시드 주입
Docker Desktop이 실행 중인 상태에서 아래 명령어를 기동합니다:
```bash
# 로컬 PostgreSQL 컨테이너 시작 + 테이블 빌드 + 초기 시드 데이터(식당 13개 및 39개 대표 메뉴) 자동 적재
npm run db:up
```
*(또는 make 유틸리티가 설치된 환경인 경우 `make up` 명령어로도 구동 가능합니다.)*

### 3. Next.js 로컬 웹 개발 서버 실행
```bash
npm run dev
```
기동 후 웹 브라우저를 열어 **[http://localhost:3000](http://localhost:3000)** 주소로 접속하여 테스트를 진행합니다.

### 4. 로컬 환경 정리 및 종료
```bash
npm run db:down
```
*(또는 `make down`)*
