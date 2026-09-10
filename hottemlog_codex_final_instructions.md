# 핫템로그 Codex 최종 개발 지시서

## 0. 프로젝트 개요

프로젝트명: **핫템로그**

영문 표기: **Hottem Log**

권장 코드 식별자: `hottemlog`

핫템로그는 인스타그램 릴스와 유튜브 쇼츠에서 소개한 상품을 한곳에 모아 보여주고, 사용자가 영상에서 본 상품을 빠르게 찾아 쿠팡파트너스 링크로 이동할 수 있게 하는 **영상 기반 상품 큐레이션 웹사이트**다.

핵심 사용자 경험은 다음과 같다.

> 영상에서 봤던 상품 → 핫템로그에서 찾기 → 쿠팡에서 확인

이 사이트는 일반적인 쇼핑몰이 아니다.  
Instagram / YouTube 콘텐츠를 보조하는 Product Hub 역할을 한다.

---

# 1. 최종 기술 스택

다음 기술을 기준으로 실제 서비스 가능한 상태까지 개발한다.

- Next.js 최신 안정 버전
- TypeScript
- App Router
- Tailwind CSS
- Supabase
  - PostgreSQL
  - Auth
  - Storage
  - Row Level Security
- Lucide Icons
- Vercel 배포 기준
- 모바일 우선 Responsive Design

불필요한 라이브러리는 최소화한다.

가능하면 Server Component를 우선 사용하고, 검색/필터/폼 등 상호작용이 필요한 부분만 Client Component로 만든다.

---

# 2. 최종 인프라 방향

## Vercel

프론트엔드 및 Next.js 서버 기능은 Vercel에 배포한다.

커스텀 도메인은 당장 사용하지 않는다.

기본적으로 다음과 같은 Vercel 기본 도메인을 사용한다고 가정한다.

`hottemlog.vercel.app`

단 실제 프로젝트 slug 사용 가능 여부에 따라 달라질 수 있다.

---

## Supabase

한솔 개인 계정에서 **핫템로그 전용 Supabase 프로젝트를 별도로 생성하여 사용한다.**

초기에는 Supabase Free Plan을 사용한다고 가정한다.

Supabase를 사용하는 이유:

- 한솔이 코드를 수정하지 않고 관리자페이지에서 상품 등록 가능
- 영상 추가/수정 가능
- 상품과 영상 연결 가능
- 이미지 업로드 가능
- 쿠팡 링크 관리 가능
- 클릭 통계 저장 가능
- 관리자 로그인 가능

---

# 3. 디자인 컨셉

핫템로그는 여성 사용자에게 친근하면서도 지나치게 유아틱하지 않은 느낌으로 제작한다.

핵심 디자인 키워드:

- Soft Pink
- Clean
- Minimal
- Creator Storefront
- Lifestyle
- Curated
- Warm
- Premium Casual

전체적으로 **연핑크 + 화이트 기반**으로 제작한다.

촌스러운 진한 핑크 사용 금지.

대형 쇼핑몰처럼 보이지 않도록 한다.

---

# 4. 컬러 시스템

기본 Background:

`#FFF9FB`

Main Pink:

`#F8C8D8`

Secondary Pink:

`#FCE4EC`

Accent Pink:

`#F48FB1`

Deep Text:

`#2F2F33`

Sub Text:

`#77777D`

Border:

`#F0DFE5`

Card:

`#FFFFFF`

Soft Gray:

`#F7F7F8`

CTA 버튼은 Accent Pink 또는 조금 더 진한 Pink 계열을 사용하되 과하지 않게 한다.

---

# 5. 디자인 세부 지침

전체적으로 rounded UI를 사용한다.

카드:

- border-radius 18~24px

버튼:

- border-radius 12~16px

검색창:

- border-radius 18px 이상

그림자:

- 아주 약한 shadow만 사용
- 강한 그림자 금지

Gradient:

- 필요할 경우 Pink → White 정도로 매우 미세하게 사용
- 큰 영역 전체를 진한 핑크로 채우지 않는다

화이트 공간을 충분히 확보한다.

---

# 6. Typography

한국어 가독성 최우선.

가능하면 Pretendard 또는 안정적인 system font stack 사용.

제목:

- font-weight 700

본문:

- 400~500

카드 제목:

- 600

과도하게 얇은 폰트 사용 금지.

---

# 7. 브랜드 요소

