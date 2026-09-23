# WildCare — Domain and Database Schema

## 1. Domain Overview

WildCare consists of these domains:

```text
Authentication
Users
Reports
Report Images
AI Analysis
Locations
Responder Bodies
Responder Services
Responder Matching
Contact Attempts
Feedback
Administration
```

---

# 2. Core Relationship

```text
USER
 │
 └── REPORT
       │
       ├── REPORT_IMAGES
       ├── AI_ANALYSIS
       ├── LOCATION SNAPSHOT
       ├── RESPONDER_MATCHES
       │       │
       │       └── BODY
       │
       ├── CONTACT_ATTEMPTS
       │
       └── FEEDBACK
```

---

# 3. User

Represents a citizen application account.

```text
User
-------------------------
id
googleId
name
email
profileImage
createdAt
updatedAt
```

### Rules

- `googleId` should be unique.
- Email should be unique where guaranteed by the authentication provider.
- User cannot access another user's reports.

---

# 4. Admin User

Administrators should be separated logically from citizen permissions.

```text
AdminUser
-------------------------
id
email
name
role
status
createdAt
updatedAt
```

Example roles:

```text
SUPER_ADMIN
ADMIN
```

Admin authorization must be enforced server-side.

---

# 5. Report

The report is the central business entity.

```text
Report
-------------------------
id
reportNumber
userId

status

animalType
animalName

aiCondition
citizenCondition

severity

description

latitude
longitude

state
district
city
postalCode
address

incidentOccurredAt
createdAt
updatedAt
submittedAt
resolvedAt
```

### Why store location directly?

The report needs a historical location snapshot.

If a location database changes later, the original incident must still show the location captured when the report was created.

---

# 6. Report Status

```text
DRAFT
ANALYZING
READY_FOR_REVIEW
SUBMITTED
RESPONDER_CONTACTED
RESPONDER_ACCEPTED
IN_PROGRESS
RESOLVED
UNABLE_TO_REACH_RESPONDER
CANCELLED
```

---

# 7. Report Image

Images belong to a report.

```text
ReportImage
-------------------------
id
reportId
storageKey
url
mimeType
fileSize
sortOrder
createdAt
```

The database stores object-storage references, not image binary data.

---

# 8. AI Analysis

AI output must be preserved separately from citizen-confirmed information.

```text
AIAnalysis
-------------------------
id
reportId

animalName
animalConfidence

condition
conditionConfidence

severity
severityConfidence

observations
rawResponse

model
modelVersion

status

createdAt
updatedAt
```

### Example

```json
{
  "animalName": "deer",
  "animalConfidence": 0.91,
  "condition": "injured",
  "conditionConfidence": 0.84,
  "severity": "high"
}
```

---

# 9. Location

Location data can be normalized for geographic filtering.

```text
Location
-------------------------
id
countryCode
countryName
state
district
city
postalCode
latitude
longitude
```

Reports should still preserve their own historical location snapshot.

---

# 10. Responder Body

A body represents an organization that may respond to incidents.

```text
ResponderBody
-------------------------
id
name
type
description

phone
email
website

address
state
district
city
postalCode

latitude
longitude

verificationStatus
availabilityStatus

createdAt
updatedAt
verifiedAt
```

---

# 11. Responder Body Type

```text
GOVERNMENT
NGO
PRIVATE
```

---

# 12. Verification Status

```text
PENDING
UNDER_REVIEW
VERIFIED
REJECTED
SUSPENDED
```

Only appropriate verified bodies should be presented as verified to citizens.

---

# 13. Body Services

A body may provide multiple services.

```text
ResponderService
-------------------------
id
bodyId
serviceType
createdAt
```

Example services:

```text
WILDLIFE_RESCUE
INJURED_ANIMAL
TRAPPED_ANIMAL
DEAD_ANIMAL
VETERINARY_SUPPORT
EMERGENCY_RESPONSE
```

---

# 14. Supported Animal Types

A body can support multiple animal categories.

```text
ResponderAnimalSupport
-------------------------
id
bodyId
animalType
createdAt
```

This allows matching such as:

```text
Incident = Deer
        ↓
Bodies supporting Deer/Wildlife
```

---

# 15. Responder Match

This records which bodies were considered/recommended for a report.

```text
ReportResponderMatch
-------------------------
id
reportId
bodyId

distanceKm
matchReason

rank
isRecommended

createdAt
```

`matchReason` can describe factors such as:

```text
SERVICE_MATCH
LOCATION_MATCH
VERIFIED
AVAILABLE
```

Avoid storing only a generic "best" label.

---

# 16. Contact Attempt

Records that a citizen initiated contact with a responder.

```text
ContactAttempt
-------------------------
id
reportId
bodyId
userId

type
status

initiatedAt
createdAt
updatedAt
```

Example:

```text
type:
PHONE

status:
INITIATED
```

