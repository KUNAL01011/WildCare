# WildCare — Folder Structure

## 1. Structure Philosophy

WildCare should use a monorepo structure similar to the existing DekhoExam architecture, but adapted to the WildCare domain.

The main principles are:

- Separate applications under `apps/`
- Keep reusable code under `packages/`
- Keep product documentation under `docs/`
- Organize backend by domain modules
- Keep infrastructure integrations separate from business logic
- Keep API versioning explicit with `/api/v1`
- Keep frontend code feature-oriented
- Avoid creating unnecessary abstraction for the hackathon

Recommended repository:

```text
WILDCARE/
├── .git/
├── .husky/
├── apps/
│   ├── backend/
│   ├── dashboard/
│   ├── frontend/
│   └── mobile/
│
├── packages/
│   ├── eslint-config/
│   ├── types/
│   ├── utils/
│   └── ui/
│
├── docs/
│   ├── requirements.md
│   ├── roles-and-actors.md
│   ├── user-flow.md
│   ├── domain-and-schema.md
│   ├── api-design.md
│   ├── architecture.md
│   ├── folder-structure.md
│   ├── decisions.md
│   └── deployment.md
│
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── commitlint.config.js
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── README.md
└── ...
```

---

# 2. Applications

```text
apps/
├── backend/
├── dashboard/
├── frontend/
└── mobile/
```

## `backend`

Main WildCare API and backend services.

Responsibilities:

```text
API
Authentication/authorization
Incident management
AI orchestration
Responder matching
Dispatch
Organizations
Admin operations
Notifications
Background jobs
AWS integrations
```

## `dashboard`

Used by:

```text
Responders
Admins
```

The dashboard should use role-based access.

```text
RESPONDER
ADMIN
```

## `frontend`

Citizen-facing web application.

Main functionality:

```text
Sign in
Report incident
Capture GPS
Upload evidence
View AI assessment
Choose responder
Track incident
View notifications
```

## `mobile`

Optional future/mobile client.

For the hackathon, this can initially remain minimal if the web application is sufficient.

---

# 3. Backend Structure

Recommended:

```text
apps/backend/
├── prisma/                         # Only if Prisma is used for a separate DB/tool
├── src/
│   ├── config/
│   ├── core/
│   ├── generated/
│   ├── infrastructure/
│   ├── jobs/
│   ├── modules/
│   ├── routes/
│   ├── types/
│   ├── app.ts
│   └── server.ts
│
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
└── ...
```

For WildCare's AWS/DynamoDB MVP, **do not introduce Prisma just because the existing DekhoExam project uses it**. DynamoDB should be accessed through the AWS SDK/repository layer.

---

# 4. Backend `config`

```text
src/config/
├── env.config.ts
├── aws.config.ts
├── auth.config.ts
├── cookies.config.ts
└── logger.config.ts
```

### `env.config.ts`

Validates environment variables.

Example:

```text
AWS_REGION
DYNAMODB_TABLE_NAME
S3_BUCKET_NAME
BEDROCK_MODEL_ID
COGNITO_USER_POOL_ID
COGNITO_CLIENT_ID
SQS_DISPATCH_QUEUE_URL
```

### `aws.config.ts`

Creates/configures AWS clients.

Examples:

```text
DynamoDBClient
S3Client
BedrockRuntimeClient
SQSClient
SESClient
```

Do not create AWS clients randomly inside controllers.

---

# 5. Backend `core`

The `core` directory contains cross-cutting backend functionality.

```text
src/core/
├── constants/
├── errors/
├── http/
├── logger/
├── security/
├── utils/
└── validation/
```

Example:

```text
core/
├── constants/
│   ├── roles.ts
│   ├── incident-status.ts
│   └── dispatch-channel.ts
│
├── errors/
│   ├── app-error.ts
│   ├── error-codes.ts
│   └── error-handler.ts
│
├── http/
│   ├── response.ts
│   └── pagination.ts
│
├── logger/
│   └── logger.ts
│
├── security/
│   ├── authorization.ts
│   └── permissions.ts
│
├── utils/
│   ├── id.ts
│   └── date.ts
│
└── validation/
    └── validate.ts
```

Do not put incident-specific business logic in `core`.

---

# 6. Backend `infrastructure`

This directory contains implementations that communicate with external systems.

```text
src/infrastructure/
├── aws/
│   ├── bedrock/
│   ├── cognito/
│   ├── dynamodb/
│   ├── s3/
│   ├── ses/
│   └── sqs/
│
├── communication/
│   ├── email/
│   ├── sms/
│   ├── whatsapp/
│   ├── voice/
│   └── webhook/
│
└── storage/
```

