# WildCare — API Design

## 1. Purpose

This document defines the MVP REST API for WildCare.

The API sits between:

```text
React Web / Mobile
        ↓
Amazon Cognito
        ↓
API Gateway
        ↓
AWS Lambda
        ↓
WildCare Domain Services
        ↓
DynamoDB / S3 / Bedrock / Dispatch Providers
```

The API is designed around the domain model and user flows already defined.

---

# 2. API Principles

1. REST-style HTTP APIs.
2. JSON request/response bodies.
3. Cognito JWT required for authenticated endpoints.
4. Role-based authorization is enforced server-side.
5. Citizens cannot access other citizens' incidents.
6. Responders can access only incidents assigned to their responder profile.
7. Admins can manage organizations, responders, service areas, and verification.
8. Exact wildlife coordinates are never exposed through public endpoints.
9. Evidence files are stored in S3, not DynamoDB.
10. Large files use pre-signed S3 upload URLs.
11. Dispatch operations are asynchronous where possible.
12. Every important state transition is recorded.
13. API responses should not claim acknowledgement unless acknowledgement is actually available.
14. External provider failures should be represented explicitly.

---

# 3. Base URL

Example:

```text
https://api.wildcare.in/api/v1
```

Local development:

```text
http://localhost:3000/api/v1
```

All application endpoints use the `/api/v1` prefix. No API endpoint should use `/v1` directly.

---

# 4. Authentication

Authentication is handled by Amazon Cognito.

The client sends:

```http
Authorization: Bearer <cognito-access-token>
```

API Gateway/Lambda validates the JWT.

### Roles

```text
CITIZEN
RESPONDER
ADMIN
```

The responder role is associated with a verified responder profile.

---

# 5. Standard Response Format

Successful response:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "Incident was not found."
  }
}
```

Validation error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request.",
    "fields": {
      "latitude": "Required",
      "longitude": "Required"
    }
  }
}
```

---

# 6. HTTP Status Codes

| Status | Meaning |
|---|---|
| `200` | Successful request |
| `201` | Resource created |
| `202` | Accepted for asynchronous processing |
| `204` | Successful request with no body |
| `400` | Invalid request |
| `401` | Missing/invalid authentication |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict |
| `422` | Validation/business-rule failure |
| `429` | Rate limited |
| `500` | Internal server error |
| `502` | External provider failure |
| `503` | Service unavailable |

---

# 7. API Modules

```text
/auth
/users
/incidents
/responders
/organizations
/service-areas
/dispatch
/notifications
/admin
/uploads
```

Cognito handles most authentication operations, so the application API does not need to implement password storage.

---

# 8. User APIs

## 8.1 Get Current User

```http
GET /api/v1/v1/users/me
```

### Auth

```text
CITIZEN
RESPONDER
ADMIN
```

### Response

```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "email": "citizen@example.com",
    "role": "CITIZEN",
    "status": "ACTIVE"
  }
}
```

---

# 9. Incident APIs

## 9.1 Create Incident Draft

```http
POST /api/v1/v1/incidents
```

### Auth

```text
CITIZEN
```

### Request

```json
{
  "incidentType": "INJURED",
  "description": "An injured bird is near the roadside.",
  "latitude": 27.8971,
  "longitude": 78.088,
  "locationAccuracy": 8.5
}
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "status": "DRAFT"
  }
}
```

---

# 10. Upload Evidence

## 10.1 Request Upload URL

```http
POST /api/v1/v1/incidents/{incidentId}/evidence/upload-url
```

### Auth

```text
CITIZEN
```

### Request

```json
{
  "fileName": "wildlife.jpg",
  "contentType": "image/jpeg",
  "size": 2458123
}
```

### Response

```json
{
  "success": true,
  "data": {
    "evidenceId": "ev_001",
    "uploadUrl": "https://s3-presigned-url",
    "expiresIn": 900
  }
}
```

The client uploads directly to S3 using the pre-signed URL.

The backend does not need to proxy the large file.

---

# 11. Complete Evidence Upload

```http
POST /api/v1/v1/incidents/{incidentId}/evidence
```

### Request

```json
{
  "evidenceId": "ev_001",
  "type": "IMAGE",
  "s3Key": "incidents/inc_001/ev_001.jpg",
  "contentType": "image/jpeg"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "evidenceId": "ev_001",
    "type": "IMAGE"
  }
}
```

