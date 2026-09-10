# 핫템로그 · Hottem Log

영상에서 본 추천 제품을 검색하고 쿠팡에서 확인하는 한솔의 콘텐츠 허브입니다. `hottemlog_codex_final_instructions.md`를 개발 명세로 사용했습니다. 결제·일반 회원가입 없이 영상, 상품과 제휴 링크를 관리합니다.

## 구현된 기능

- 연핑크 모바일 우선 UI, 9:16 영상, 한줄평 상품 카드, 플랫폼/카테고리 필터, 상품 정렬·페이지 이동
- 상품명·설명·태그·카테고리 및 영상 제목·설명·연결 상품 검색
- 영상/상품 상세, 다대다 연결, 추천 포인트, 관련 콘텐츠
- Supabase 이메일/비밀번호 관리자 로그인, 서버 권한 검사, RLS
- 영상·상품·카테고리 CRUD, 공개/비공개, Featured, 영상 및 연결 상품 순서
- JPG/PNG/WebP 업로드 → 서버에서 최대 1600px WebP 변환 → Supabase Storage
- YouTube URL에서 썸네일 자동 생성, Instagram 수동 업로드
- 내부 `/go/[productId]`에서 쿠팡 이동과 클릭 기록, 유효한 연결 영상에 한해 출처 기록
- 관리자 대시보드, 오늘/7일/30일/전체 클릭 통계, 상품/영상/카테고리 집계, 날짜별 그래프와 표
- 브랜드·SNS·로고·문의·제휴 고지·SEO 설정
- metadata, OpenGraph, canonical, JSON-LD, sitemap, robots, 404·로딩·오류·빈 결과·폼 검증·토스트·삭제 모달

## 기술 스택과 폴더

Next.js 16.3.4 (App Router), React 19.3, TypeScript, Tailwind CSS 4, Supabase JS/SSR, Zod, Lucide, Sharp. Node.js **22.12 이상**(권장 24), npm 사용. 정확한 설치 버전은 `package-lock.json`으로 고정합니다.

```text
app/
  (public)/           홈, products, videos, search, product/[slug], video/[slug], 정책·문의
  admin/
    login/            관리자 로그인
    (protected)/      대시보드, 상품·영상·카테고리·통계·설정
    actions.ts        로그인과 관리자 Server Actions
  api/admin/upload/   인증 및 이미지 최적화 업로드
  go/[productId]/     쿠팡 클릭 저장과 redirect
  sitemap.ts, robots.ts
components/           레이아웃, 콘텐츠 카드, 검색, 관리자 폼·차트
lib/
  auth/               검증된 Auth user와 profiles.role 검사
  data/               공통 데이터 접근, 샘플 콘텐츠
  analytics/          통계 RPC와 한국 시간 날짜 보정
  supabase/           공개·세션·서버 전용 클라이언트
  validation.ts       서버 입력 검증
supabase/
  migrations/         구조·정책·함수·Storage, 샘플 seed
  config.toml         로컬 Supabase 설정(가입 비활성화)
tests/                보안·검색·날짜 단위 검사와 브라우저 테스트
scripts/              seed 재생성, PostgreSQL 검증
proxy.ts              /admin 및 /api/admin 세션 갱신과 접근 보호
```

## 1. 새 Supabase 프로젝트 만들기

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 한솔 개인 계정으로 로그인합니다.
2. **New project**를 눌러 핫템로그 전용 프로젝트를 만듭니다. Free Plan, 운영 대상과 가까운 지역을 선택합니다. DB 비밀번호는 안전한 곳에 보관합니다.
3. 프로젝트 **Settings → API Keys**에서 publishable key와 secret key를 확인합니다. **Project URL**도 확인합니다. 실제 UI 명칭은 변경될 수 있습니다.
4. **Authentication → Sign In / Providers**에서 신규 사용자 가입(Allow new users to sign up)을 끕니다. 앱에는 공개 가입 화면이나 가입 API를 만들지 않았습니다.

## 2. 환경변수 입력

로컬에 `.env.local`이 이미 있으면 그대로 편집합니다. 없을 때만 `.env.example`을 복사합니다. `.env.local`은 Git에서 제외되어 있습니다. 실제 키를 소스·README·공개 저장소에 붙여넣지 마세요.