The important rule is:

```text
Domain code should not know provider-specific implementation details.
```

For example:

```text
Incident service
      ↓
Dispatch service
      ↓
EmailDispatchProvider
      ↓
SES
```

Not:

```text
Incident service
      ↓
AWS SES code everywhere
```

---

# 7. AWS Infrastructure

```text
src/infrastructure/aws/
├── bedrock/
│   ├── bedrock.client.ts
│   ├── bedrock.service.ts
│   └── bedrock.types.ts
│
├── cognito/
│   ├── cognito.service.ts
│   └── cognito.types.ts
│
├── dynamodb/
│   ├── dynamodb.client.ts
│   ├── keys.ts
│   └── repository.ts
│
├── s3/
│   ├── s3.client.ts
│   └── s3.service.ts
│
├── ses/
│   └── ses.service.ts
│
└── sqs/
    ├── sqs.client.ts
    └── sqs.service.ts
```

---

# 8. Backend Modules

The backend should be organized by business domain.

```text
src/modules/
├── auth/
├── users/
├── organizations/
├── responders/
├── service-areas/
├── incidents/
├── evidence/
├── ai-analysis/
├── assignments/
├── dispatch/
├── notifications/
├── admin/
└── health/
```

This is similar to the module-oriented structure shown in the existing project, but WildCare modules should reflect WildCare's actual business domains.

---

# 9. Module Structure

Each important module should follow a consistent pattern.

Example:

```text
modules/incidents/
├── incident.controller.ts
├── incident.service.ts
├── incident.repository.ts
├── incident.schema.ts
├── incident.mapper.ts
├── incident.constants.ts
├── incident.types.ts
└── index.ts
```

For larger modules:

```text
modules/incidents/
├── controllers/
├── services/
├── repositories/
├── schemas/
├── mappers/
├── types/
├── constants/
└── index.ts
```

For the hackathon, the first compact structure is preferable.

---

# 10. Incidents Module

```text
modules/incidents/
├── incident.controller.ts
├── incident.service.ts
├── incident.repository.ts
├── incident.schema.ts
├── incident.mapper.ts
├── incident.constants.ts
├── incident.types.ts
└── index.ts
```

Responsibilities:

```text
Create incident
Get incident
List citizen incidents
Validate incident
Update incident status
Incident lifecycle
```

The incident service should not directly contain SES/WhatsApp/SMS implementation.

---

# 11. Evidence Module

```text
modules/evidence/
├── evidence.controller.ts
├── evidence.service.ts
├── evidence.repository.ts
├── evidence.schema.ts
├── evidence.types.ts
└── index.ts
```

Responsibilities:

```text
Generate S3 upload URL
Register evidence metadata
Validate evidence
Generate authorized evidence URLs
```

Actual binary files remain in S3.

---

# 12. AI Analysis Module

```text
modules/ai-analysis/
├── ai-analysis.controller.ts
├── ai-analysis.service.ts
├── ai-analysis.repository.ts
├── ai-analysis.schema.ts
├── ai-analysis.mapper.ts
├── ai-analysis.types.ts
└── index.ts
```

Flow:

```text
AIAnalysisService
      ↓
BedrockProvider
      ↓
Amazon Bedrock
```

The domain module should not depend directly on a specific Bedrock SDK call throughout the codebase.

---

# 13. Organizations Module

```text
modules/organizations/
├── organization.controller.ts
├── organization.service.ts
├── organization.repository.ts
├── organization.schema.ts
├── organization.mapper.ts
├── organization.constants.ts
├── organization.types.ts
└── index.ts
```

Responsibilities:

```text
Organization application
Organization details
Verification state
Organization status
```

---

# 14. Responders Module

```text
modules/responders/
├── responder.controller.ts
├── responder.service.ts
├── responder.repository.ts
├── responder.schema.ts
├── responder.mapper.ts
├── responder.constants.ts
├── responder.types.ts
└── index.ts
```

Responsibilities:

```text
Responder profile
Dashboard access
Active/inactive state
Responder lookup
Responder eligibility
```

---

# 15. Service Areas Module

```text
modules/service-areas/
├── service-area.controller.ts
├── service-area.service.ts
├── service-area.repository.ts
├── service-area.schema.ts
├── service-area.types.ts
└── index.ts
```

Responsibilities:

```text
Create service area
Update service area
Match incident location
Find eligible responders
```

For the MVP, district/city matching can be implemented first.

---

# 16. Assignments Module

```text
modules/assignments/
├── assignment.controller.ts
├── assignment.service.ts
├── assignment.repository.ts
├── assignment.schema.ts
├── assignment.types.ts
└── index.ts
```

Responsibilities:

```text
Citizen selects responder
Validate eligibility
Create assignment
Change assignment state
```

Core rule:

```text
Citizen chooses primary responder.
```

---

# 17. Dispatch Module

This is one of the most important backend modules.

```text
modules/dispatch/
├── dispatch.controller.ts
├── dispatch.service.ts
├── dispatch.repository.ts
├── dispatch.schema.ts
├── dispatch.mapper.ts
├── dispatch.constants.ts
├── dispatch.types.ts
├── providers/
│   ├── dashboard.provider.ts
│   ├── email.provider.ts
│   ├── sms.provider.ts
│   ├── whatsapp.provider.ts
│   ├── voice.provider.ts
│   └── webhook.provider.ts
└── index.ts
```

The provider interfaces should be independent from the application service.

Example:

```ts
interface DispatchProvider {
  send(input: DispatchPayload): Promise<DispatchResult>;
}
```

Then:

```text
EmailDispatchProvider
SmsDispatchProvider
WhatsAppDispatchProvider
VoiceDispatchProvider
WebhookDispatchProvider
```

can implement the same contract.

---

# 18. Notifications Module

```text
modules/notifications/
├── notification.controller.ts
├── notification.service.ts
├── notification.repository.ts
├── notification.schema.ts
├── notification.types.ts
└── index.ts
```

Used for:

```text
Citizen notifications
Responder dashboard notifications
Incident status updates
```

External delivery belongs to the dispatch/infrastructure layer.

---

# 19. Admin Module

```text
modules/admin/
├── admin.controller.ts
├── admin.service.ts
├── admin.schema.ts
├── admin.types.ts
└── index.ts
```

Responsibilities:

```text
Verify organizations
Create government responders
Configure service areas
Configure dispatch channels
View incidents
Retry failed dispatches
```

Admin should orchestrate other domain services instead of duplicating their business logic.

---

# 20. Auth Module

```text
modules/auth/
├── auth.middleware.ts
├── auth.service.ts
├── auth.types.ts
└── index.ts
```

Cognito remains the identity provider.

The application auth layer is responsible for:

```text
Read validated identity
Map identity to application role
Authorization
Permission checks
```

---

# 21. Jobs

Background workers belong outside HTTP modules.

```text
src/jobs/
├── connection.ts
├── dispatch.ts
├── index.ts
│
├── queues/
│   ├── dispatch.queue.ts
│   └── notification.queue.ts
│
└── cron/
    └── cleanup.ts
```

For the MVP:

```text
jobs/
└── dispatch.ts
```

can consume SQS and invoke the dispatch service.

---

# 22. Routes

API versioning must be explicit.

```text
src/routes/
├── v1/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── incidents.routes.ts
│   ├── evidence.routes.ts
│   ├── responders.routes.ts
│   ├── organizations.routes.ts
│   ├── service-areas.routes.ts
│   ├── assignments.routes.ts
│   ├── dispatch.routes.ts
│   ├── notifications.routes.ts
│   ├── admin.routes.ts
│   └── index.ts
│
└── index.ts
```

The external API is:

```text
/api/v1/*
```

Example:

```text
POST /api/v1/incidents
GET  /api/v1/incidents/:incidentId
GET  /api/v1/incidents/:incidentId/responders
POST /api/v1/incidents/:incidentId/assignment
```

---

# 23. Route Registration

Recommended:

```text
app.ts
   ↓
routes/index.ts
   ↓
routes/v1/index.ts
   ↓
domain route modules
```

Example:

```ts
app.use("/api/v1", v1Router);
```

Then:

```ts
v1Router.use("/incidents", incidentRoutes);
v1Router.use("/responders", responderRoutes);
v1Router.use("/organizations", organizationRoutes);
```

This keeps `/api/v1` centralized.

---

# 24. Backend Complete Structure