---

# 12. Analyze Incident

```http
POST /api/v1/v1/incidents/{incidentId}/analyze
```

### Auth

```text
CITIZEN
```

### Behavior

```text
Incident
   ↓
Fetch evidence
   ↓
Amazon Bedrock
   ↓
Structured AIAnalysis
   ↓
Save result
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "analysisId": "ai_001",
    "status": "AWAITING_RESPONDER_SELECTION",
    "analysis": {
      "speciesGuess": "Indian peafowl",
      "urgency": "HIGH",
      "confidence": 0.82,
      "safetyGuidance": [
        "Keep a safe distance.",
        "Keep people away from the animal.",
        "Do not attempt to move or treat the animal."
      ]
    }
  }
}
```

AI output is advisory.

---

# 13. Get Incident

```http
GET /api/v1/v1/incidents/{incidentId}
```

### Auth

```text
CITIZEN
RESPONDER
ADMIN
```

Authorization rules:

```text
Citizen:
  Own incidents only

Responder:
  Assigned incidents only

Admin:
  Any incident
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "incidentType": "INJURED",
    "species": "Indian peafowl",
    "description": "An injured bird is near the roadside.",
    "status": "DISPATCHED",
    "aiAnalysis": {},
    "evidence": [],
    "responder": {}
  }
}
```

Exact location is included only for authorized users.

---

# 14. List Citizen Incidents

```http
GET /api/v1/v1/incidents?mine=true
```

### Auth

```text
CITIZEN
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "incidentId": "inc_001",
        "incidentType": "INJURED",
        "status": "DISPATCHED",
        "createdAt": "2026-09-19T10:00:00Z"
      }
    ],
    "nextCursor": null
  }
}
```

---

# 15. Find Eligible Responders

```http
GET /api/v1/v1/incidents/{incidentId}/responders
```

### Auth

```text
CITIZEN
```

### Behavior

```text
Incident GPS
    ↓
Service-area matching
    ↓
Verified + active responders
    ↓
Return eligible responders
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "responderId": "resp_001",
        "organizationName": "Aligarh Wildlife Rescue",
        "displayName": "Aligarh Wildlife Rescue",
        "serviceArea": "Aligarh District",
        "distanceKm": 8.4,
        "availableChannels": [
          "DASHBOARD",
          "EMAIL",
          "SMS"
        ]
      }
    ]
  }
}
```

Do not expose private responder configuration such as webhook URLs or provider credentials.

---

# 16. Select Responder

```http
POST /api/v1/v1/incidents/{incidentId}/assignment
```

### Auth

```text
CITIZEN
```

### Request

```json
{
  "responderId": "resp_001"
}
```

### Behavior

```text
Validate responder
        ↓
Validate service area
        ↓
Create assignment
        ↓
Move incident to DISPATCHING
        ↓
Trigger dispatch workflow
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "responderId": "resp_001",
    "status": "DISPATCHING"
  }
}
```

Recommended HTTP status:

```text
202 Accepted
```

because dispatch can happen asynchronously.

---

# 17. Citizen Submit Incident

For a simplified MVP, the frontend can use a single endpoint after all data is ready.

```http
POST /api/v1/v1/incidents/{incidentId}/submit
```

### Auth

```text
CITIZEN
```

### Behavior

```text
Validate incident
    ↓
Validate evidence
    ↓
Validate safety acknowledgement
    ↓
Run/verify AI analysis
    ↓
Find responders
    ↓
Set status
    ↓
Return responder options
```

### Request

```json
{
  "safetyAcknowledged": true
}
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "status": "AWAITING_RESPONDER_SELECTION",
    "responders": []
  }
}
```

---

# 18. Responder APIs

## 18.1 Get Responder Profile

```http
GET /api/v1/v1/responders/me
```

### Auth

```text
RESPONDER
```

### Response

```json
{
  "success": true,
  "data": {
    "responderId": "resp_001",
    "organizationId": "org_001",
    "displayName": "Aligarh Wildlife Rescue",
    "dashboardEnabled": true,
    "active": true
  }
}
```

---

# 19. Responder Incident Queue

```http
GET /api/v1/v1/responders/me/incidents
```

