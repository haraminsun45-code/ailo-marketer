# 요즘의 나 MVP

개인 기억 분석 웹앱 MVP입니다. 현재 단계에서는 실제 API, 데이터베이스, 로그인, 업로드 서버 없이 모바일 웹 화면 흐름과 한 줄 기록 저장 흐름을 검증합니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- localStorage 기반 더미 저장
- Vercel 배포 대상

## 현재 구현 범위

- `/` 요즘의 나 홈
- `/record` 기록 방식 선택
- `/record/text` 한 줄 기록 작성
- `/moments` 저장된 순간 확인
- `/insights` 더미 발견 카드
- `/profile` 준비 중 화면

아직 연결하지 않은 기능:

- Supabase
- AWS EC2, S3, RDS
- 실제 로그인
- 사진 업로드
- 음성 녹음
- STT
- LLM
- 알림
- 공유 API

## 로컬 실행

PowerShell 실행 정책 때문에 `npm`이 막히면 `npm.cmd`를 사용합니다.

```powershell
npm.cmd install
npm.cmd run dev
```

로컬 확인 URL:

```text
http://127.0.0.1:3000/
```

## 검증 명령어

```powershell
npm.cmd run lint
npm.cmd run build
```

## Vercel 배포 준비

GitHub에 push한 뒤 Vercel에서 새 프로젝트로 import합니다.

Vercel 설정:

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: 비워둠
- Environment Variables: 현재 MVP에서는 필요 없음

## GitHub 업로드 순서

```powershell
git status
git add .
git commit -m "Prepare memory MVP for Vercel deployment"
git branch -M main
git remote add origin https://github.com/<OWNER>/<REPO>.git
git push -u origin main
```

이미 remote가 있다면 `git remote add origin ...` 대신 기존 remote를 확인합니다.

```powershell
git remote -v
git push
```

## Vercel 배포 순서

1. Vercel에 로그인합니다.
2. `Add New Project`를 선택합니다.
3. GitHub 저장소를 import합니다.
4. Framework가 `Next.js`로 잡혔는지 확인합니다.
5. 환경변수는 추가하지 않습니다.
6. `Deploy`를 누릅니다.
7. 배포 완료 후 발급된 `https://...vercel.app` 주소를 휴대폰 브라우저에서 확인합니다.

## 휴대폰 테스트 항목

- 홈 화면이 모바일 폭에서 자연스럽게 보이는지
- 홈의 `글` 버튼이 `/record/text`로 이동하는지
- 빈 입력 저장 시 안내 문구가 보이는지
- 한 줄 입력 후 저장하면 `/moments`로 이동하는지
- `/moments`에서 저장한 글이 최신순으로 보이는지
- 하단 내비게이션의 `순간들`과 가운데 `+` 버튼이 이동하는지
- 새로고침 후에도 localStorage 기록이 유지되는지

## 정적 이미지 경로

홈 히어로 이미지는 다음 경로를 사용합니다.

```text
public/images/home-silhouette-hero.png
```

Next.js/Vercel 배포 환경에서는 `/images/home-silhouette-hero.png`로 제공됩니다.
