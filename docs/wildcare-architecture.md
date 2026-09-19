# WildCare — Architecture

## 1. Purpose

This document defines the production-oriented MVP architecture for WildCare.

WildCare is a citizen-to-wildlife-response coordination platform.

The system:

```text
Citizen
   ↓
Report wildlife incident
   ↓
AI-assisted assessment
   ↓
Find verified local responders
   ↓
Citizen selects responder
   ↓
Dispatch through configured channel
   ↓
Responder acknowledges / accepts
   ↓
Incident tracking
```

WildCare is a coordination layer. It does not replace wildlife authorities, rescue organizations, veterinarians, police, or government systems.

---

# 2. Architecture Goals

The architecture must provide:

- secure citizen reporting
- GPS-based responder matching
- private wildlife evidence storage
- AI-assisted incident assessment
- verified responder onboarding
- dashboard and push-only responders
- multi-channel dispatch
- asynchronous processing
- retryable communication
- auditability
- role-based access
- low operational overhead
- strong AWS usage for the hackathon
- a clear path from MVP to production

---

# 3. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │      Citizen         │
                         │ Web / Mobile Client  │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │   Amazon Cognito     │
                         │ Authentication / JWT │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     API Gateway      │
                         │    /api/v1/*         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     AWS Lambda       │
                         │   API / Domain Logic │
                         └─────┬────┬────┬─────┘
                               │    │    │
                 ┌─────────────┘    │    └──────────────┐
                 │                  │                   │
                 ▼                  ▼                   ▼
        ┌────────────────┐  ┌───────────────┐  ┌─────────────────┐
        │   DynamoDB     │  │      S3       │  │ Amazon Bedrock  │
        │ Domain Data    │  │ Photos/Videos │  │ AI Assessment   │
        └────────────────┘  └───────────────┘  └─────────────────┘

                               │
                               ▼
                       ┌─────────────────┐
                       │      SQS        │
                       │ Dispatch Queue  │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Dispatch Worker │
                       │ Lambda          │
                       └────────┬────────┘
                                │
             ┌──────────────────┼─────────────────────┐
             │                  │                     │
             ▼                  ▼                     ▼
          Email                SMS               Dashboard
             │                  │                     │
             ▼                  ▼                     ▼
           SES /            SNS or external       WildCare
        provider              provider            responder

             ┌──────────────────┬─────────────────────┐
             │                  │
             ▼                  ▼
          WhatsApp            Voice
          Provider            Provider

                     Optional
                         │
                         ▼
                    Webhook/API
                    Responder System
```

---

# 4. Frontend Architecture

WildCare can use:

```text
React
   +
TypeScript
   +
React Router
   +
TanStack Query
   +
Zustand
```

Recommended applications:

```text
apps/
├── citizen-web/
├── responder-dashboard/
└── admin-dashboard/
```

For the hackathon, these can also be implemented as one React application with role-based routing if development speed is more important.

---

# 5. Frontend Responsibilities

The frontend should handle:

- authentication UI
- incident creation
- camera/file selection
- GPS capture
- safety acknowledgement
- AI assessment display
- responder selection
- incident tracking
- responder dashboard
- admin configuration
- status updates

The frontend should NOT:

- call Bedrock directly
- access DynamoDB directly
- access private S3 credentials
- contain provider secrets
- decide authorization
- decide whether a responder is verified

All sensitive decisions belong to the backend.

---

# 6. Authentication Architecture

Use Amazon Cognito.

```text
User
  ↓
Cognito Hosted UI / SDK
  ↓
Access Token
  ↓
API Gateway
  ↓
JWT validation
  ↓
Lambda
```

JWT claims should provide the authenticated identity.

The backend should derive:

```text
userId
role
```

from the validated token.

Never trust:

```json
{
  "userId": "someone-else"
}
```

from a client request for authorization purposes.

---

# 7. API Gateway

API Gateway exposes:

```text
/api/v1/*
```

Example:

```text
POST /api/v1/incidents
GET  /api/v1/incidents/{incidentId}
POST /api/v1/incidents/{incidentId}/analyze
GET  /api/v1/incidents/{incidentId}/responders
POST /api/v1/incidents/{incidentId}/assignment
```

Responsibilities:

- HTTPS termination
- routing
- Cognito authorization
- request throttling
- CORS
- API access logging
- integration with Lambda

---

# 8. Lambda Architecture

Avoid creating one huge Lambda containing the whole application.

Use domain-oriented handlers/services.

Conceptually:

```text
Lambda
├── Incident Handler
├── Responder Handler
├── Organization Handler
├── Admin Handler
├── Dispatch Handler
└── Notification Handler
```

The actual deployment can use fewer Lambda functions if needed.

For the hackathon:

```text
API Lambda
Dispatch Worker Lambda
```

is enough.

The code should still be organized by domain internally.

---

# 9. Backend Domain Layers

Recommended backend structure:

```text
API Route
   ↓
Controller
   ↓
Application Service
   ↓
Domain Logic
   ↓
Repository
   ↓
AWS Infrastructure
```

Example:

```text
POST /api/v1/incidents/:id/assignment
             ↓
AssignmentController
             ↓
AssignResponderService
             ↓
ResponderEligibilityService
             ↓
IncidentRepository
ResponderRepository
             ↓
DynamoDB
```

This keeps AWS-specific implementation away from business rules.

---

# 10. DynamoDB

Use Amazon DynamoDB as the primary operational database.

Main table:

```text
WildCareTable
```

It stores:

```text
Users
Organizations
Responders
Service Areas
Dispatch Configurations
Incidents
Evidence Metadata
AI Analysis
Assignments
Dispatch Attempts
Status History
Notifications
Audit Logs
```

The design follows the access patterns defined in `domain-and-schema.md`.

---

# 11. DynamoDB Access Patterns

Important queries:

### Citizen

```text
Get own incidents
Get one incident
Get incident status
Get notifications
```

### Responder

```text
Get assigned incidents
Get incident details
Get dispatch history
```

### Admin

```text
Get pending organizations
Get responders
Get service areas
Get incidents
Get dispatch attempts
```

### Routing

```text
Find active verified responders covering location
```

The geographic lookup should be handled by a dedicated routing/service-area layer rather than expecting DynamoDB to perform arbitrary GIS queries.

---

# 12. S3 Evidence Storage

Photos and videos are stored in a private S3 bucket.

Example:

```text
wildcare-evidence/
└── incidents/
    └── inc_001/
        ├── ev_001.jpg
        └── ev_002.mp4
```

Flow:

```text
Client
   ↓
POST upload-url
   ↓
API
   ↓
Pre-signed S3 URL
   ↓
Client uploads directly to S3
   ↓
Client confirms evidence
   ↓
DynamoDB stores metadata
```

Advantages:

- lower Lambda bandwidth usage
- scalable object storage
- private evidence
- temporary authorized access through pre-signed URLs

---

# 13. AI Architecture — Amazon Bedrock

Bedrock is used for assistive incident assessment.

```text
Incident
   +
Evidence
   +
Description
   ↓
AI Analysis Service
   ↓
Amazon Bedrock
   ↓
Structured JSON
   ↓
AIAnalysis
   ↓
DynamoDB
```

Expected output:

```json
{
  "speciesGuess": "Indian peafowl",
  "incidentAssessment": "Possible injury",
  "urgency": "HIGH",
  "confidence": 0.82,
  "recommendedResponderType": "WILDLIFE_NGO",
  "safetyGuidance": [
    "Keep a safe distance",
    "Keep people away",
    "Do not attempt to move the animal"
  ]
}
```

---

# 14. AI Safety Boundary

Bedrock must remain assistive.

It should NOT:

```text
Diagnose an animal definitively
Confirm death
Tell citizens to touch wildlife
Tell citizens to capture wildlife
Tell citizens to move wildlife
Tell citizens to feed wildlife
Tell citizens to administer treatment
Replace a qualified responder
```

The responder remains responsible for the real-world decision.

---

# 15. Responder Routing Architecture

Routing is one of the core features of WildCare.

```text
Incident GPS
     ↓
Location Resolver
     ↓
District / City / Zone
     ↓
Service Area Matcher
     ↓
Verified + Active Responders
     ↓
Responder List
     ↓
Citizen Selects One
```

For MVP:

```text
District-based matching
```

is sufficient.

Example:

```text
Incident:
Aligarh

Matching:

Aligarh Forest Unit       ✓
Aligarh Wildlife NGO      ✓
Agra Rescue Unit          ✗
Delhi Rescue Unit         ✗
```

---

# 16. Advanced Geographic Matching

Future architecture:

```text
GPS
 ↓
Point-in-Polygon
 ↓
GeoJSON Service Areas
 ↓
Responder Matching
```

Potential future implementation:

- Amazon Location Service
- geospatial database/index
- dedicated GIS service

Do not add this complexity unless the MVP needs it.

---

# 17. Responder Model

WildCare separates:

```text
Organization
       +
Responder Profile
       +
Dispatch Configuration
```

This is intentional.

Example:

```text
Organization:
Aligarh Wildlife Rescue

Responder:
Aligarh Rescue Team

Service Area:
Aligarh District

Dispatch:
Email
SMS
Dashboard
```

Another example:

```text
Organization:
Forest Department

Responder:
Aligarh Forest Control Room

Dashboard:
Disabled

Dispatch:
SMS
VOICE
```

---

# 18. Dashboard vs Push-Only Architecture

During onboarding:

```text
Use WildCare Dashboard?
        │
     ┌──┴──┐
    YES    NO
     │      │
     ▼      ▼
Dashboard  Push-only
account    responder
```

### Dashboard responder

Receives:

```text
Incident notification
Dashboard access
Incident details
Evidence
Status workflow
```

### Push-only responder

Receives:

```text
SMS
Email
WhatsApp
Voice
Webhook/API
```

No WildCare login is required.

---

# 19. Dispatch Architecture

Dispatch should be asynchronous.

```text
Incident Assignment
       ↓
Create Dispatch Job
       ↓
SQS
       ↓
Dispatch Worker
       ↓
Read Dispatch Configuration
       ↓
Send Through Channel
       ↓
Record DispatchAttempt
```

Example:

```text
Responder selected
       ↓
SQS message
       ↓
Worker
       ↓
DASHBOARD → create responder notification
EMAIL     → SES/provider
SMS       → SNS/provider
WHATSAPP  → configured provider
VOICE     → configured voice provider
WEBHOOK   → responder API
```

---

# 20. Why SQS

SQS prevents communication providers from blocking the incident API.

Without a queue:

```text
Citizen
 ↓
API
 ↓
Email provider
 ↓
SMS provider
 ↓
WhatsApp provider
 ↓
Response
```

A provider failure could make the API slow or fail.

With SQS:

```text
Citizen
 ↓
API
 ↓
Assignment created
 ↓
202 Accepted
 ↓
SQS
 ↓
Worker
 ↓
External providers
```

This makes dispatch more reliable.

---

# 21. Retry Architecture

Dispatch failures should be retryable.

```text
Dispatch Worker
      ↓
Provider
      │
   ┌──┴───┐
 success failure
   │       │
   ▼       ▼
 SENT    retry
           │
           ▼
          SQS
```

Use:

- SQS retry
- visibility timeout
- dead-letter queue

Example:

```text
WildCareDispatchQueue
        ↓
DispatchWorker
        ↓
      failure
        ↓
WildCareDispatchDLQ
```

Admins can inspect failed dispatches.

---

# 22. Email Architecture

Recommended AWS-native option:

```text
Dispatch Worker
      ↓
Amazon SES
      ↓
Responder email
```

The message should contain:

```text
WildCare incident ID
Incident type
AI assessment
Urgency
Location link
Safety context
Evidence links
Responder action link
```

Private evidence links should be temporary.

---

# 23. SMS Architecture

Possible architecture:

```text
Dispatch Worker
      ↓
Amazon SNS
      ↓
Responder phone
```

If SNS or local SMS requirements are unsuitable, use a supported external SMS provider.

The provider must be abstracted behind:

```text
SmsDispatchProvider
```

so WildCare is not tightly coupled to one vendor.

---

# 24. WhatsApp Architecture

Conceptually:

```text
Dispatch Worker
      ↓
WhatsApp provider/API
      ↓
Responder
```

The provider implementation should be isolated:

```text
WhatsAppDispatchProvider
```

Do not claim WhatsApp delivery unless a real provider/API is configured.

---

# 25. Voice Call Architecture

For responders who are mobile-only:

```text
Dispatch Worker
      ↓
Voice Provider
      ↓
Responder phone
```

Message can be generated from structured incident data:

```text
"WildCare alert.
A wildlife incident has been reported in Aligarh.
Incident ID is ...
Urgency is high.
Please check the configured response process."
```

Text-to-speech should never invent medical or operational conclusions.

---

# 26. Webhook/API Architecture

For organizations with their own software:

```text
WildCare
   ↓
Webhook
   ↓
Responder System
```

Payload:

```json
{
  "event": "INCIDENT.DISPATCHED",
  "incidentId": "inc_001",
  "incidentType": "INJURED",
  "urgency": "HIGH",
  "location": {
    "latitude": 27.8971,
    "longitude": 78.088
  },
  "evidence": []
}
```

Webhook security should use:

```text
HTTPS
signature verification
secret/token
timestamp
idempotency
```

---

# 27. Event-Driven Architecture

Recommended event flow:

```text
IncidentCreated
      ↓
IncidentAnalyzed
      ↓
ResponderSelected
      ↓
IncidentDispatchRequested
      ↓
IncidentDispatched
      ↓
IncidentAcknowledged
      ↓
IncidentAccepted
      ↓
IncidentResolved
```

Events can be implemented using:

```text
SQS
EventBridge
```

For the hackathon, SQS is sufficient for dispatch.

---

# 28. Admin Architecture

Admin dashboard controls:

```text
Organization verification
        ↓
Responder creation
        ↓
Service areas
        ↓
Dispatch configuration
        ↓
Incident monitoring
        ↓
Dispatch failures
```

Admin operations should be audited.

Example:

```text
Admin
 ↓
Approve Organization
 ↓
Verification record
 ↓
AuditLog
```

---

# 29. Government Responder Architecture

Government/forest responders may not onboard themselves.

Admin creates:

```text
Organization
Responder Profile
Service Area
Dispatch Configuration
```

Example:

```text
Forest Department
      ↓
Aligarh Forest Control Room
      ↓
Aligarh District
      ↓
VOICE
SMS
```

This allows WildCare to integrate operationally without requiring every government user to create an account.

---

# 30. Location Privacy Architecture

Exact location is sensitive.

```text
Citizen
   │
   └── own incident → exact location

Selected responder
   │
   └── assigned incident → exact location

Admin
   │
   └── authorized operational access

Public
   │
   └── no exact wildlife coordinates
```

Do not put exact coordinates into public URLs, public maps, analytics pages, or public feeds.

---

# 31. Observability

Use Amazon CloudWatch.

Monitor:

```text
Lambda errors
Lambda duration
API 4xx
API 5xx
SQS queue depth
DLQ messages
Bedrock failures
Dispatch failures
DynamoDB throttling
S3 errors
```

Important application metrics:

```text
incidents_created
incidents_analyzed
responders_matched
assignments_created
dispatch_success
dispatch_failure
dispatch_retry
incident_acknowledged
incident_resolved
```

---

# 32. Logging

Use structured JSON logs.

Example:

```json
{
  "level": "INFO",
  "event": "INCIDENT_DISPATCHED",
  "incidentId": "inc_001",
  "responderId": "resp_001",
  "channel": "EMAIL",
  "timestamp": "2026-09-19T10:01:00Z"
}
```

Avoid logging:

- provider secrets
- Cognito tokens
- full private evidence
- unnecessary personal information
- exact sensitive coordinates unless operationally necessary

---

# 33. Secrets Management

Use AWS Secrets Manager for:

```text
WhatsApp credentials
SMS provider credentials
Voice provider credentials
Webhook secrets
API keys
```

Never commit:

```text
.env
API keys
provider passwords
AWS secret keys
```

to Git.

---

# 34. Security Architecture

```text
HTTPS
  ↓
API Gateway
  ↓
Cognito JWT
  ↓
Lambda authorization
  ↓
Domain authorization
  ↓
DynamoDB/S3
```

AWS IAM should follow least privilege.

Examples:

```text
API Lambda:
DynamoDB read/write
S3 metadata access
Bedrock invoke

Dispatch Lambda:
SQS consume
DynamoDB update
SES/SNS/provider access

Admin:
application-level ADMIN role
```

---

# 35. Failure Handling

## Bedrock failure

```text
Incident
 ↓
AI fails
 ↓
Store failure
 ↓
Allow safe fallback
 ↓
Responder selection can continue if required fields are available
```

AI must not become a single point of failure for reporting.

## S3 upload failure

```text
Upload fails
 ↓
Client retries
 ↓
New pre-signed URL if necessary
```

## Dispatch failure

```text
Provider fails
 ↓
DispatchAttempt = FAILED
 ↓
Retry
 ↓
DLQ after retry exhaustion
 ↓
Admin alert
```

---

# 36. End-to-End Architecture

```text
                     WILDCARE

┌───────────────────────────────────────────────────────┐
│                     CLIENTS                           │
│                                                       │
│  Citizen App/Web   Responder Dashboard   Admin       │
└───────────────┬───────────────┬───────────────┬───────┘
                │               │               │
                └───────────────┼───────────────┘
                                ▼
                         Amazon Cognito
                                │
                                ▼
                         API Gateway
                         /api/v1/*
                                │
                                ▼
                         Lambda API Layer
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
          DynamoDB              S3             Bedrock
              │                 │                 │
              │                 │                 ▼
              │                 │            AI Analysis
              │                 │
              │                 ▼
              │             Evidence
              │
              ▼
        Routing / Assignment
              │
              ▼
        Dispatch Request
              │
              ▼
             SQS
              │
              ▼
      Dispatch Worker Lambda
              │
      ┌───────┼────────┬──────────┐
      ▼       ▼        ▼          ▼
     SES     SMS    WhatsApp    Voice
      │       │        │          │
      └───────┴────────┴──────────┘
                    │
                    ▼
               Responders

              Monitoring
                    │
                    ▼
              CloudWatch
```

---

# 37. Recommended AWS Services

| Requirement | AWS Service |
|---|---|
| Authentication | Amazon Cognito |
| API | API Gateway |
| Compute | AWS Lambda |
| Database | DynamoDB |
| Evidence | Amazon S3 |
| AI | Amazon Bedrock |
| Queue | Amazon SQS |
| Events | EventBridge |
| Email | Amazon SES |
| SMS | Amazon SNS / external provider |
| Monitoring | CloudWatch |
| Secrets | Secrets Manager |
| Encryption | KMS |
| DNS | Route 53 |
| CDN/frontend | CloudFront / Vercel / Netlify |

---

# 38. Hackathon MVP Architecture

Do not build every production component.

Use:

```text
React
  ↓
Cognito
  ↓
API Gateway
  ↓
Lambda
  ├── DynamoDB
  ├── S3
  └── Bedrock
        ↓
Responder Matching
        ↓
SQS
        ↓
Dispatch Lambda
        ↓
Email / one additional channel
```

For the demo, this is enough to demonstrate the complete architecture.

---

# 39. What Should Be Real in the Demo

The strongest demo should make these components real:

```text
✓ Citizen authentication
✓ Incident creation
✓ Browser/device GPS
✓ Photo upload to S3
✓ Bedrock analysis
✓ Responder matching
✓ Citizen responder selection
✓ DynamoDB persistence
✓ Dispatch job
✓ At least one real notification channel
✓ Responder dashboard
✓ Incident status update
```

Additional channels can be shown as configurable architecture if provider credentials are not available.

Do not pretend a simulated external message was actually delivered.

---

# 40. Demo Scenario

Use one clear scenario:

```text
Citizen in Aligarh
      ↓
Finds injured wildlife
      ↓
Opens WildCare
      ↓
Takes photo
      ↓
GPS captured
      ↓
AI analyzes incident
      ↓
WildCare finds verified local responders
      ↓
Citizen selects responder
      ↓
Incident dispatched
      ↓
Responder receives alert
      ↓
Responder acknowledges
      ↓
Responder accepts
      ↓
Responder updates:
IN_PROGRESS
      ↓
Responder resolves
```

This demonstrates:

```text
AI
+
AWS
+
Geolocation
+
Routing
+
Communication
+
Real-world coordination
```

---

# 41. Production Evolution

After the hackathon:

```text
MVP
 ↓
SQS-based dispatch
 ↓
EventBridge events
 ↓
Advanced GIS
 ↓
Amazon Location Service
 ↓
More communication providers
 ↓
Responder APIs
 ↓
Analytics
 ↓
Multi-region reliability
```

The architecture should evolve without changing the core domain model.

---

# 42. Architecture Decision Summary

### Why Lambda?

Low operational overhead and event-driven workloads.

### Why DynamoDB?

Fast serverless operational storage with access-pattern-driven design.

### Why S3?

Large evidence files should not be stored in DynamoDB.

### Why Bedrock?

Native AWS AI integration for structured incident assistance.

### Why SQS?

Reliable asynchronous dispatch and retry.

### Why Cognito?

Managed authentication and JWT-based identity.

### Why separate dispatch configuration?

The responder should be independent from the communication channel.

```text
WHO → Responder
HOW → Dispatch Configuration
```

### Why citizen-selected responder?

The platform should present eligible local responders while keeping the final primary selection visible and explicit to the citizen.

---

# 43. Architecture Completion Criteria

The architecture is considered ready for MVP implementation when:

- [ ] Cognito authentication is defined
- [ ] `/api/v1` API boundary is defined
- [ ] DynamoDB data model is defined
- [ ] S3 evidence flow is defined
- [ ] Bedrock analysis flow is defined
- [ ] Responder geographic matching is defined
- [ ] Assignment flow is defined
- [ ] SQS dispatch flow is defined
- [ ] At least one notification channel is implemented
- [ ] Responder dashboard access is defined
- [ ] Admin verification is defined
- [ ] Location privacy is defined
- [ ] Logging and failure handling are defined

Next implementation planning should use:

```text
docs/folder-structure.md
```