### Auth

```text
RESPONDER
```

### Query Parameters

```text
status=DISPATCHED
status=ACKNOWLEDGED
status=IN_PROGRESS
cursor=<cursor>
limit=20
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "incidentId": "inc_001",
        "incidentType": "INJURED",
        "urgency": "HIGH",
        "status": "DISPATCHED",
        "createdAt": "2026-09-19T10:00:00Z"
      }
    ],
    "nextCursor": null
  }
}
```

---

# 20. Responder Acknowledge Incident

```http
POST /api/v1/v1/incidents/{incidentId}/acknowledge
```

### Auth

```text
RESPONDER
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "status": "ACKNOWLEDGED"
  }
}
```

---

# 21. Responder Accept Incident

```http
POST /api/v1/v1/incidents/{incidentId}/accept
```

### Auth

```text
RESPONDER
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "status": "ACCEPTED"
  }
}
```

---

# 22. Responder Decline Incident

```http
POST /api/v1/v1/incidents/{incidentId}/decline
```

### Auth

```text
RESPONDER
```

### Request

```json
{
  "reason": "Outside current operational capacity."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "status": "CANCELLED"
  }
}
```

A future version can return the incident to responder selection rather than cancelling it.

---

# 23. Update Incident Status

```http
PATCH /api/v1/v1/incidents/{incidentId}/status
```

### Auth

```text
RESPONDER
ADMIN
```

### Request

```json
{
  "status": "IN_PROGRESS"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "status": "IN_PROGRESS"
  }
}
```

Server-side validation must prevent invalid transitions.

Example:

```text
DRAFT → RESOLVED
```

should not be accepted.

---

# 24. Resolve Incident

```http
POST /api/v1/v1/incidents/{incidentId}/resolve
```

### Auth

```text
RESPONDER
ADMIN
```

### Request

```json
{
  "resolutionNote": "Responder attended the location."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "incidentId": "inc_001",
    "status": "RESOLVED"
  }
}
```

---

# 25. Organization APIs

## 25.1 Apply as Organization

```http
POST /api/v1/v1/organizations/apply
```

### Auth

```text
Public / authenticated applicant
```

### Request

```json
{
  "name": "Aligarh Wildlife Rescue",
  "type": "WILDLIFE_NGO",
  "description": "Wildlife rescue organization",
  "email": "contact@example.org",
  "phone": "+91XXXXXXXXXX"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "organizationId": "org_001",
    "status": "PENDING_VERIFICATION"
  }
}
```

---

# 26. Admin APIs

## 26.1 List Organization Applications

```http
GET /api/v1/v1/admin/organizations?status=PENDING_VERIFICATION
```

### Auth

```text
ADMIN
```

---

# 27. Verify Organization

```http
POST /api/v1/v1/admin/organizations/{organizationId}/verify
```

### Request

```json
{
  "decision": "APPROVED",
  "reviewNotes": "Credentials verified."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "organizationId": "org_001",
    "status": "VERIFIED"
  }
}
```

---

# 28. Create Responder

Used by admins for both normal organizations and government responders.

```http
POST /api/v1/v1/admin/responders
```

### Request

```json
{
  "organizationId": "org_001",
  "displayName": "Aligarh Forest Response Unit",
  "dashboardEnabled": false,
  "active": true
}
```

Government responders can therefore be provisioned without self-registration.

---

# 29. Configure Service Area

```http
POST /api/v1/v1/admin/responders/{responderId}/service-areas
```

### Request

```json
{
  "name": "Aligarh District",
  "type": "DISTRICT",
  "district": "Aligarh",
  "state": "Uttar Pradesh"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "serviceAreaId": "area_001",
    "responderId": "resp_001"
  }
}
```

---

# 30. Configure Dispatch Channel

```http
POST /api/v1/v1/admin/responders/{responderId}/dispatch-configurations
```

### Request

```json
{
  "channel": "EMAIL",
  "destination": "rescue@example.org",
  "enabled": true,
  "priority": 1
}
```

### Response

```json
{
  "success": true,
  "data": {
    "dispatchConfigId": "dispatch_001",
    "channel": "EMAIL",
    "enabled": true
  }
}
```

Sensitive provider credentials should never be returned through this API.

---

# 31. Dispatch APIs

