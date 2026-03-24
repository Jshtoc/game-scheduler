# Project Conventions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (`any` 타입 사용 금지)
- **Styling**: Tailwind CSS v4 (인라인 `style` 속성 사용 금지)
- **Emoji**: Twemoji (`TwEmoji` 컴포넌트 사용)

## Rules

### 1. Emoji 처리

- JSX에서 이모지를 렌더링할 때 직접 이모지 문자(예: `😀`)를 사용하지 않는다.
- 반드시 `TwEmoji` 컴포넌트를 통해 렌더링한다.
- 데이터 배열의 `icon` 필드처럼 문자열로 저장하는 것은 허용하되, JSX 렌더링 시에는 반드시 `TwEmoji`를 사용한다.

```tsx
// Bad
<span>😀</span>

// Good
<TwEmoji emoji="😀" />
```

### 2. 공통 컴포넌트 사용 필수

- `components/ui/`에 정의된 공통 컴포넌트가 있는 경우, 인라인으로 동일한 UI를 재구현하는 것을 금지한다.
- 새로운 페이지나 기능을 추가할 때 반드시 아래 컴포넌트 목록을 먼저 확인한다.

#### 공통 컴포넌트 목록

> 컴포넌트가 추가될 때마다 이 목록을 업데이트할 것.

| 컴포넌트 | 경로 | 설명 |
|---------|------|------|
| TwEmoji | `components/ui/TwEmoji.tsx` | Twemoji 렌더링 |
| SteamLinkInput | `components/ui/SteamLinkInput.tsx` | Steam 링크로 게임 정보 자동 입력 |

### 3. TypeScript

- `any` 타입 사용 금지. 타입을 알 수 없는 경우 `unknown`을 사용하고 타입 가드로 좁힌다.

### 4. Styling

- Tailwind CSS v4 유틸리티 클래스만 사용한다.
- 인라인 `style` 속성 사용 금지.
