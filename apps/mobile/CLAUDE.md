@AGENTS.md
apps/mobile/
├── app/ ← Expo Router file-based routing
│ ├── (auth)/
│ │ └── login.tsx
│ ├── (tabs)/
│ │ ├── _layout.tsx
│ │ ├── index.tsx ← Home
│ │ └── reports.tsx ← Previous reports
│ ├── report/
│ │ ├── create.tsx
│ │ ├── camera.tsx
│ │ ├── review/[id].tsx
│ │ ├── responders/[id].tsx
│ │ ├── contact/[id].tsx
│ │ ├── tracking/[id].tsx
│ │ ├── feedback/[id].tsx
│ │ └── [id].tsx ← Report detail
│ ├── _layout.tsx ← Root layout
│ └── +not-found.tsx
├── src/
│ ├── api/
│ │ ├── client.ts ← Axios instance
│ │ ├── auth.ts
│ │ ├── reports.ts
│ │ ├── responders.ts
│ │ ├── contact.ts
│ │ └── feedback.ts
│ ├── components/
│ │ ├── ui/ ← Button, Card, Badge, Input, etc.
│ │ └── shared/ ← ReportCard, StatusBadge, etc.
│ ├── hooks/
│ │ ├── useAuth.ts
│ │ ├── useReports.ts
│ │ └── useLocation.ts
│ ├── store/
│ │ └── authStore.ts ← Zustand auth store
│ ├── constants/
│ │ ├── colors.ts
│ │ └── config.ts
│ └── utils/
│ ├── token.ts ← SecureStore helpers
│ └── format.ts
├── assets/
├── app.json
└── package.json