The system must not treat this as proof that a phone call was answered.

---

# 17. Response Event

A response timeline can be represented by events.

```text
ReportEvent
-------------------------
id
reportId
type
description
actorType
actorId
createdAt
```

Example event types:

```text
REPORT_CREATED
AI_ANALYSIS_COMPLETED
REPORT_SUBMITTED
CONTACT_INITIATED
RESPONDER_CONTACTED
RESPONDER_ACCEPTED
RESPONSE_STARTED
REPORT_RESOLVED
FEEDBACK_SUBMITTED
```

This gives the report a complete timeline.

---

# 18. Feedback

```text
Feedback
-------------------------
id
reportId
bodyId
userId

overallRating
responseTimeRating
professionalismRating

outcome
comment

createdAt
updatedAt
```

Ratings should normally use:

```text
1–5
```

---

# 19. Feedback Outcome

Example values:

```text
SUCCESSFUL
PARTIALLY_SUCCESSFUL
UNSUCCESSFUL
UNKNOWN
```

---

# 20. Suggested Prisma Model Structure

Illustrative structure:

```prisma
model User {
  id           String   @id @default(cuid())
  googleId     String   @unique
  name         String
  email        String   @unique
  profileImage  String?

  reports      Report[]
  feedback     Feedback[]
  contacts     ContactAttempt[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Report {
  id                 String   @id @default(cuid())
  reportNumber       String   @unique
  userId             String

  status             ReportStatus

  animalType         String?
  animalName         String?
  aiCondition        String?
  citizenCondition   String?
  severity           String?
  description        String?

  latitude           Decimal
  longitude          Decimal
  state              String?
  district           String?
  city               String?
  postalCode         String?
  address            String?

  incidentOccurredAt DateTime?
  submittedAt        DateTime?
  resolvedAt         DateTime?

  user               User     @relation(fields: [userId], references: [id])
  images             ReportImage[]
  aiAnalyses         AIAnalysis[]
  matches            ReportResponderMatch[]
  contacts           ContactAttempt[]
  feedback           Feedback[]
  events             ReportEvent[]

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([state, district, city])
}

model ReportImage {
  id          String   @id @default(cuid())
  reportId    String
  storageKey  String
  url         String
  mimeType    String
  fileSize    Int
  sortOrder   Int      @default(0)

  report      Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())

  @@index([reportId])
}

model AIAnalysis {
  id                    String   @id @default(cuid())
  reportId              String

  animalName            String?
  animalConfidence      Decimal?
  condition             String?
  conditionConfidence   Decimal?
  severity              String?
  severityConfidence    Decimal?

  observations          Json?
  rawResponse           Json?

  model                 String?
  modelVersion          String?
  status                String

  report                Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([reportId])
}

model ResponderBody {
  id                  String   @id @default(cuid())
  name                String
  type                BodyType
  description         String?

  phone               String?
  email               String?
  website             String?

  address             String?
  state               String?
  district             String?
  city                String?
  postalCode          String?

  latitude            Decimal?
  longitude           Decimal?

  verificationStatus  VerificationStatus @default(PENDING)
  availabilityStatus  AvailabilityStatus @default(UNKNOWN)

  matches             ReportResponderMatch[]
  contacts            ContactAttempt[]
  feedback            Feedback[]
  services            ResponderService[]
  animalSupport       ResponderAnimalSupport[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  verifiedAt          DateTime?

  @@index([type])
  @@index([state, district, city])
  @@index([verificationStatus])
}

enum BodyType {
  GOVERNMENT
  NGO
  PRIVATE
}

enum VerificationStatus {
  PENDING
  UNDER_REVIEW
  VERIFIED
  REJECTED
  SUSPENDED
}

enum AvailabilityStatus {
  AVAILABLE
  UNAVAILABLE
  UNKNOWN
}

enum ReportStatus {
  DRAFT
  ANALYZING
  READY_FOR_REVIEW
  SUBMITTED
  RESPONDER_CONTACTED
  RESPONDER_ACCEPTED
  IN_PROGRESS
  RESOLVED
  UNABLE_TO_REACH_RESPONDER
  CANCELLED
}
```

The remaining models can be added after the core schema is stable.

---

# 21. Domain Rules

### Rule 1

A report cannot be submitted without:

```text
At least one image
+
Latitude
+
Longitude
```

### Rule 2

AI analysis does not automatically become citizen-confirmed data.

### Rule 3

Only authorized admins can create/verify/suspend responder bodies.

### Rule 4

Only verified eligible bodies should be recommended as verified responders.

### Rule 5

A contact attempt does not prove successful communication.

### Rule 6

Feedback must belong to the report that generated the responder interaction.

### Rule 7

Historical report location must not be silently changed.

### Rule 8

Admin analytics should be derived from stored events/reports rather than manually entered counters.