| 환경변수 | 값 / 역할 | 공개 여부 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | 공개 가능 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` 키 | 공개 가능, RLS 필수 |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` 키, 클릭 기록 INSERT에만 사용 | **서버 전용** |
| `NEXT_PUBLIC_SITE_URL` | 로컬 `http://localhost:3000`, 운영 실제 Vercel 주소 | 공개 가능 |
| `DEMO_MODE` | 로컬 샘플 확인 `true`, 실제 서비스 **`false`** | 서버 설정 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 기존 anon 키를 쓰는 프로젝트의 대체 값 | 공개 가능 |
| `SUPABASE_SERVICE_ROLE_KEY` | 기존 service_role 키를 쓰는 프로젝트의 대체 값 | **서버 전용** |

새 키와 기존 키를 모두 입력하면 새 키를 우선합니다. secret/service_role에는 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. 서버 전용 클라이언트는 `server-only` 모듈로 분리했습니다.

Supabase 미설정 + `DEMO_MODE=true`일 때만 JSON 샘플을 보여줍니다. 샘플은 저장되지 않으며 로그인·업로드·실제 클릭 전송을 가장하지 않습니다. 실제 연결을 설정하면 DB 오류가 나도 샘플로 조용히 대체하지 않고 오류 화면을 표시합니다. 데모 페이지는 검색엔진 noindex 처리합니다.

**Vercel 업로드의 Origin 검증에 `NEXT_PUBLIC_SITE_URL`을 사용하므로 실제 방문 주소와 정확히 일치해야 합니다.** Preview 배포에서 업로드를 쓰려면 해당 Preview URL로 설정하고 다시 배포하세요.

## 3. SQL migration 적용

처음 사용하는 빈 프로젝트 기준입니다. Dashboard의 **SQL Editor → New query**에서 다음 파일을 순서대로 전체 붙여넣고 Run 합니다.

1. `supabase/migrations/202609100001_schema.sql`
2. `supabase/migrations/202609100002_seed.sql`

첫 파일은 테이블·FK·인덱스·RLS·정책·트리거·RPC·Storage 버킷을 생성합니다. 두 번째는 카테고리 8개, 상품 15개, 영상 6개와 연결·설정을 추가합니다. 샘플에는 가상의 클릭 수나 관리자 계정을 넣지 않았습니다. seed는 같은 ID를 중복 생성하지 않습니다. 구조 migration은 이미 적용한 DB에 수동 재실행하지 마세요.

Supabase CLI를 설치했다면 다음 방식도 가능합니다. `PROJECT_REF`는 Dashboard URL에서 확인한 실제 식별자로 바꿉니다.

```bash
npx supabase login
npx supabase link --project-ref PROJECT_REF
npx supabase db push
```

Docker와 Supabase CLI가 있는 환경에서는 `npx supabase start`, `npx supabase db reset`으로 로컬 전체 스택을 시작할 수 있습니다. 샘플이 migration에 들어 있으므로 별도 seed 경로는 비활성화했습니다.

## 4. DB와 권한 구조

| 테이블 | 역할 | 공개 접근 |
|---|---|---|
| profiles | Auth user ID, role, display_name | 인증된 본인/관리자 읽기만 |
| categories | 카테고리명·주소·순서 | 읽기 |
| products | 상품 설명·추천·이미지·쿠팡 링크·카테고리 | 공개 상품만 읽기 |
| videos | 영상 플랫폼·주소·썸네일·공개·순서 | 공개 영상만 읽기 |
| video_products | 영상–상품 다대다 관계·상품 표시 순서 | 양쪽이 모두 공개인 관계만 읽기 |
| clicks | 상품·영상·유입 origin·UA·시간 | 관리자만 읽기, 서버 키만 쓰기 |
| settings | 단일 공개 사이트 설정 | 읽기 |

`profiles.role` 기본값은 **viewer**입니다. 명세의 기본 운영자 역할은 admin이지만, 계정이 자동으로 관리자가 되는 보안 문제를 막기 위해 **신뢰할 수 있는 SQL 작업으로만 admin을 지정**합니다. 앱에서는 관리자도 자신의 role을 바꿀 수 없습니다. `is_admin()`은 고정 search_path와 인증 ID로 역할을 검사합니다.

상품과 연결 변경은 `save_product`, 영상과 연결 순서는 `save_video` RPC에서 같은 트랜잭션으로 저장됩니다. 하나가 실패하면 모두 롤백합니다. 수정 시 created_at은 유지되고 updated_at 트리거가 갱신됩니다.

`admin_analytics`는 SQL에서 직접 집계하므로 Supabase 기본 1,000행 응답 제한에 통계가 잘리지 않습니다. 관리자가 아닌 사용자는 실행할 수 없습니다. 공개 인기 목록용 `public_popularity`는 최근 30일 공개 상품·영상의 제한된 집계만 반환합니다. 모든 원본 클릭은 공개하지 않습니다.