## 31.1 Get Dispatch History

```http
GET /api/v1/v1/incidents/{incidentId}/dispatches
```

### Auth

```text
RESPONDER
ADMIN
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "dispatchAttemptId": "attempt_001",
        "channel": "EMAIL",
        "status": "SENT",
        "attemptNumber": 1,
        "createdAt": "2026-09-19T10:01:00Z"
      }
    ]
  }
}
```

---

# 32. Retry Dispatch

```http
POST /api/v1/v1/incidents/{incidentId}/dispatch/retry
```

### Auth

```text
ADMIN
```

### Request

```json
{
  "channel": "SMS"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "status": "QUEUED"
  }
}
```

---

# 33. Notification APIs

## 33.1 Get Notifications

```http
GET /api/v1/v1/notifications
```

### Auth

```text
CITIZEN
RESPONDER
ADMIN
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "notificationId": "notification_001",
        "type": "INCIDENT_UPDATE",
        "title": "Incident updated",
        "message": "Your incident has been acknowledged.",
        "read": false
      }
    ]
  }
}
```

---

# 34. Mark Notification Read

```http
PATCH /api/v1/v1/notifications/{notificationId}/read
```

### Response

```json
{
  "success": true
}
```

---

# 35. Admin Incident Search

```http
GET /api/v1/v1/admin/incidents
```

### Query parameters

```text
status
urgency
incidentType
responderId
district
from
to
cursor
limit
```

Example:

```http
GET /api/v1/v1/admin/incidents?status=DISPATCHED&district=Aligarh
```

---

# 36. API Authorization Matrix

| Endpoint | Citizen | Responder | Admin |
|---|---:|---:|---:|
| `GET /users/me` | ✓ | ✓ | ✓ |
| Create incident | ✓ | — | — |
| Upload evidence | ✓ | — | — |
| Analyze incident | ✓ | — | ✓ |
| Get own incident | ✓ | — | ✓ |
| Find responders | ✓ | — | ✓ |
| Select responder | ✓ | — | ✓ |
| Responder queue | — | ✓ | ✓ |
| Acknowledge | — | ✓ | ✓ |
| Accept | — | ✓ | ✓ |
| Update status | — | ✓ | ✓ |
| Resolve | — | ✓ | ✓ |
| Organization apply | ✓ | — | ✓ |
| Verify organization | — | — | ✓ |
| Create responder | — | — | ✓ |
| Configure service area | — | — | ✓ |
| Configure dispatch | — | — | ✓ |
| View dispatch history | — | ✓ | ✓ |
| Retry dispatch | — | — | ✓ |
| Notifications | ✓ | ✓ | ✓ |
| Admin search | — | — | ✓ |

---

# 37. Incident Submission Sequence

```text
Citizen
   │
   ├── POST /incidents
   │
   ├── POST /incidents/:id/evidence/upload-url
   │
   ├── Upload directly to S3
   │
   ├── POST /incidents/:id/evidence
   │
   ├── POST /incidents/:id/submit
   │
   └── POST /incidents/:id/analyze
                    │
                    ▼
                 Bedrock
                    │
                    ▼
        AWAITING_RESPONDER_SELECTION
                    │
                    ▼
        GET /api/v1/incidents/:id/responders
                    │
                    ▼
       POST /incidents/:id/assignment
                    │
                    ▼
               DISPATCHING
                    │
                    ▼
             Dispatch Worker
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
      Email        SMS       Dashboard
```

---

# 38. Asynchronous Processing

The following operations should preferably be asynchronous:

```text
AI analysis
Dispatch
Email
SMS
WhatsApp
Voice
Webhook
Retry processing
```

Recommended pattern:

```text
API Gateway
    ↓
Lambda
    ↓
DynamoDB status update
    ↓
SQS/EventBridge
    ↓
Worker Lambda
    ↓
External provider
```

For the hackathon, the first implementation can simplify this to:

```text
API Lambda
    ↓
Dispatch Lambda
```

and introduce SQS if time permits.

---

# 39. Idempotency

Important mutation endpoints should support an optional:

```http
Idempotency-Key: <unique-key>
```

Especially:

```text
POST /api/v1/incidents
POST /api/v1/incidents/:id/assignment
POST /api/v1/incidents/:id/dispatch/retry
```

