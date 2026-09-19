# WildCare — Architecture Decisions

## 1. Purpose

This document records the major technical and product decisions made for WildCare and the reasoning behind them.

The goal is to prevent architecture drift during the hackathon and make it clear why each major component exists.

---

# 2. Decision Summary

| Decision | Choice |
|---|---|
| Repository | Monorepo |
| Backend | TypeScript + Node.js |
| API | REST |
| API prefix | `/api/v1` |
| Authentication | Amazon Cognito |
| API gateway | Amazon API Gateway |
| Compute | AWS Lambda |
| Database | Amazon DynamoDB |
| File storage | Amazon S3 |
| AI | Amazon Bedrock |
| Async dispatch | Amazon SQS |
| Email | Amazon SES / provider abstraction |
| SMS | Amazon SNS / provider abstraction |
| Frontend | React + TypeScript |
| Dashboard | React + TypeScript |
| State/server data | TanStack Query |
| Client state | Zustand where required |
| Backend structure | Domain modules |
| Evidence access | Private S3 + pre-signed URLs |
| Responder routing | Service-area matching |
| Responder selection | Citizen selects primary responder |
| Responder onboarding | Admin verification |
| Dashboard opt-in | Optional |
| Government responders | Admin provisioned |
| Dispatch model | Configurable multi-channel |
| AI role | Assistive, not authoritative |

---

# 3. ADR-001 — Use a Monorepo

## Decision

Use a single repository:

```text
wildcare/
├── apps/
├── packages/
├── infra/
└── docs/
```

## Why

WildCare contains multiple applications:

```text
Citizen frontend
Responder/Admin dashboard
Backend
Optional mobile app
```

A monorepo makes it easier to:

- share TypeScript types
- share UI components
- keep API contracts aligned
- manage all applications together
- use one CI/CD workflow
- maintain one documentation source

## Alternative

Separate repositories for each application.

## Why not now

For a small hackathon team, multiple repositories add coordination overhead without providing enough benefit.

---

# 4. ADR-002 — Use Domain-Oriented Backend Modules

## Decision

Backend code is organized around business domains:

```text
modules/
├── incidents/
├── responders/
├── organizations/
├── service-areas/
├── assignments/
├── dispatch/
├── ai-analysis/
└── ...
```

## Why

WildCare is a domain-heavy system.

The important concepts are:

```text
Incident
Responder
Organization
Assignment
Dispatch
```

Keeping their logic together makes the code easier to understand and extend.

## Alternative

Global folders:

```text
controllers/
services/
repositories/
models/
```

## Why not now

As the number of domains increases, global technical folders scatter related logic across the project.

---

# 5. ADR-003 — Use `/api/v1`

## Decision

All application APIs use:

```text
/api/v1
```

Example:

```http
POST /api/v1/incidents
GET /api/v1/incidents/{incidentId}
```

## Why

Explicit versioning gives WildCare a stable API boundary.

A future version can be:

```text
/api/v2
```

without immediately breaking existing clients.

## Rule

Do not mix:

```text
/v1
/api/v1
```

The canonical prefix is:

```text
/api/v1
```

---

# 6. ADR-004 — Use Amazon Cognito

## Decision

Amazon Cognito handles user authentication.

## Why

WildCare needs:

- citizen authentication
- responder authentication
- admin authentication
- JWT-based identity
- managed credential handling

Cognito reduces the amount of custom authentication code that must be written.

## Important rule

The backend derives the authenticated identity from the validated JWT.

Do not trust a client-provided user ID for authorization.

---

# 7. ADR-005 — Use API Gateway + Lambda

## Decision

Expose the backend through:

```text
API Gateway
      ↓
Lambda
```

## Why

The MVP is event-driven and does not require a permanently running application server.

Benefits:

- low infrastructure management
- automatic scaling
- native AWS integration
- easy integration with Cognito
- suitable for irregular incident traffic

## Alternative

Long-running Node.js server on EC2.

## Why not for the MVP

It introduces server management, scaling, patching, and deployment overhead that is unnecessary for the initial product.

---

# 8. ADR-006 — Use DynamoDB

## Decision

Use Amazon DynamoDB for operational application data.

## Why

WildCare's access patterns are known:

```text
Get incident
Get citizen incidents
Get responder incidents
Get responder
Get service area
Get dispatch history
Get notifications
```

DynamoDB can handle these access patterns efficiently while fitting the serverless architecture.

## Important rule

Design the table around access patterns rather than trying to reproduce a relational schema directly.

---

# 9. ADR-007 — Do Not Use Prisma for the MVP

## Decision

Do not introduce Prisma for the DynamoDB MVP.

## Why

Prisma is useful for relational databases, but WildCare's selected operational database is DynamoDB.

Using Prisma would add an unnecessary abstraction.

Use the AWS SDK and repository layer instead:

```text
Domain service
     ↓
Repository
     ↓
DynamoDB
```

If a future relational database is introduced for a specific workload, that decision can be revisited.

---

# 10. ADR-008 — Use S3 for Evidence

## Decision

Photos and videos are stored in Amazon S3.

DynamoDB stores only metadata:

```text
evidenceId
incidentId
s3Key
contentType
size
createdAt
```

## Why

Binary files are not appropriate for DynamoDB item storage.

S3 provides:

- scalable object storage
- private objects
- lifecycle policies
- pre-signed URLs
- large file support

---

# 11. ADR-009 — Direct-to-S3 Upload

## Decision

The client uploads evidence directly to S3 using a pre-signed URL.

```text
Client
  ↓
API
  ↓
Pre-signed URL
  ↓
S3
```

## Why

This prevents large files from unnecessarily passing through Lambda.

It reduces:

- backend bandwidth
- Lambda execution time
- memory pressure

---

# 12. ADR-010 — Keep Evidence Private

## Decision

Wildlife evidence is stored in a private S3 bucket.

Access is granted using temporary pre-signed URLs.

## Why

Incident photos/videos may contain:

- sensitive wildlife locations
- private property
- citizen information
- operational details

Public object URLs are therefore inappropriate.

---

# 13. ADR-011 — Use Amazon Bedrock for AI

## Decision

Use Amazon Bedrock for incident assessment.

## AI responsibilities

Bedrock may help estimate:

```text
Possible species
Incident type
Urgency
Visual observations
Safety guidance
Suggested responder category
```

## Why

It gives WildCare a strong AWS-native AI component and avoids tightly coupling the application to a single external AI API.

---

# 14. ADR-012 — AI Is Assistive

## Decision

AI output is advisory.

It does not make the final operational decision.

## AI must not

```text
Diagnose wildlife definitively
Confirm death
Tell citizens to touch wildlife
Tell citizens to move wildlife
Tell citizens to feed wildlife
Tell citizens to treat wildlife
Replace professional responders
```

## Why

Wildlife incidents can involve physical danger and uncertain visual information.

Human responders remain responsible for operational decisions.

---

# 15. ADR-013 — Use Service Areas for Responder Matching

## Decision

Responders are matched based on configured geographic service areas.

Initial MVP:

```text
District
City
Zone
```

Future:

```text
GeoJSON polygons
Point-in-polygon matching
Advanced geospatial services
```

## Why

The hackathon needs reliable local routing without building a complete GIS platform.

---

# 16. ADR-014 — Citizen Selects the Primary Responder

## Decision

WildCare shows eligible verified responders and allows the citizen to select the primary responder.

```text
Incident
   ↓
Eligible responders
   ↓
Citizen selection
   ↓
Assignment
   ↓
Dispatch
```

## Why

This makes the response path explicit and avoids silently notifying every organization in the area.

Future versions may support configurable escalation or multi-responder dispatch.

---

# 17. ADR-015 — Separate Responder From Dispatch Channel

## Decision

Responder identity and communication method are separate concepts.

```text
ResponderProfile
      +
DispatchConfiguration
```

Therefore:

```text
WHO receives?
→ Responder

HOW do they receive it?
→ Dispatch configuration
```

## Why

The same responder may need:

```text
Dashboard
Email
SMS
Voice
WhatsApp
Webhook
```

This model allows communication channels to change without changing the responder domain model.

---

# 18. ADR-016 — Support Dashboard and Push-Only Responders

## Decision

During onboarding, organizations choose whether they want WildCare dashboard access.

### Dashboard responder

```text
Cognito account
Dashboard
Incident tracking
Status updates
```