상품·영상 삭제 시 연결은 삭제되며 클릭의 FK는 NULL로 바뀌어 전체 클릭 수는 보존됩니다. 삭제된 영상의 과거 클릭은 전체 합계에는 남지만 특정 영상 순위에서는 제외됩니다. 카테고리 삭제 시 상품은 미분류로 유지됩니다.

## 5. Storage 확인

첫 migration이 `site-images` **public** 버킷과 관리자 쓰기 정책을 만듭니다. Dashboard → Storage에서 확인하세요.

- 읽기: 공개(초안에 사용한 이미지도 URL을 아는 사람은 읽을 수 있습니다).
- 쓰기·변경·삭제: `profiles.role=admin` 사용자만.
- 버킷 최대 파일 크기 5MB, 허용 JPEG/PNG/WebP.
- 앱 업로드 UI는 Vercel 요청 본문 제한을 고려해 **4MB 이하**로 제한합니다.
- 서버에서 파일 실형식·픽셀 수·애니메이션 여부 검증, EXIF 방향 보정, 최대 1600px, WebP 품질 82로 저장합니다. 원본 EXIF는 보존하지 않습니다.
- 원본 영상은 업로드하지 않습니다. URL만 저장합니다.
- 이미지 파일을 새 UUID로 저장하므로 캐시가 잘못 재사용되지 않습니다. 참조되지 않는 예전 파일은 정기 점검 후 삭제하세요.

## 6. 관리자 계정 만들기

1. Dashboard → **Authentication → Users → Add user**에서 한솔의 실제 이메일/강한 비밀번호로 사용자를 만듭니다. 이메일 확인을 완료하거나 Dashboard에서 확인 처리합니다.
2. 생성된 사용자의 UUID를 복사합니다.
3. SQL Editor에서 아래 `사용자-UUID`를 실제 값으로 바꾸어 실행합니다.

```sql
insert into public.profiles (id, role, display_name)
values ('사용자-UUID'::uuid, 'admin', '한솔')
on conflict (id) do update set role = 'admin', display_name = '한솔';
```

4. `/admin/login`에서 로그인합니다. 실제 Auth user 검증과 role 검사를 통과해야 `/admin`에 들어갑니다.
5. 비밀번호 분실 시 Dashboard에서 재설정 절차를 진행합니다. 서비스에는 일반 회원용 가입·비밀번호 재설정 화면을 두지 않았습니다.

## 7. 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 관리자는 `http://localhost:3000/admin/login`입니다. 환경변수를 바꾼 후 개발 서버를 다시 실행하세요.

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

`npm run start`는 프로덕션 빌드를 먼저 만든 후 실행합니다. 같은 포트의 개발 서버를 먼저 종료하세요.

## 8. 상품 등록

1. 관리자 → **상품 관리 → 상품 등록**.
2. 상품명, 카테고리, 상품 이미지를 입력합니다.
3. 한줄평·상세 설명·추천 이유·추천 포인트(줄바꿈 구분)를 입력합니다.
4. 쿠팡파트너스에서 생성한 **실제 제휴 링크**를 붙여넣습니다. HTTPS의 `coupang.com` 또는 해당 하위 도메인만 허용합니다.
5. 연결할 영상을 검색해 체크합니다.
6. 페이지 주소(비우면 이름으로 생성), 검색 태그, Featured, 공개 여부를 선택하고 저장합니다.
7. 공개하면 즉시 사이트에서 확인할 수 있습니다. 로그인 없이 별도 창에서 확인하세요.

주소(slug)는 고유해야 합니다. 이미 발행한 주소를 바꾸면 이전 URL은 404가 됩니다. 상품 연결 순서는 영상 수정 화면에서 정합니다.

## 9. 영상 등록

1. 관리자 → **영상 관리 → 영상 등록**.
2. Instagram 또는 YouTube, 제목, 실제 원본 영상 URL을 입력합니다.
3. YouTube는 `youtube.com/shorts/…`, `youtube.com/watch?v=…`, `youtu.be/…`를 인식합니다. Instagram은 Reel 주소를 사용합니다.
4. Instagram 썸네일은 직접 업로드합니다. YouTube는 `maxresdefault.jpg`를 자동 제안하며 없으면 직접 업로드할 수 있습니다.
5. 설명을 적고 연결할 상품을 체크합니다. 선택 목록의 위/아래 화살표로 표시 순서를 바꿉니다.
6. 정렬 순서(작을수록 먼저), 등록일, Featured, 공개 여부를 설정하고 저장합니다.