```text
apps/backend/
├── src/
│   ├── config/
│   │   ├── aws.config.ts
│   │   ├── auth.config.ts
│   │   ├── env.config.ts
│   │   └── logger.config.ts
│   │
│   ├── core/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── http/
│   │   ├── logger/
│   │   ├── security/
│   │   ├── utils/
│   │   └── validation/
│   │
│   ├── infrastructure/
│   │   ├── aws/
│   │   │   ├── bedrock/
│   │   │   ├── cognito/
│   │   │   ├── dynamodb/
│   │   │   ├── s3/
│   │   │   ├── ses/
│   │   │   └── sqs/
│   │   │
│   │   └── communication/
│   │       ├── email/
│   │       ├── sms/
│   │       ├── whatsapp/
│   │       ├── voice/
│   │       └── webhook/
│   │
│   ├── jobs/
│   │   ├── queues/
│   │   │   └── dispatch.queue.ts
│   │   └── dispatch.ts
│   │
│   ├── modules/
│   │   ├── admin/
│   │   ├── ai-analysis/
│   │   ├── assignments/
│   │   ├── auth/
│   │   ├── dispatch/
│   │   ├── evidence/
│   │   ├── health/
│   │   ├── incidents/
│   │   ├── notifications/
│   │   ├── organizations/
│   │   ├── responders/
│   │   ├── service-areas/
│   │   └── users/
│   │
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── admin.routes.ts
│   │   │   ├── assignments.routes.ts
│   │   │   ├── dispatch.routes.ts
│   │   │   ├── evidence.routes.ts
│   │   │   ├── incidents.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── organizations.routes.ts
│   │   │   ├── responders.routes.ts
│   │   │   ├── service-areas.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── types/
│   │   └── express.d.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

# 25. Citizen Frontend Structure

The citizen application should be feature-oriented.

```text
apps/frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── router/
│   │   └── app.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── routes.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── incident-report/
│   │   ├── responder-selection/
│   │   ├── incident-tracking/
│   │   └── notifications/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   ├── types/
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

# 26. Citizen Incident Feature

```text
features/incident-report/
├── api/
│   ├── create-incident.ts
│   ├── upload-evidence.ts
│   ├── analyze-incident.ts
│   └── submit-incident.ts
│
├── components/
│   ├── incident-form.tsx
│   ├── location-capture.tsx
│   ├── evidence-uploader.tsx
│   ├── ai-assessment.tsx
│   └── safety-notice.tsx
│
├── hooks/
│   ├── use-create-incident.ts
│   └── use-analyze-incident.ts
│
├── pages/
│   └── report-incident-page.tsx
│
├── schemas/
│   └── incident.schema.ts
│
└── types.ts
```

---

# 27. Responder Selection Feature

```text
features/responder-selection/
├── api/
│   └── get-responders.ts
├── components/
│   ├── responder-card.tsx
│   ├── responder-list.tsx
│   └── responder-map.tsx
├── hooks/
│   └── use-responders.ts
├── pages/
│   └── select-responder-page.tsx
└── types.ts
```

---

# 28. Dashboard Structure

The dashboard serves both responders and admins.

```text
apps/dashboard/
├── public/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── router/
│   │   └── app.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── incidents/
│   │   ├── responders/
│   │   ├── organizations/
│   │   ├── service-areas/
│   │   ├── dispatch/
│   │   └── admin/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   ├── types/
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

# 29. Dashboard Role Separation

Do not create completely separate codebases for admin and responder.

Use:

```text
features/
├── responder/
└── admin/
```

and role-based routing.

Example:

```text
/dashboard
    ↓
Role check
    ├── RESPONDER → responder dashboard
    └── ADMIN     → admin dashboard