### Push-only responder

```text
No WildCare dashboard
No WildCare login required
External notification only
```

## Why

Some organizations may already have operational systems or may only need alerts.

Forcing every organization to use another dashboard creates unnecessary adoption friction.

---

# 19. ADR-017 — Admin Verification Before Activation

## Decision

Organizations must be manually verified before becoming active responders.

```text
Application
   ↓
PENDING_VERIFICATION
   ↓
Admin review
   ↓
VERIFIED
   ↓
Active responder
```

## Why

WildCare should not route incidents to arbitrary or unverified organizations.

---

# 20. ADR-018 — Admin-Provisioned Government Responders

## Decision

Government/forest responders may be created directly by administrators.

## Why

Some government units may not self-register through a consumer-style onboarding flow.

Admin can configure:

```text
Organization
Responder
Service area
Dispatch channel
```

This supports mobile-only operational teams.

---

# 21. ADR-019 — Use Asynchronous Dispatch

## Decision

Dispatch requests should use:

```text
SQS
  ↓
Dispatch Worker Lambda
```

## Why

Communication providers can be:

- slow
- unavailable
- rate limited
- temporarily failing

The citizen should not have to wait for every external notification provider.

---

# 22. ADR-020 — Use Retry + Dead-Letter Queue

## Decision

Failed dispatch attempts should be retried.

After retry exhaustion:

```text
SQS
 ↓
DLQ
```

## Why

Communication failures should not silently disappear.

Administrators need visibility into:

```text
Which channel failed?
Why?
How many attempts?
Was another channel successful?
```

---

# 23. ADR-021 — Dispatch Status Is Not Responder Acceptance

## Decision

WildCare distinguishes:

```text
DISPATCHED
ACKNOWLEDGED
ACCEPTED
IN_PROGRESS
RESOLVED
```

## Why

A message being sent successfully does not mean a responder has accepted the incident.

Example:

```text
Email sent
    ≠
Responder saw email
    ≠
Responder accepted incident
```

This prevents misleading status information.

---

# 24. ADR-022 — Communication Providers Behind Interfaces

## Decision

External communication channels use provider abstractions.

Example:

```text
DispatchProvider
├── DashboardDispatchProvider
├── EmailDispatchProvider
├── SmsDispatchProvider
├── WhatsAppDispatchProvider
├── VoiceDispatchProvider
└── WebhookDispatchProvider
```

## Why

Provider credentials and APIs can change.

The core dispatch service should not depend directly on one vendor.

---

# 25. ADR-023 — Do Not Fake External Integrations

## Decision

If a real provider is not configured, WildCare must not claim that a real message was delivered.

The UI may show:

```text
SIMULATED
CONFIGURED
QUEUED
SENT
FAILED
```

as appropriate.

## Why

The demo should distinguish real functionality from architectural demonstrations.

---

# 26. ADR-024 — Exact Wildlife Location Is Sensitive

## Decision

Exact coordinates are visible only to authorized operational users.

```text
Citizen → own incident
Responder → assigned incident
Admin → authorized operational access
Public → no exact coordinates
```

## Why

Publishing exact wildlife locations can create risks for the animal and responders.

---

# 27. ADR-025 — Keep Admin as Configuration Authority

## Decision

Admins control:

```text
Organization verification
Responder activation
Service areas
Government responders
Dispatch configuration
Operational oversight
```

## Why

Responder routing must be based on trusted configuration.

---

# 28. ADR-026 — Use React Feature-Based Frontends

## Decision

Frontend code is organized by feature:

```text
features/
├── auth/
├── incident-report/
├── responder-selection/
├── incident-tracking/
└── notifications/
```

Dashboard similarly uses feature-oriented organization.

## Why

Feature-oriented code keeps UI, API calls, hooks, and types close to the functionality they implement.

---

# 29. ADR-027 — TanStack Query for Server State

## Decision

Use TanStack Query for API/server state.

Use Zustand only where local client state genuinely benefits from a store.

## Why

Incident lists, responder data, notifications, and dashboard data are server-owned.

TanStack Query handles:

```text
Fetching
Caching
Refetching
Mutation state
Loading/error states
```

Zustand should not become a second API cache.

---

# 30. ADR-028 — Keep the Hackathon MVP Small