상단 텍스트 로고:

**핫템로그**

작은 영문 서브텍스트:

**HOT ITEM LOG**

또는

**Hottem Log**

로고 주변에 작은 Sparkle 또는 Heart 계열 아이콘을 최소한으로 사용할 수 있다.

과한 캐릭터 스타일 금지.

---

# 8. 브랜드 카피

메인 카피:

**“영상에서 본 핫템, 여기 다 있어요.”**

보조 카피:

**“인스타 릴스와 유튜브 쇼츠에서 소개한 추천템을 한곳에 모았습니다.”**

추가 카피:

- “오늘의 핫템을 기록합니다.”
- “한솔이 골라본 요즘 핫템.”
- “영상 댓글에서 많이 물어본 제품.”
- “요즘 잘 쓰는 제품만 모았어요.”
- “한솔이 직접 써보고, 찾아보고, 소개한 핫템을 기록합니다.”

---

# 9. 핵심 사용자 흐름

## 방문자

1. Instagram Reel 또는 YouTube Shorts 시청
2. 프로필/설명란의 핫템로그 링크 클릭
3. 홈페이지 진입
4. 검색 또는 최신 영상 탐색
5. 영상 또는 상품 선택
6. 영상에 나온 상품 확인
7. “쿠팡에서 보기” 클릭
8. 쿠팡파트너스 링크로 이동

---

## 관리자

1. `/admin/login` 접속
2. 관리자 이메일/비밀번호 로그인
3. `/admin` 이동
4. 영상 등록
5. 상품 등록
6. 영상과 상품 연결
7. 이미지 업로드
8. 쿠팡파트너스 링크 입력
9. 공개 여부 설정
10. 저장
11. 홈페이지 즉시 반영

---

# 10. Header

Header 구성:

- 핫템로그 로고
- 검색 아이콘
- Instagram 아이콘
- YouTube 아이콘

모바일에서는 간결하게 유지한다.

---

# 11. 메인 Hero

첫 화면에서 사용자가 사이트 목적을 즉시 이해해야 한다.

메인 카피:

**“영상에서 본 핫템, 여기 다 있어요.”**

보조 카피:

**“인스타 릴스와 유튜브 쇼츠에서 소개한 추천템을 한곳에 모았습니다.”**

검색창 placeholder:

**“어떤 제품을 찾고 계세요?”**

CTA:

**“최신 핫템 보기”**

Hero에는 매우 연한 Pink Gradient 사용 가능.

---

# 12. 메인 페이지 구성

URL:

`/`

섹션 순서:

1. Header
2. Hero
3. 최신 영상
4. 요즘 많이 보는 핫템
5. 카테고리
6. Instagram에서 소개한 제품
7. YouTube에서 소개한 제품
8. 전체 추천템
9. 브랜드 소개
10. Footer

---

# 13. 최신 영상 영역

섹션 제목:

**“방금 올라온 핫템”**

또는

**“최신 영상”**

영상 카드 구성:

- thumbnail
- platform badge
- title
- 상품 개수
- 등록일
- 상세보기

Instagram / YouTube Shorts의 9:16 세로 영상 비율을 자연스럽게 보여준다.

모바일:

- 1~2열

Desktop:

- 3~4열

---

# 14. 플랫폼 Badge

지원 플랫폼:

- Instagram Reel
- YouTube Shorts

Instagram Badge:

- Soft Pink / Purple

YouTube Badge:

- White / Soft Red

전체 Pink 디자인과 충돌하지 않도록 채도를 낮춘다.

향후 TikTok 등을 추가할 수 있도록 platform 필드는 확장 가능한 구조로 설계한다.

---

# 15. 상품 카드

상품 카드 구성:

- 상품 이미지
- 카테고리 Badge
- 상품명
- 한솔의 한줄평
- 쿠팡 CTA

CTA 문구:

**“쿠팡에서 보기”**

또는

**“가격 확인하기”**

상품 카드가 일반 쇼핑몰 리스트처럼 보이지 않도록 한다.

“추천 콘텐츠” 느낌을 유지한다.

---

# 16. 한솔의 한줄평

상품마다 짧은 큐레이션 문구를 표시한다.

예:

- “요즘 집에서 제일 자주 쓰는 청소템”
- “가격 생각하면 진짜 괜찮았어요.”
- “영상 댓글에서 제일 많이 물어본 제품”