등록일은 **한국 시간** 입력이며 미래 날짜는 표시용입니다. 예약 발행은 제공하지 않습니다. 목록 화면에서 공개 여부·추천 지정·삭제도 할 수 있습니다. 삭제 전 확인창이 뜹니다.

## 10. 사이트 설정과 SNS 변경

관리자 → **사이트 설정**에서 사이트명·설명, Instagram URL, YouTube URL, 문의 이메일, 로고, 제휴 고지, Footer 문구, SEO 기본 제목·설명을 수정하고 **설정 저장**을 누릅니다. 고지는 DB 설정에서 불러옵니다.

첫 seed의 SNS 주소는 플랫폼 첫 화면으로 향합니다. **운영자의 실제 계정 주소로 반드시 변경하세요.** 샘플 상품 사진은 Unsplash의 분위기 연출용이며 실제 상품 사진이 아닙니다. 설명·상품 사진·영상·쿠팡 링크를 모두 운영 콘텐츠로 교체하세요. 공개 이미지에 사적인 파일을 올리지 마세요.

## 11. Analytics와 클릭 처리

- `/go/[상품 UUID]`는 공개 상품을 확인하고, 클릭 INSERT를 시도한 뒤 허용된 쿠팡 주소로 302 이동합니다.
- 영상 상세 상품 CTA는 `?video=영상 UUID`를 전달합니다. 공개된 실제 관계가 있을 때만 video_id로 인정합니다.
- IP는 애플리케이션 DB에 저장하지 않습니다. Referer는 origin만 저장하며 쿼리·상세 경로를 제거합니다. UA는 최대 350자입니다.
- HEAD, 알려진 봇과 prefetch 요청은 클릭 기록에서 제외합니다. 중복 클릭은 각각 세므로 사용자·구매·전환 수가 아닙니다.
- 클릭 INSERT가 실패해도 상품 이동은 유지합니다. 서버 로그에는 에러 코드/설정 안내만 남기고 키와 방문자 원문을 출력하지 않습니다.
- 사이트 설정 화면에서 서버 클릭 키 미등록 상태를 안내합니다.
- 오늘·7일·30일은 Asia/Seoul의 자정 기준이며 7일/30일에 오늘을 포함합니다.

## 12. Vercel 환경변수와 배포

현재 운영 주소: https://hottemlog.vercel.app

GitHub `gksthf635-gif/hottemlog`의 `main` 브랜치가 Vercel `hottemlog/hottemlog`에 연결되어 push하면 자동 배포됩니다. Production 환경변수 5개가 등록되어 있으며 `SUPABASE_SECRET_KEY`는 Secret으로 저장합니다. Preview는 운영 DB에 자동 연결하지 않았으므로 필요할 때 별도 테스트 DB 환경변수를 설정하세요.

