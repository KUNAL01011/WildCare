# WildCare — Domain Model & Schema

## 1. Purpose

This document defines the core domain entities, relationships, enums, and DynamoDB-oriented data model for WildCare.

WildCare is a coordination platform between citizens and verified wildlife responders. It does not replace wildlife authorities, rescue organizations, veterinarians, police, or government systems.

The schema is designed for the MVP and should remain simple enough to implement during the hackathon.

---

## 2. Core Domain Model

```text
User
 ├── Citizen
 └── Admin

Organization
 └── ResponderProfile
       ├── ServiceArea
       └── DispatchConfiguration

Citizen
 └── Incident
       ├── Evidence
       ├── AIAnalysis
       ├── IncidentAssignment
       ├── DispatchAttempt
       ├── StatusHistory
       └── AuditLog

IncidentAssignment
 └── ResponderProfile

DispatchConfiguration
 └── DispatchAttempt

Organization
 └── Verification
```

### Main relationship

```text
Citizen
   │
   │ creates
   ▼
Incident
   │
   ├── Evidence
   ├── AIAnalysis
   │
   ├── matched with ServiceArea
   │
   ▼
ResponderProfile
   │
   └── DispatchConfiguration
          │
          ▼
     DispatchAttempt
```

---

# 3. Entities

## 3.1 User

Represents an authenticated WildCare account.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `userId` | string | Yes | Unique user ID |
| `email` | string | No | User email |
| `phone` | string | No | User phone |
| `role` | enum | Yes | `CITIZEN` or `ADMIN` |
| `status` | enum | Yes | Account status |
| `createdAt` | datetime | Yes | Creation timestamp |
| `updatedAt` | datetime | Yes | Last update |

### Roles

```text
CITIZEN
ADMIN
```

Authentication is handled by Amazon Cognito.

---

# 4. Organization

Represents an organization capable of responding to wildlife incidents.

Examples:

- Forest Department
- Wildlife rescue NGO
- Veterinary organization
- Police/emergency authority
- Wildlife rehabilitation center
- Local rescue organization

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `organizationId` | string | Yes | Unique organization ID |
| `name` | string | Yes | Organization name |
| `type` | enum | Yes | Organization type |
| `description` | string | No | Organization description |
| `phone` | string | No | Main contact number |
| `email` | string | No | Main contact email |
| `status` | enum | Yes | Verification/activation state |
| `createdAt` | datetime | Yes | Creation timestamp |
| `updatedAt` | datetime | Yes | Last update |

### Organization Types

```text
FOREST_DEPARTMENT
GOVERNMENT_AUTHORITY
WILDLIFE_NGO
RESCUE_ORGANIZATION
VETERINARY_TEAM
POLICE
EMERGENCY_AUTHORITY
OTHER
```

### Organization Status

```text
PENDING_VERIFICATION
VERIFIED
SUSPENDED
REJECTED
```

Only `VERIFIED` organizations can receive active incident dispatches.

---

# 5. ResponderProfile

Represents the operational responder identity of an organization.

An organization can have one or more responder profiles when different teams or geographic units need different configurations.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `responderId` | string | Yes | Unique responder profile ID |
| `organizationId` | string | Yes | Parent organization |
| `displayName` | string | Yes | Name shown to citizens |
| `dashboardEnabled` | boolean | Yes | Whether responder uses WildCare dashboard |
| `active` | boolean | Yes | Whether responder can receive incidents |
| `verificationStatus` | enum | Yes | Verification state |
| `priority` | number | No | Optional routing/display priority |
| `createdAt` | datetime | Yes | Creation timestamp |
| `updatedAt` | datetime | Yes | Last update |

### Important rule

`dashboardEnabled` determines whether the organization receives a WildCare dashboard account.

It does **not** determine whether the responder can receive incidents.

A push-only responder can have:

```text
dashboardEnabled = false
active = true
```

and still receive incidents through configured external channels.

---

# 6. ServiceArea

Defines the geographic area where a responder can handle incidents.

For the MVP, service areas can be represented using:

- District
- City
- Administrative area
- GeoJSON polygon

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `serviceAreaId` | string | Yes | Unique service-area ID |
| `responderId` | string | Yes | Responder owning the area |
| `name` | string | Yes | Human-readable area name |
| `type` | enum | Yes | Geographic type |
| `district` | string | No | District name |
| `state` | string | No | State name |
| `geometry` | object | No | Polygon/GeoJSON |
| `active` | boolean | Yes | Whether area is active |

### Service Area Types

```text
DISTRICT
CITY
ZONE
POLYGON
```

### Example

```json
{
  "serviceAreaId": "area_aligarh_001",
  "responderId": "resp_forest_aligarh",
  "name": "Aligarh District",
  "type": "DISTRICT",
  "district": "Aligarh",
  "state": "Uttar Pradesh",
  "active": true
}
```

---

# 7. DispatchConfiguration

Defines how a responder receives incident notifications.

This separates:

```text
WHO receives the incident
        ↓
ResponderProfile

HOW they receive it
        ↓
DispatchConfiguration
```

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `dispatchConfigId` | string | Yes | Unique configuration ID |
| `responderId` | string | Yes | Target responder |
| `channel` | enum | Yes | Dispatch channel |
| `enabled` | boolean | Yes | Channel active/inactive |
| `destination` | string | Yes | Email, phone, webhook, etc. |
| `priority` | number | Yes | Channel priority |
| `templateId` | string | No | Optional message template |
| `createdAt` | datetime | Yes | Creation timestamp |
| `updatedAt` | datetime | Yes | Last update |

### Dispatch Channels

```text
DASHBOARD
EMAIL
SMS
WHATSAPP
VOICE
WEBHOOK
```

A responder can have multiple channels.

Example:

```text
Responder: Aligarh Wildlife Rescue

1. DASHBOARD → enabled
2. EMAIL     → enabled
3. SMS       → enabled
```

---

# 8. Incident

The central entity of WildCare.

Represents a wildlife incident reported by a citizen.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `incidentId` | string | Yes | Unique incident ID |
| `reportedBy` | string | Yes | Citizen user ID |
| `species` | string | No | Citizen/AI identified species |
| `incidentType` | enum | Yes | Incident category |
| `description` | string | Yes | Citizen description |
| `latitude` | number | Yes | Exact incident latitude |
| `longitude` | number | Yes | Exact incident longitude |
| `locationAccuracy` | number | No | GPS accuracy in meters |
| `locationVisibility` | enum | Yes | Privacy level |
| `status` | enum | Yes | Incident lifecycle status |
| `selectedResponderId` | string | No | Responder chosen by citizen |
| `aiAnalysisId` | string | No | Linked AI analysis |
| `createdAt` | datetime | Yes | Creation timestamp |
| `updatedAt` | datetime | Yes | Last update |

### Incident Types

```text
INJURED
TRAPPED
STRANDED
ENTANGLED
IN_HOME
IN_PUBLIC_AREA
ROAD_INCIDENT
AGGRESSIVE_BEHAVIOR
DEAD_OR_UNRESPONSIVE
UNKNOWN
OTHER
```

### Incident Status

```text
DRAFT
ANALYZING
AWAITING_RESPONDER_SELECTION
DISPATCHING
DISPATCHED
ACKNOWLEDGED
ACCEPTED
IN_PROGRESS
RESOLVED
CANCELLED
FAILED
```

### Important distinction

Do not use `DISPATCHED` as proof that a responder has accepted the incident.

```text
DISPATCHED
    ↓
Message/channel successfully submitted

ACKNOWLEDGED
    ↓
Responder has acknowledged receipt

ACCEPTED
    ↓
Responder has accepted responsibility
```

If the external channel cannot provide acknowledgement, the system should keep the incident at the appropriate known state.

---

# 9. Evidence

Stores metadata for photos/videos uploaded by citizens.

Actual files are stored in Amazon S3.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `evidenceId` | string | Yes | Unique evidence ID |
| `incidentId` | string | Yes | Parent incident |
| `type` | enum | Yes | Image/video |
| `s3Key` | string | Yes | Private S3 object key |
| `contentType` | string | Yes | MIME type |
| `size` | number | No | File size |
| `uploadedAt` | datetime | Yes | Upload timestamp |

### Evidence Types

```text
IMAGE
VIDEO
```

### Storage rule

Do not store large binary files inside DynamoDB.

Use:

```text
S3 → actual file
DynamoDB → metadata + S3 key
```

S3 objects should remain private.

Authorized users can receive temporary pre-signed URLs.

---

# 10. AIAnalysis

Stores Amazon Bedrock's structured assessment.

AI is assistive and should not be treated as authoritative medical or wildlife expertise.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `aiAnalysisId` | string | Yes | Unique analysis ID |
| `incidentId` | string | Yes | Parent incident |
| `model` | string | Yes | Bedrock model identifier |
| `speciesGuess` | string | No | Possible species |
| `incidentAssessment` | string | Yes | Structured assessment |
| `urgency` | enum | Yes | Urgency classification |
| `confidence` | number | No | Model confidence |
| `safetyGuidance` | array | Yes | Citizen safety guidance |
| `recommendedResponderType` | enum | No | Suggested responder category |
| `rawResponseKey` | string | No | Optional S3 reference |
| `createdAt` | datetime | Yes | Analysis timestamp |

### Urgency

```text
LOW
MEDIUM
HIGH
CRITICAL
UNKNOWN
```

### AI rules

The AI must not:

- provide definitive medical diagnosis
- confirm death
- instruct citizens to touch wildlife
- instruct citizens to move wildlife
- instruct citizens to feed wildlife
- instruct citizens to administer treatment
- replace responder judgement

The AI should provide structured assistance such as:

```text
Possible animal: snake
Possible condition: trapped
Urgency: HIGH
Safety:
- Keep distance
- Keep people away
- Do not attempt capture
```

---

# 11. IncidentAssignment

Represents the selected responder for an incident.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `assignmentId` | string | Yes | Unique assignment ID |
| `incidentId` | string | Yes | Incident |
| `responderId` | string | Yes | Selected responder |
| `assignedBy` | string | Yes | Citizen/Admin/system actor |
| `status` | enum | Yes | Assignment state |
| `assignedAt` | datetime | Yes | Assignment timestamp |
| `updatedAt` | datetime | Yes | Last update |

### Assignment Status

```text
SELECTED
DISPATCHING
DISPATCHED
ACKNOWLEDGED
ACCEPTED
DECLINED
CANCELLED
```

---

# 12. DispatchAttempt

Records every attempt to notify a responder.

This is important for reliability and auditability.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `dispatchAttemptId` | string | Yes | Unique attempt ID |
| `incidentId` | string | Yes | Incident |
| `responderId` | string | Yes | Target responder |
| `dispatchConfigId` | string | Yes | Channel configuration |
| `channel` | enum | Yes | Channel used |
| `status` | enum | Yes | Attempt status |
| `providerMessageId` | string | No | External provider ID |
| `attemptNumber` | number | Yes | Retry count |
| `errorCode` | string | No | Failure code |
| `errorMessage` | string | No | Failure description |
| `createdAt` | datetime | Yes | Attempt timestamp |

### Dispatch Attempt Status

```text
QUEUED
PROCESSING
SENT
DELIVERED
FAILED
RETRYING
```

Example:

```text
Attempt #1
EMAIL → FAILED

Attempt #2
SMS → SENT

Attempt #3
DASHBOARD → SENT
```

---

# 13. IncidentStatusHistory

Stores the lifecycle history of an incident.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---:|
| `historyId` | string | Yes | Unique history ID |
| `incidentId` | string | Yes | Incident |
| `fromStatus` | enum | No | Previous status |
| `toStatus` | enum | Yes | New status |
| `changedBy` | string | Yes | Actor |
| `reason` | string | No | Optional reason |
| `createdAt` | datetime | Yes | Change timestamp |

Example:

```text
DRAFT
→ ANALYZING
→ AWAITING_RESPONDER_SELECTION
→ DISPATCHING
→ DISPATCHED
→ ACKNOWLEDGED
→ ACCEPTED
→ IN_PROGRESS
→ RESOLVED
```

---

# 14. Verification

Stores organization verification information.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---:|
| `verificationId` | string | Yes | Unique ID |
| `organizationId` | string | Yes | Organization |
| `status` | enum | Yes | Verification state |
| `documents` | array | No | Document references |
| `reviewedBy` | string | No | Admin user |
| `reviewNotes` | string | No | Admin notes |
| `reviewedAt` | datetime | No | Review time |
| `createdAt` | datetime | Yes | Submission time |