이 영역을 핫템로그의 핵심 차별화 요소로 사용한다.

---

# 17. 카테고리

초기 카테고리:

- 전체
- 생활
- 주방
- 식품
- 뷰티
- 육아
- 반려동물
- 디지털
- 기타

UI:

- horizontal pill filter
- 모바일 좌우 스크롤 지원

관리자페이지에서 카테고리 CRUD 가능하게 한다.

---

# 18. 영상 상세 페이지

URL:

`/video/[slug]`

구성:

- 영상 썸네일
- 플랫폼 표시
- 영상 제목
- 간단 설명
- 원본 영상 보기 버튼
- “이 영상에 나온 제품”
- 상품 카드 목록

한 영상에 여러 상품 연결 가능.

Instagram 버튼:

**“인스타그램에서 영상 보기”**

YouTube 버튼:

**“유튜브에서 영상 보기”**

새 창으로 연다.

---

# 19. 상품 상세 페이지

URL:

`/product/[slug]`

구성:

- 큰 상품 이미지
- 상품명
- 카테고리
- 한솔의 한줄평
- 상세 설명
- 추천 이유
- 추천 포인트
- 관련 영상
- 쿠팡 CTA
- 같은 카테고리 추천 상품

관련 영상 영역 제목:

**“이 제품이 나온 영상”**

---

# 20. 검색

검색 대상:

- 상품명
- 상품 설명
- 영상 제목
- 영상 설명
- 태그
- 카테고리

검색 URL 예:

`/search?q=청소기`

결과 구분:

- 영상
- 상품

검색 결과 없음:

**“찾으시는 핫템이 아직 없어요.”**

보조 문구:

**“다른 검색어로 다시 찾아보세요.”**

사용자가 원하는 제품까지 3번 이상 클릭하지 않도록 한다.

---

# 21. Supabase Auth

일반 회원가입 기능은 만들지 않는다.

관리자는 한솔 1명을 기본 운영자로 가정한다.

관리자 로그인:

`/admin/login`

Supabase Auth 이메일/비밀번호 방식을 사용한다.

인증되지 않은 사용자가 `/admin` 하위 경로 접근 시 `/admin/login`으로 redirect한다.

---

# 22. 관리자 권한

`profiles` 테이블에 `role` 필드를 둔다.

기본 role:

`admin`

단순 로그인 여부가 아니라 role을 확인해 관리자 권한을 판별한다.

공개 회원가입 페이지는 구현하지 않는다.

관리자 계정 생성 방법은 README에 작성한다.

---

# 23. 관리자 페이지

URL:

`/admin`

관리자 메뉴:

- Dashboard
- Videos
- Products
- Categories
- Analytics
- Settings
- Logout

실제 사용 가능한 관리자 UI를 구현한다.

---

# 24. 관리자 Dashboard

표시:

- 총 영상 수
- 총 상품 수
- 총 클릭 수
- 오늘 클릭 수
- 최근 7일 클릭
- 최근 등록 영상
- 인기 상품 TOP 5
- 인기 영상 TOP 5

---

# 25. 영상 관리

URL:

`/admin/videos`

기능:

- 목록
- 추가
- 수정
- 삭제
- 공개/비공개
- Featured 지정
- 영상 정렬
- 상품 연결

필드:

- id
- title
- slug
- platform
- video_url
- thumbnail_url
- description
- published
- featured
- published_at
- created_at
- updated_at

---

# 26. 상품 관리

URL:

`/admin/products`

기능:

- 상품 생성
- 수정
- 삭제
- 공개/비공개
- Featured 지정
- 영상 연결
- 이미지 업로드

필드:

- id
- name
- slug
- image_url
- short_description
- description
- recommendation
- recommend_points
- affiliate_url
- category_id
- published
- featured
- created_at
- updated_at

---

# 27. 영상-상품 연결

many-to-many 관계로 설계한다.

테이블:

`video_products`

필드:

- id
- video_id
- product_id
- sort_order

한 영상에 여러 상품 연결 가능.

한 상품이 여러 영상에 등장 가능.

관리자 UI에서 검색 또는 체크박스 방식으로 쉽게 연결 가능하게 한다.

---

# 28. Categories 테이블

테이블:

`categories`

필드:

- id
- name
- slug
- sort_order
- created_at

---

# 29. Profiles 테이블

테이블:

`profiles`

필드:

- id
- role
- display_name
- created_at
- updated_at