```

Shared UI and API clients remain reusable.

---

# 30. Dashboard Responder Feature

```text
features/incidents/
├── api/
│   ├── get-responder-incidents.ts
│   ├── get-incident.ts
│   ├── acknowledge-incident.ts
│   ├── accept-incident.ts
│   ├── update-status.ts
│   └── resolve-incident.ts
│
├── components/
│   ├── incident-card.tsx
│   ├── incident-details.tsx
│   ├── incident-status.tsx
│   ├── incident-map.tsx
│   └── evidence-gallery.tsx
│
├── hooks/
├── pages/
│   ├── incident-list-page.tsx
│   └── incident-details-page.tsx
└── types.ts
```

---

# 31. Admin Feature Structure

```text
features/admin/
├── api/
│   ├── organizations.ts
│   ├── responders.ts
│   ├── service-areas.ts
│   └── dispatch-configurations.ts
│
├── components/
│   ├── organization-review.tsx
│   ├── responder-form.tsx
│   ├── service-area-form.tsx
│   └── dispatch-config-form.tsx
│
├── pages/
│   ├── organizations-page.tsx
│   ├── responders-page.tsx
│   └── service-areas-page.tsx
│
└── types.ts
```

---

# 32. Shared Packages

Use packages only for code genuinely shared between applications.

```text
packages/
├── eslint-config/
├── types/
├── utils/
└── ui/
```

## `packages/types`

Shared API/domain types:

```text
packages/types/
├── src/
│   ├── incident.ts
│   ├── responder.ts
│   ├── organization.ts
│   ├── dispatch.ts
│   ├── api.ts
│   └── index.ts
└── package.json
```

Do not put backend-only business logic here.

---

# 33. Shared UI

If both frontend and dashboard use the same design system:

```text
packages/ui/
├── src/
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── badge.tsx
│   └── index.ts
└── package.json
```

If sharing UI slows down the hackathon, keep UI local to each application initially.

---

# 34. Root Package Configuration

Recommended workspace:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

This follows the same general monorepo pattern as the existing project.

---

# 35. Environment Files

Do not commit real secrets.

Root:

```text
.env.example
```

Backend:

```text
apps/backend/.env.example
```

Frontend:

```text
apps/frontend/.env.example
```

Dashboard:

```text
apps/dashboard/.env.example
```

Example backend:

```text
AWS_REGION=
DYNAMODB_TABLE_NAME=
S3_BUCKET_NAME=
BEDROCK_MODEL_ID=
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
SQS_DISPATCH_QUEUE_URL=
```

Provider secrets belong in AWS Secrets Manager for deployed environments.

---

# 36. Infrastructure Files

Keep deployment/infrastructure configuration at the root or in a dedicated infrastructure directory.

For the MVP:

```text
infra/
├── cloudformation/
│   └── wildcare.yaml
└── scripts/
    └── deploy.sh
```

If infrastructure-as-code is not implemented during the hackathon, this directory can be added after the first working deployment.

Do not create a large Terraform structure unless it is actually needed.

---

# 37. Final Repository Structure

```text
WILDCARE/
│
├── .github/
│   └── workflows/
│
├── .husky/
│
├── apps/
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── core/
│   │   │   ├── infrastructure/
│   │   │   ├── jobs/
│   │   │   ├── modules/
│   │   │   ├── routes/
│   │   │   ├── types/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── frontend/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   └── package.json
│   │
│   ├── dashboard/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   └── package.json
│   │
│   └── mobile/
│
├── packages/
│   ├── eslint-config/
│   ├── types/
│   ├── utils/
│   └── ui/
│
├── infra/
│   ├── cloudformation/
│   └── scripts/
│
├── docs/
│   ├── requirements.md
│   ├── roles-and-actors.md
│   ├── user-flow.md
│   ├── domain-and-schema.md
│   ├── api-design.md
│   ├── architecture.md
│   ├── folder-structure.md
│   ├── decisions.md
│   └── deployment.md
│
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── commitlint.config.js
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.base.json
```

---

# 38. What Not to Do

Avoid these structures:

```text
src/
├── controllers/
├── services/
├── models/
├── helpers/
├── utils/
└── everything/
```

for the entire backend.

That structure becomes difficult to navigate as the product grows.

Prefer domain-oriented modules:

```text
modules/
├── incidents/
├── responders/
├── organizations/
├── dispatch/
└── ...
```

Also avoid:

```text
utils/
└── 500 random functions
```

If a function belongs to a domain, keep it with that domain.

---

# 39. Recommended Implementation Order

Create the project in this order:

```text
1. Monorepo
   ↓
2. apps/backend
   ↓
3. apps/frontend
   ↓
4. apps/dashboard
   ↓
5. packages/types
   ↓
6. Backend core/infrastructure
   ↓
7. Incident module
   ↓
8. Evidence/S3
   ↓
9. AI analysis/Bedrock
   ↓
10. Responder/service-area modules
   ↓
11. Assignment
   ↓
12. Dispatch
   ↓
13. Dashboard
   ↓
14. Admin
```

---

# 40. Final Design Rule

The most important separation is:

```text
MODULES
   ↓
Business/domain logic

INFRASTRUCTURE
   ↓
AWS/external provider implementation

ROUTES
   ↓
HTTP/API exposure

JOBS
   ↓
Background/asynchronous work

APPS
   ↓
User interfaces

PACKAGES
   ↓
Genuinely shared code
```

This gives WildCare a structure similar in style to the existing DekhoExam project while keeping the architecture specific to WildCare's serverless AWS and wildlife-response domain.