### Verification Status

```text
PENDING
APPROVED
REJECTED
SUSPENDED
```

---

# 15. AuditLog

Tracks important administrative and security-sensitive actions.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `auditId` | string | Yes | Unique ID |
| `actorId` | string | Yes | User/admin |
| `action` | string | Yes | Action performed |
| `resourceType` | string | Yes | Resource category |
| `resourceId` | string | Yes | Resource ID |
| `metadata` | object | No | Additional information |
| `createdAt` | datetime | Yes | Event time |

Examples:

```text
ORGANIZATION_APPROVED
RESPONDER_CREATED
SERVICE_AREA_UPDATED
INCIDENT_VIEWED
INCIDENT_STATUS_CHANGED
DISPATCH_CONFIG_UPDATED
```

---

# 16. Notification

Represents notifications shown to citizens or dashboard responders.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---:|
| `notificationId` | string | Yes | Unique ID |
| `recipientId` | string | Yes | User/responder |
| `incidentId` | string | No | Related incident |
| `type` | enum | Yes | Notification type |
| `title` | string | Yes | Notification title |
| `message` | string | Yes | Notification content |
| `read` | boolean | Yes | Read state |
| `createdAt` | datetime | Yes | Creation timestamp |

---

# 17. Recommended DynamoDB Design

WildCare should use an access-pattern-driven DynamoDB design rather than trying to reproduce a traditional SQL schema.

For the hackathon MVP, use a single primary application table:

```text
WildCareTable
```

with:

```text
PK
SK
GSI1PK
GSI1SK
GSI2PK
GSI2SK
entityType
...
```

The application layer maps domain objects to DynamoDB items.

---

# 18. DynamoDB Key Patterns

## User

```text
PK = USER#<userId>
SK = PROFILE
```

Example:

```text
PK: USER#usr_123
SK: PROFILE
entityType: USER
```

---

## Organization

```text
PK = ORG#<organizationId>
SK = PROFILE
```

---

## Responder

```text
PK = RESPONDER#<responderId>
SK = PROFILE
```

---

## Service Area

```text
PK = RESPONDER#<responderId>
SK = AREA#<serviceAreaId>
```

---

## Dispatch Configuration

```text
PK = RESPONDER#<responderId>
SK = DISPATCH#<dispatchConfigId>
```

---

## Incident

```text
PK = INCIDENT#<incidentId>
SK = PROFILE
```

---

## Incident Evidence

```text
PK = INCIDENT#<incidentId>
SK = EVIDENCE#<evidenceId>
```

---

## AI Analysis

```text
PK = INCIDENT#<incidentId>
SK = AI#<aiAnalysisId>
```

---

## Assignment

```text
PK = INCIDENT#<incidentId>
SK = ASSIGNMENT#<assignmentId>
```

---

## Dispatch Attempt

```text
PK = INCIDENT#<incidentId>
SK = DISPATCH#<dispatchAttemptId>
```

---

## Status History

```text
PK = INCIDENT#<incidentId>
SK = STATUS#<timestamp>#<historyId>
```

This allows the complete incident timeline to be retrieved with one partition-key query.

---

# 19. Global Secondary Indexes

## GSI1 — Citizen Incidents

Purpose:

```text
Get all incidents reported by a citizen.
```

```text
GSI1PK = USER#<userId>
GSI1SK = INCIDENT#<createdAt>#<incidentId>
```

Query:

```text
GSI1PK = USER#usr_123
```

---

## GSI2 — Responder Incidents

Purpose:

```text
Get incidents assigned to a responder.
```

```text
GSI2PK = RESPONDER#<responderId>
GSI2SK = INCIDENT#<createdAt>#<incidentId>
```

This powers the responder dashboard.

---

# 20. Geographic Matching

DynamoDB should not be treated as a full GIS engine.

For the MVP, use a simple geographic routing layer:

```text
Incident GPS
    ↓
Determine district/city
    ↓
Find active service areas
    ↓
Filter verified responders
    ↓
Return matching responders
```

For a more advanced implementation:

```text
GPS coordinates
      ↓
GeoJSON polygon check
      ↓
ServiceArea overlap
      ↓
Responder list
```

The geographic matching service should return:

```json
[
  {
    "responderId": "resp_001",
    "organizationName": "Aligarh Wildlife Rescue",
    "serviceArea": "Aligarh District",
    "distanceKm": 8.4,
    "channels": ["DASHBOARD", "SMS"]
  }
]
```

The citizen then chooses the responder.

---

# 21. Location Privacy Model

Exact wildlife coordinates are sensitive.

### Citizen

Can access:

```text
Their submitted incident
Exact incident location
```

### Selected responder

Can access:

```text
Exact incident location
Evidence
AI assessment
Citizen-provided information
```

### Admin

Can access:

```text
Exact location
All incident information
```

### Public

Should not receive:

```text
Exact wildlife coordinates
Private evidence
Citizen contact information
```

---

# 22. Incident Lifecycle

```text
DRAFT
  ↓
ANALYZING
  ↓
AWAITING_RESPONDER_SELECTION
  ↓
DISPATCHING
  ↓
DISPATCHED
  ↓
ACKNOWLEDGED
  ↓
ACCEPTED
  ↓
IN_PROGRESS
  ↓
RESOLVED
```

Alternative paths:

```text
DISPATCHING → FAILED
DISPATCHED → CANCELLED
ACKNOWLEDGED → DECLINED
```

---

# 23. MVP Entity Priority

Implement these first:

### P0 — Required

```text
User
Organization
ResponderProfile
ServiceArea
DispatchConfiguration
Incident
Evidence
AIAnalysis
IncidentAssignment
DispatchAttempt
```

### P1 — Strongly recommended

```text
IncidentStatusHistory
Verification
AuditLog
Notification
```

Do not over-engineer additional entities during the hackathon.

---

# 24. Example End-to-End Data

```json
{
  "incidentId": "inc_001",
  "reportedBy": "usr_123",
  "incidentType": "INJURED",
  "species": "Indian peafowl",
  "description": "Bird appears injured near a roadside area.",
  "latitude": 27.8971,
  "longitude": 78.0880,
  "status": "DISPATCHED",
  "selectedResponderId": "resp_001",
  "aiAnalysisId": "ai_001"
}
```

Responder:

```json
{
  "responderId": "resp_001",
  "organizationId": "org_001",
  "displayName": "Aligarh Wildlife Rescue",
  "dashboardEnabled": true,
  "active": true
}
```

Dispatch configuration:

```json
{
  "dispatchConfigId": "dispatch_001",
  "responderId": "resp_001",
  "channel": "DASHBOARD",
  "enabled": true,
  "destination": "resp_001",
  "priority": 1
}
```

---

# 25. Domain Rules

1. Only verified organizations can become active responders.
2. Only active responders can receive new incidents.
3. Citizens choose the primary responder after WildCare displays eligible responders.
4. WildCare must not claim successful delivery unless the communication provider confirms the relevant delivery state.
5. `DISPATCHED` does not automatically mean `ACKNOWLEDGED`.
6. Exact incident coordinates are private.
7. S3 evidence objects remain private.
8. AI output is advisory.
9. Admins control geographic service-area configuration.
10. Government responders may be manually created by admins.
11. Push-only responders do not require WildCare dashboard accounts.
12. Dashboard responders require authentication.
13. Every dispatch attempt should be logged.
14. Failed dispatches should support retry.
15. Important status transitions should be auditable.
16. Duplicate detection may flag similar incidents but should not silently merge them.
17. Citizen safety guidance must be shown before or alongside incident submission.
18. WildCare coordinates response; it does not replace professional responders.

---

# 26. Hackathon Implementation Simplification

For the 3-day MVP, the following simplifications are acceptable:

```text
Service areas:
District/city matching first

Database:
Single DynamoDB table

Evidence:
S3

Authentication:
Cognito

AI:
Bedrock

Dispatch:
One real channel + mocked/configurable additional channels

Admin verification:
Manual dashboard action

Government responders:
Admin-created profiles

Notifications:
Email/SMS/console integration depending on available credentials
```

The domain model should remain compatible with adding WhatsApp, voice, webhooks, and more advanced geographic polygons later.

---

## 27. Next Document

After this document, define the HTTP/API contracts in:

```text
docs/api-design.md
```

The API design should map directly to these domain entities and the user flows.