1. 현재 프로젝트를 본인의 Git 저장소에 올립니다. `.env.local`이 포함되지 않는지 확인합니다.
2. [Vercel](https://vercel.com/) → **Add New → Project**에서 저장소를 가져옵니다.
3. Framework Preset은 **Next.js**, Node.js는 24.x 또는 지원되는 22.12+를 사용합니다.
4. Environment Variables에 위 환경변수를 등록합니다. Production과 Preview의 값을 용도에 맞게 분리합니다. `DEMO_MODE=false`를 사용합니다.
5. `NEXT_PUBLIC_SITE_URL=https://실제프로젝트.vercel.app`로 등록합니다. `hottemlog.vercel.app`의 사용 가능 여부는 Vercel에서 확인해야 합니다.
6. Supabase Authentication의 Site URL을 같은 운영 주소로 바꾸고, 필요한 Redirect URL만 허용합니다. 공개 가입은 계속 비활성화합니다.
7. Deploy를 누릅니다. Install `npm install`, Build `npm run build`가 실행됩니다. 환경변수 변경 후에는 **Redeploy**가 필요합니다.
8. `/`, `/admin/login`, 실제 이미지 업로드, 상품/영상 공개, 쿠팡 이동 후 Analytics 증가를 점검합니다.

실제 Supabase 프로젝트에 스키마와 샘플 데이터 적용을 완료했습니다. 공개 읽기·관리자 전용 RLS, Storage 업로드/공개 조회, 클릭 기록을 실제 API로 검증했습니다. 공개 가입은 비활성화되어 있으며 관리자 Auth 계정 생성과 역할 부여가 필요합니다. SQL Editor로 스키마를 적용했으므로 이후 CLI migration을 사용할 때는 원격 migration 이력을 먼저 정리해야 합니다.

## 13. 백업과 운영

- 운영 데이터를 수정하기 전에 DB와 Storage를 별도로 백업하세요. Free Plan의 자동 백업을 전제로 하지 않습니다.
- CLI 예: `npx supabase db dump --linked -f backup-schema.sql`, `npx supabase db dump --linked --data-only -f backup-data.sql`. 파일에는 운영 데이터가 있으므로 비공개 저장소에 보관합니다. Storage 파일은 별도 보관해야 합니다.
- 복구는 별도 테스트 프로젝트에서 먼저 검증합니다. 새 DB 스키마 변경은 기존 migration을 덮어쓰지 말고 새 migration 파일로 만듭니다.
- 정기적으로 오래된 클릭·사용하지 않는 이미지·깨진 원본 영상/쿠팡 링크를 점검합니다. 원본 클릭 삭제는 전체 통계에 영향을 주므로 백업과 보관 기준을 먼저 정하세요.
- 개인정보처리방침/이용약관은 현재 코드의 동작을 반영한 기본 문안입니다. 실제 운영자 정보, 보관 기간, 처리 지역·위탁 상황이 확정되면 실제 운영 방침에 맞게 검토·수정하세요.
- 관리자 이메일/비밀번호와 서버 키를 주기적으로 점검하고 유출 시 즉시 교체합니다. Realtime은 사용하지 않습니다.
- 목록 데이터는 서버에서 500개씩 페이지 조회하여 전체 검색에 사용합니다. 수만 건으로 커지면 DB 검색·페이지 조회로 이전하세요. 현재 서비스 규모에 불필요한 검색 서비스를 추가하지 않았습니다.

## 14. 검증

```bash
npm run test
npm run test:db
npx playwright install chromium
npm run test:e2e
npm run lint
npm run build
```

- 단위 검사: YouTube ID, 악성 쿠팡/이미지 URL, 입력 검증, 한국어 검색, 한국 시간 경계.
- DB 검사: PGlite 실제 PostgreSQL 엔진에 migration 적용, 익명/일반 사용자/관리자 RLS, 권한 상승 차단, 트랜잭션 롤백, Storage 정책, 1,205건 집계, 삭제 후 통계 보존.
- 브라우저: 360/390/412/768/1440px, 검색→상품 상세, 필터, 영상 출처 CTA, 보호 경로, SEO·정책·404.
- DB 검사의 Auth/Storage 스키마는 테스트용 최소 fixture입니다. 외부 Supabase Auth·Storage 서버와 Vercel 업로드 동작을 대신 검증하는 것은 아닙니다. 실제 키 연결 후 12번의 운영 확인을 진행하세요.

## 참고 문서

- [Next.js 설치 및 요구사항](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js 16의 Proxy와 ESLint](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side)
- [Supabase API 키](https://supabase.com/docs/guides/api/api-keys)

추후 확장: 한국어 DB 검색, 콘텐츠 예약 발행, 클릭 중복 완화, 영상 플랫폼 추가, 콘텐츠별 OG 이미지.

## 관리자 통합 운영 (v2)

`/admin/contents` → **새 콘텐츠 등록** → 영상 정보 → 상품 1개 이상 → **등록하기**.
필수 입력은 플랫폼, 영상 URL, 제목, 각 상품명과 쿠팡파트너스 링크뿐입니다.
이미지·카테고리·한줄평·게시일·공개·Featured는 선택이며, 게시일은 미입력 시 저장 시각(KST 표시)을 사용합니다.
기존 상품 검색으로 재사용할 수 있고 상품 정보 수정은 같은 상품을 쓰는 모든 영상에 반영됩니다.
공개 저장은 연결 상품도 공개하며 비공개 전환은 공유 상품을 숨기지 않습니다.
콘텐츠 삭제는 영상과 관계만 지우며 상품과 클릭 기록을 보존합니다.
기존 상품/영상 개별 관리와 카테고리는 설정의 보조 관리에서 접근합니다.

추가 migration `202609110001_content_editor.sql`은 기존 테이블이나 데이터를 바꾸지 않고 관리자용 저장·공개 함수 2개만 추가합니다. 통합 저장은 한 트랜잭션으로 실행합니다. 기존 SQL Editor 방식에서는 이 추가 파일만 적용하며 초기 schema/seed를 재실행하지 않습니다.
YouTube/Instagram API, 제목·게시시간 자동 조회는 포함하지 않습니다. YouTube ID 기반 썸네일만 지원합니다.