This prevents duplicate incident creation or duplicate dispatches when clients retry requests.

Example:

```http
Idempotency-Key: 9b7d2f...
```

---

# 40. Validation Rules

### Incident

```text
latitude: -90 to 90
longitude: -180 to 180
description: non-empty
incidentType: valid enum
```

### Evidence

```text
Allowed:
image/jpeg
image/png
image/webp
video/mp4
```

File size limits should be enforced before issuing the upload URL.

### Assignment

```text
Responder must:
- exist
- be verified
- be active
- cover the incident location
```

---

# 41. Error Codes

Recommended application-level codes:

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_ERROR

INCIDENT_NOT_FOUND
INCIDENT_INVALID_STATE
INCIDENT_ACCESS_DENIED
INCIDENT_ALREADY_ASSIGNED

RESPONDER_NOT_FOUND
RESPONDER_INACTIVE
RESPONDER_NOT_ELIGIBLE
NO_RESPONDER_AVAILABLE

ORGANIZATION_NOT_FOUND
ORGANIZATION_NOT_VERIFIED

EVIDENCE_NOT_FOUND
EVIDENCE_UPLOAD_FAILED

AI_ANALYSIS_FAILED

DISPATCH_FAILED
DISPATCH_CONFIGURATION_NOT_FOUND
DISPATCH_PROVIDER_ERROR
DISPATCH_ALREADY_SENT

INVALID_STATUS_TRANSITION

RATE_LIMITED
INTERNAL_ERROR
```

---

# 42. API Design for the Hackathon

Do not implement every endpoint before the demo.

### Must implement

```text
POST   /incidents
POST   /incidents/:id/evidence/upload-url
POST   /incidents/:id/evidence
POST   /incidents/:id/analyze
GET    /incidents/:id/responders
POST   /incidents/:id/assignment
GET    /incidents/:id
GET    /responders/me/incidents
POST   /incidents/:id/acknowledge
POST   /incidents/:id/accept
PATCH  /incidents/:id/status
POST   /incidents/:id/resolve
```

### Admin demo

```text
POST   /admin/organizations/:id/verify
POST   /admin/responders
POST   /admin/responders/:id/service-areas
POST   /admin/responders/:id/dispatch-configurations
```

### Can be simplified/mocked

```text
WhatsApp
Voice
Advanced GIS polygons
Complex notification preferences
Advanced analytics
Automatic duplicate merging
```

---

# 43. API-to-AWS Mapping

| API Capability | AWS |
|---|---|
| Authentication | Amazon Cognito |
| REST API | API Gateway |
| API logic | Lambda |
| Incident data | DynamoDB |
| Evidence | S3 |
| AI analysis | Amazon Bedrock |
| Async dispatch | SQS |
| Scheduled/retry workflows | EventBridge / SQS |
| Email | SES |
| SMS | SNS or external provider |
| Monitoring | CloudWatch |
| Secrets | Secrets Manager |
| Encryption | KMS |

---

# 44. Security Requirements

1. Validate Cognito JWT on every protected request.
2. Never trust a `userId` supplied by the client for authorization.
3. Derive the authenticated user from the JWT.
4. Check ownership/assignment server-side.
5. Never expose S3 bucket credentials to clients.
6. Use pre-signed URLs for evidence.
7. Never return provider credentials.
8. Store secrets in AWS Secrets Manager.
9. Log security-sensitive actions.
10. Rate-limit public and incident-creation endpoints.
11. Sanitize user-provided descriptions before rendering in dashboards.
12. Avoid logging exact sensitive wildlife coordinates unnecessarily.
13. Encrypt sensitive data at rest and in transit.

---

# 45. Final API Flow

The primary WildCare API journey is:

```text
Citizen
   ↓
Create Incident
   ↓
Upload Evidence
   ↓
AI Analysis
   ↓
Responder Discovery
   ↓
Citizen Selects Responder
   ↓
Assignment Created
   ↓
Dispatch Engine
   ↓
Dashboard / Email / SMS / WhatsApp / Voice / API
   ↓
Responder Acknowledges
   ↓
Responder Accepts
   ↓
Responder Works
   ↓
Incident Resolved
```

This API design is intentionally compatible with the domain model while leaving the dispatch layer extensible for additional communication providers.