## Decision

The MVP prioritizes the complete response loop:

```text
Report
 ↓
AI assessment
 ↓
Responder matching
 ↓
Responder selection
 ↓
Dispatch
 ↓
Responder acknowledgement
 ↓
Resolution
```

## Defer

```text
Advanced GIS
Multi-region deployment
Complex analytics
Automatic incident merging
Large provider ecosystem
Advanced notification preferences
Full mobile application
```

## Why

A complete working vertical slice is more valuable for the hackathon than many unfinished features.

---

# 31. ADR-029 — One Real Notification Channel Is Enough for MVP

## Decision

Implement at least one real dispatch channel.

Additional channels can use the same abstraction.

Example:

```text
Email → real
SMS → configured later
WhatsApp → configured later
Voice → configured later
Webhook → configured later
```

## Why

The architecture should demonstrate extensibility without requiring every external provider to be integrated during the hackathon.

---

# 32. ADR-030 — Keep the Backend Provider-Agnostic

## Decision

Business logic should depend on interfaces rather than AWS/provider SDK calls.

Example:

```text
IncidentService
     ↓
DispatchService
     ↓
DispatchProvider
```

Infrastructure provides:

```text
SesEmailProvider
SnsSmsProvider
WhatsAppProvider
VoiceProvider
```

## Why

This keeps business logic testable and makes provider replacement easier.

---

# 33. ADR-031 — Audit Important Operational Actions

## Decision

Record important actions in `AuditLog`.

Examples:

```text
ORGANIZATION_APPROVED
RESPONDER_CREATED
SERVICE_AREA_UPDATED
DISPATCH_CONFIG_UPDATED
INCIDENT_STATUS_CHANGED
DISPATCH_RETRIED
```

## Why

WildCare coordinates real-world response and needs an operational history.

---

# 34. ADR-032 — Use `/docs` as the Product Source of Truth

The repository contains exactly these nine design documents:

```text
docs/
├── requirements.md
├── roles-and-actors.md
├── user-flow.md
├── domain-and-schema.md
├── api-design.md
├── architecture.md
├── folder-structure.md
├── decisions.md
└── deployment.md
```

The documents should stay aligned.

If implementation changes an architectural decision, update the relevant document rather than allowing the documentation to become stale.

---

# 35. ADR-033 — Build the Vertical Slice First

## Decision

Implementation should proceed through the complete citizen-to-responder path before building secondary functionality.

Priority:

```text
1. Cognito
2. Incident creation
3. S3 evidence
4. Bedrock analysis
5. Responder matching
6. Responder selection
7. Dispatch
8. Responder dashboard
9. Status updates
10. Admin configuration
```

## Why

This creates a demonstrable working product as early as possible.

---

# 36. Architecture Principles

WildCare should follow these principles:

### Keep domain logic independent

```text
Business rules
      ≠
AWS SDK calls
```

### Keep communication configurable

```text
Responder
      ≠
Communication provider
```

### Keep AI advisory

```text
AI
 ↓
Assessment
 ↓
Human responder
 ↓
Operational decision
```

### Keep sensitive data private

```text
Exact location
Evidence
Citizen details
```

should only be available to authorized users.

### Prefer simple working infrastructure

Use AWS managed services where they reduce operational work.

---

# 37. Decision Review Rule

A decision should be reconsidered if:

1. It creates unnecessary implementation complexity.
2. It prevents the MVP from being completed.
3. AWS costs become unreasonable.
4. A required provider cannot support the workflow.
5. Security or privacy requirements change.
6. Real usage reveals a different access pattern.

Otherwise, avoid changing architecture during the hackathon simply because another technology looks interesting.

---

# 38. Final Architecture Principle

The central WildCare architecture is:

```text
REPORT
   ↓
UNDERSTAND
   ↓
ROUTE
   ↓
SELECT
   ↓
DISPATCH
   ↓
ACKNOWLEDGE
   ↓
RESPOND
   ↓
RESOLVE
```

AWS provides the infrastructure:

```text
Cognito
API Gateway
Lambda
DynamoDB
S3
Bedrock
SQS
SES/SNS
CloudWatch
Secrets Manager
```

The WildCare domain remains independent of individual AWS or communication-provider implementations wherever practical.