Supabase Auth user id와 연결한다.

---

# 30. Settings 테이블

테이블:

`settings`

관리자가 수정 가능한 항목:

- site_name
- site_description
- instagram_url
- youtube_url
- affiliate_disclosure
- footer_text
- default_seo_title
- default_seo_description
- logo_url
- contact_email

---

# 31. Click Tracking

쿠팡파트너스 링크는 가능하면 직접 열지 않고 내부 redirect route를 거친다.

예:

`/go/[productId]`

처리:

1. product 조회
2. clicks INSERT
3. affiliate_url로 redirect

영상 상세페이지를 통해 클릭한 경우 `video_id`도 기록한다.

`clicks` 테이블:

- id
- product_id
- video_id nullable
- referrer nullable
- user_agent nullable
- created_at

IP 주소는 저장하지 않는다.

---

# 32. Analytics

관리자 Analytics에서 다음 제공:

기간 필터:

- 오늘
- 7일
- 30일
- 전체

표시:

- 총 클릭
- 상품별 클릭
- 영상별 클릭
- 카테고리별 클릭
- 날짜별 클릭 그래프
- TOP 10 상품
- TOP 10 영상

Realtime은 필요하지 않다.

---

# 33. Supabase Storage

Storage에 저장:

- 상품 이미지
- Instagram 썸네일
- 로고
- 필요한 사이트 이미지

YouTube 썸네일은 외부 YouTube thumbnail URL을 우선 사용해 Storage 사용량을 줄인다.

관리자페이지에서 이미지 업로드 UI 구현.

이미지는 가능한 한 적절한 크기로 최적화한다.

---

# 34. YouTube 썸네일

YouTube URL에서 video ID를 추출하는 helper 작성.

지원 형식:

- youtube.com/shorts/
- youtube.com/watch?v=
- youtu.be/

가능하면 다음 URL 생성:

`https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg`

자동 썸네일 실패 시 직접 업로드 가능하게 한다.

---

# 35. Instagram 썸네일

Instagram 자동 썸네일 추출은 필수 구현하지 않는다.

관리자가 직접 이미지 업로드하는 방식을 기본으로 한다.

---

# 36. 쿠팡 링크 처리

외부 링크는 다음 속성을 적절히 적용한다.

- `target="_blank"`
- `rel="sponsored noopener noreferrer"`

내부 `/go/[productId]` redirect를 사용하는 경우에도 최종 목적지는 쿠팡 affiliate_url이다.

---

# 37. 쿠팡파트너스 고지

사이트 하단 및 적절한 위치에 제휴 고지를 표시한다.

기본 문구:

**“이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.”**

하드코딩하지 말고 Settings에서 수정 가능하게 한다.

---

# 38. Footer

구성:

- 핫템로그
- 사이트 소개
- Instagram
- YouTube
- 제휴 고지
- 개인정보처리방침
- 이용약관
- 문의

---

# 39. SEO

각 페이지 metadata 구현.

메인 title:

**핫템로그 | 영상에서 본 추천템 모음**

description:

**인스타 릴스와 유튜브 쇼츠에서 소개한 추천 제품을 한곳에서 확인하세요.**

상품 페이지:

- 상품명 기반 metadata

영상 페이지:

- 영상 제목 기반 metadata

추가 구현:

- OpenGraph
- sitemap.xml
- robots.txt
- canonical 고려

---

# 40. 반응형

Mobile First.

최소 고려 폭:

- 360px 이상

Tablet / Desktop 대응.

모바일에서는 CTA 버튼을 충분히 크게 만든다.

Desktop max-width:

- 1200~1280px 정도

상품:

- 모바일 1~2열
- PC 3~4열

영상:

- 모바일 1~2열
- PC 3~4열

---

# 41. Micro Interaction

Hover:

- 카드 약간 상승

Button:

- 미세한 색상 변화

Image:

- 약한 scale

transition:

- 약 150~250ms

과도한 animation 금지.

---

# 42. UX State

반드시 구현:

- Loading State
- Skeleton
- Empty State
- Error State
- 404
- Form validation
- 삭제 확인 modal
- 저장 완료 toast
- 실패 toast

Skeleton:

- ProductCardSkeleton
- VideoCardSkeleton

404 문구:

**“이 핫템은 찾을 수 없어요.”**

버튼:

**“핫템로그 홈으로”**

---

# 43. 보안

