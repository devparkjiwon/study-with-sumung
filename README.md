# 🐾 스터디윗뭉 (Study with Mung) — 상명대 시험기간 집중 타이머 & 랭킹

> **"수뭉이가 지켜보고 있어! 👀"**  
> **"마우스를 움직이는 순간, 집중 기록이 종료됩니다."**

**스터디윗뭉(Study with Mung)**은 상명대학교 마스코트 **'수뭉이'**와 함께하는 대학생 시험기간 집중 타이머 & 캠퍼스 실시간 랭킹 서비스입니다.  
데스크톱 앱(Electron)뿐만 아니라 **Netlify 서버리스 Functions 및 클라우드 데이터베이스(DB)**와 연동되어 웹 배포까지 완벽하게 지원합니다.

---

## 🌟 주요 기능

### 1. 실시간 집중 타이머
- **단조 증가 시계 (`performance.now()`)**: 브라우저 지연이나 렌더링 주기에 영향받지 않는 초정밀 타이머 (`00:00:00`)
- **3초 카운트다운**: 시작 클릭 오동작 방지 좌표 스냅샷 캡처
- **25분/50분/1시간 뽀모도로 마일스톤**: 폭죽(Confetti) 및 축하 연출

### 2. 마우스 움직임 감지 & 특정 앱 허용 (화이트리스트)
- **전역 마우스 감지**: 앱 밖에서도 컴퓨터 전체의 커서 좌표 추적
- **3px 미세 흔들림 보정**: 센서 노이즈 무시 (설정에서 1px~20px 조절 가능)
- **🛡️ 특정 앱/웹사이트 허용 (화이트리스트)**:
  - 필기(Notion), 코딩(VS Code), 시험 족보(PDF), e-Campus, ChatGPT 등을 사용할 때는 마우스를 움직여도 집중 타이머가 중단되지 않고 유지됩니다!
  - 사용자가 원하는 프로그램을 자유롭게 추가/삭제 가능

### 3. 👤 학생 로그인 & 회원가입 시스템
- 상명대 학번, 닉네임, 소속 학과, 비밀번호 기반의 실제 계정 관리
- 클라우드 DB에 계정 및 누적 기록 영구 연동

### 4. 🏆 상명대 학우 실시간 DB 랭킹
- **실시간 순위 연동**: 실제 데이터베이스에 기록된 학우들의 집중 시간을 기반으로 실시간 랭킹 산출
- 내가 공부를 진행할수록 내 순위가 실시간으로 1등을 향해 상승!
- **학과 대항전 탭**: 소프트웨어학과 vs 시각디자인과 vs 경영학부 등 학과별 누적 시간 대항전 지원

---

## ☁️ Netlify 배포 방법

본 프로젝트에는 Netlify 배포용 설정(`netlify.toml`)과 서버리스 API(`netlify/functions/api.ts`, `db.ts`)가 완벽히 구성되어 있어 원클릭으로 배포할 수 있습니다.

### 방법 1. GitHub 연동을 통한 자동 배포 (추천 ⭐)
1. GitHub에 본 프로젝트 코드를 푸시합니다.
2. [Netlify](https://www.netlify.com/) 로그인 후 **「Add new site」 > 「Import an existing project」**를 선택합니다.
3. GitHub 저장소를 선택하면 `netlify.toml` 설정이 자동으로 감지됩니다:
   - **Build command**: `npm run build:renderer`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
4. **「Deploy Site」**를 누르면 끝! 웹사이트 주소(예: `https://study-with-mung.netlify.app`)가 생성되고 API와 프론트엔드가 즉시 가동됩니다.

### 방법 2. Netlify CLI로 로컬에서 바로 배포
```bash
# 1. 렌더러 빌드
npm run build:renderer

# 2. Netlify 배포 (Netlify 계정 로그인 필요)
npx netlify deploy --prod
```

---

## 🗄️ 데이터베이스 (DB) 안내

- **기본 동작**: 별도 DB 연결 없이 Netlify에 배포해도 자체 내장된 서버리스 스토리지 엔진에 의해 회원가입, 로그인, 세션 저장, 실시간 랭킹이 즉시 정상 작동합니다.
- **Supabase / Neon / PostgreSQL 연동 방법**:
  1. 제공된 [schema.sql](file:///c:/gemini/schema.sql) 스크립트를 Supabase 또는 Neon의 SQL Editor에 붙여넣고 실행합니다.
  2. Netlify 대시보드의 **[Site settings] > [Environment variables]**에 접속합니다.
  3. `DATABASE_URL`에 본인의 DB 연결 문자열을 등록하시면 클라우드 PostgreSQL과 완벽 동기화됩니다.

---

## 💻 데스크톱 앱 로컬 실행 방법

Windows 데스크톱 앱으로 실행하시려면 터미널에서 다음 명령어를 입력하세요:

```powershell
npm.cmd start
```
*(개발 모드는 `npm.cmd run dev`)*