Supabase RLS를 반드시 적용한다.

공개 사용자:

- published=true인 videos 읽기
- published=true인 products 읽기
- categories 읽기
- 공개 가능한 settings 읽기

관리자:

- INSERT
- UPDATE
- DELETE

`clicks`:

- 일반 사용자 직접 조회 불가
- 관리자만 Analytics에서 조회

민감한 Supabase secret/service role key는 절대 클라이언트에 노출하지 않는다.

민감한 작업은 Server Route / Server Action에서 수행한다.

---

# 44. Database 테이블

필수 테이블:

- profiles
- videos
- products
- categories
- video_products
- clicks
- settings

필요한 항목:

- Foreign Key
- Unique Constraint
- Index
- RLS
- Policy
- Trigger

---

# 45. Supabase Migration

`supabase/migrations` 폴더를 만든다.

Migration에 포함:

- tables
- indexes
- foreign keys
- RLS
- policies
- triggers
- seed data

새 Supabase 프로젝트에서도 migration 적용만으로 같은 DB 구조를 만들 수 있어야 한다.

---

# 46. Seed Data

초기 UI 테스트를 위해 샘플 데이터 제공.

영상:

- 최소 6개

상품:

- 최소 15개

카테고리:

- 생활
- 주방
- 식품
- 뷰티
- 육아
- 반려동물
- 디지털
- 기타

샘플 영상과 상품 연결 포함.

실제 특정 브랜드 대신 일반적인 샘플 이름 사용.

예:

- 무선 미니 청소기
- 주방 실리콘 정리함
- 반려동물 털 제거 브러시
- 무선 가습기
- 휴대용 선풍기
- 수납 정리함
- 텀블러
- 무선 충전기

---

# 47. 환경변수

`.env.example` 생성.

예:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

실제 Supabase 최신 권장 환경변수 명칭과 사용 방식을 확인하여 필요하면 안전하게 조정한다.

Secret / Service Role 계열 Key는 서버에서만 사용한다.

---

# 48. 프로젝트 구조

정돈된 구조를 사용한다.

예:

```text
app/
  admin/
  api/
  product/
  video/
  search/

components/
  layout/
  product/
  video/
  search/
  admin/

lib/
  supabase/
  data/
  auth/
  analytics/
  utils/

types/

supabase/
  migrations/

public/
```

불필요하게 과도한 추상화를 만들지 않는다.

---

# 49. 데이터 접근 레이어

UI 컴포넌트가 Supabase query를 여기저기 직접 작성하지 않도록 한다.

`lib/data`에 재사용 가능한 데이터 접근 함수를 만든다.

예:

- getProducts()
- getProductBySlug()
- getFeaturedProducts()
- getVideos()
- getVideoBySlug()
- getProductsByVideo()
- getVideosByProduct()
- searchProducts()
- searchVideos()
- getPopularProducts()
- getPopularVideos()

---

# 50. 관리자 설정

Settings에서 다음 변경 가능:

- 사이트명
- 사이트 설명
- Instagram URL
- YouTube URL
- 제휴 고지
- Footer 문구
- SEO 기본 title
- SEO 기본 description
- 로고
- 문의 이메일

---

# 51. 관리자 운영 편의성

한솔이 개발 지식이 없다는 전제로 관리자 UI를 만든다.

상품 등록 화면은 다음 순서가 직관적이어야 한다.

1. 상품명
2. 카테고리
3. 상품 이미지
4. 한솔의 한줄평
5. 상세 설명
6. 추천 포인트
7. 쿠팡파트너스 링크
8. 연결할 영상
9. 공개 여부
10. 저장

영상 등록 화면:

1. 플랫폼 선택
2. 영상 제목
3. 영상 URL
4. 썸네일
5. 설명
6. 연결할 상품
7. Featured
8. 공개 여부
9. 저장

---

# 52. 무료 플랜 최적화

Supabase Free Plan을 기준으로 불필요한 사용량을 줄인다.

- YouTube 썸네일 외부 URL 사용
- 이미지 크기 최적화
- 불필요한 로그 저장 금지
- IP 저장 금지
- Realtime 사용 금지
- 대용량 원본 영상 업로드 금지
- 사이트에는 영상 자체를 저장하지 않고 SNS 원본 URL만 저장

---

# 53. 하지 말아야 할 디자인

금지:

- 쿠팡 UI 복제
- 대형 쇼핑몰 스타일
- 빨간색 중심 디자인
- 과도한 Banner
- 과도한 Gradient
- 3D Icon 남발
- Neon 색상
- 검은 배경
- 너무 작은 텍스트
- 복잡한 Mega Menu
- 기능 테스트용으로 보이는 조잡한 UI

---

# 54. 개발 완료 조건

다음 기능이 모두 실제로 작동해야 한다.

1. 메인페이지
2. 최신 영상
3. 인기 상품
4. 상품 목록
5. 영상 목록
6. 카테고리 필터
7. 검색
8. 상품 상세
9. 영상 상세
10. 관련 상품
11. 관련 영상
12. Instagram 링크
13. YouTube 링크
14. 쿠팡 redirect
15. 클릭 로그
16. 관리자 로그인
17. 영상 CRUD
18. 상품 CRUD
19. 카테고리 CRUD
20. 영상-상품 연결
21. 이미지 업로드
22. Analytics
23. Settings
24. 공개/비공개
25. Featured
26. 반응형
27. SEO metadata
28. sitemap
29. robots
30. 404
31. Empty State
32. Loading State
33. Error State
34. 쿠팡파트너스 고지
35. RLS
36. migration
37. seed data
38. README
39. `.env.example`
40. `npm run lint` 성공
41. `npm run build` 성공
42. TypeScript 오류 없음
43. Vercel 배포 가능한 상태

---

# 55. Codex 작업 방식

중요.

설명만 작성하고 멈추지 않는다.

실제 프로젝트 파일을 생성하고 코드를 작성한다.

합리적으로 판단 가능한 부분은 질문하지 말고 직접 결정한다.

Mock 화면만 만든 뒤 완료 처리하지 않는다.

TODO만 남겨놓고 완료 처리하지 않는다.

Supabase 연동 구조를 실제 코드로 완성한다.

환경변수가 없어 실제 외부 Supabase 연결 테스트가 불가능한 경우에도:

- 전체 코드 구조
- SQL migration
- Auth 로직
- Storage 로직
- CRUD
- RLS
- Admin route 보호
- redirect route
- Analytics query
- README

까지 완성한다.

---

# 56. 반드시 실행할 명령

구현 완료 후 반드시 직접 실행한다.

```bash
npm install
npm run lint
npm run build
```

오류가 발생하면 원인을 찾아 수정하고 다시 실행한다.

Build가 성공할 때까지 반복한다.

---

# 57. README 필수 내용

README.md에 다음을 초보자도 따라할 수 있게 작성한다.

1. 프로젝트 소개
2. 주요 기능
3. 기술 스택
4. 폴더 구조
5. Supabase 새 프로젝트 생성
6. 환경변수 입력
7. SQL migration 적용
8. Storage bucket 설정
9. 관리자 계정 생성
10. profiles admin role 지정
11. 로컬 실행
12. 상품 등록 방법
13. 영상 등록 방법
14. Instagram URL 변경 방법
15. YouTube URL 변경 방법
16. 쿠팡 링크 등록 방법
17. 이미지 업로드 방법
18. Vercel 환경변수 등록
19. Vercel 배포
20. 운영 중 백업/관리 기본 방법

---

# 58. 최종 UI 검수

다음 화면 폭을 확인한다.

- 360px 모바일
- 일반 iPhone 폭
- 일반 Android 폭
- Tablet
- Desktop

특히 모바일 첫 화면에서 다음이 즉시 보여야 한다.

- 핫템로그 브랜드명
- 사이트 설명
- 검색창
- 최신 영상 일부

사용자가 3초 안에 다음을 이해해야 한다.

**“인스타나 유튜브 영상에서 봤던 상품을 찾는 곳이구나.”**

---

# 59. 최종 결과 보고 형식

모든 구현이 끝나면 다음 형식으로 결과를 보고한다.

- 구현 완료 기능
- 주요 페이지
- 프로젝트 구조
- DB 구조
- Supabase 구조
- 관리자 로그인 방식
- 상품 등록 방법
- 영상 등록 방법
- 이미지 업로드 방법
- 환경변수
- 실행 방법
- Vercel 배포 방법
- 테스트 결과
- `npm run lint` 결과
- `npm run build` 결과
- 남아 있는 제한사항
- 향후 확장 아이디어

단순히 “완료했습니다”라고 하지 말고 실제 구현 상태를 구체적으로 보고한다.
