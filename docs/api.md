# WildCare — API Specification

## 1. API Conventions

Base URL:

```text
/api/v1
```

Example:

```text
POST /api/v1/reports
```

Content types:

```text
application/json
multipart/form-data
```

Authentication:

```text
Authorization: Bearer <access_token>
```

---

# 2. Standard Response

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Location is required"
  }
}
```

---

# 3. Authentication APIs

## POST /api/v1/auth/google

Authenticate a citizen using Google.

### Request

```json
{
  "idToken": "google-id-token"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "name": "Kunal Kumar",
      "email": "user@example.com"
    },
    "accessToken": "..."
  }
}
```

---

## GET /api/v1/auth/me

Returns the current authenticated user.

### Response

```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "name": "Kunal Kumar",
    "email": "user@example.com"
  }
}
```

---

# 4. Citizen Report APIs

## GET /api/v1/reports

Returns reports belonging to the authenticated citizen.

### Query Parameters

```text
status
page
limit
```

Example:

```text
GET /api/v1/reports?status=RESOLVED&page=1&limit=20
```

---

## POST /api/v1/reports

Creates a new report and uploads incident images.

### Content Type

```text
multipart/form-data
```

### Fields

```text
images[]
latitude
longitude
incidentOccurredAt
```

### Example

```text
images[] = photo.jpg
latitude = 28.3670
longitude = 79.4304
```

### Response

```json
{
  "success": true,
  "data": {
    "reportId": "rpt_123",
    "reportNumber": "WC-10231",
    "status": "ANALYZING"
  }
}
```

---

## GET /api/v1/reports/:reportId

Returns a citizen's report.

### Response

```json
{
  "success": true,
  "data": {
    "id": "rpt_123",
    "reportNumber": "WC-10231",
    "status": "READY_FOR_REVIEW",
    "animal": {
      "name": "deer",
      "confidence": 0.91
    },
    "condition": {
      "ai": "injured",
      "confidence": 0.84,
      "citizen": null
    },
    "severity": "high",
    "location": {
      "latitude": 28.367,
      "longitude": 79.4304,
      "city": "Bareilly",
      "state": "Uttar Pradesh",
      "postalCode": "244001"
    },
    "images": []
  }
}
```

---

## PATCH /api/v1/reports/:reportId

Updates citizen-reviewable fields before final submission.

### Request

```json
{
  "animalName": "deer",
  "citizenCondition": "dead",
  "severity": "high",
  "description": "Animal found beside the road."
}
```

---

## POST /api/v1/reports/:reportId/submit

Finalizes a citizen-reviewed report.

### Response

```json
{
  "success": true,
  "data": {
    "reportId": "rpt_123",
    "status": "SUBMITTED"
  }
}
```

---

# 5. Responder APIs

## GET /api/v1/reports/:reportId/responders

Returns responder bodies matched to the report.

### Query Parameters

```text
limit
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "body_123",
      "name": "Forest Department Bareilly",
      "type": "GOVERNMENT",
      "verified": true,
      "distanceKm": 4.2,
      "services": ["WILDLIFE_RESCUE", "INJURED_ANIMAL"],
      "phone": "+91XXXXXXXXXX",
      "averageResponseTimeMinutes": 28
    }
  ]
}
```

---

## GET /api/v1/responders/:bodyId

Returns public responder details.

### Response

```json
{
  "success": true,
  "data": {
    "id": "body_123",
    "name": "Forest Department Bareilly",
    "type": "GOVERNMENT",
    "description": "Wildlife response body",
    "verified": true,
    "phone": "+91XXXXXXXXXX",
    "email": "example@gov.in",
    "location": {
      "state": "Uttar Pradesh",
      "district": "Bareilly",
      "city": "Bareilly"
    },
    "services": ["WILDLIFE_RESCUE"]
  }
}
```

---

# 6. Contact APIs

## POST /api/v1/reports/:reportId/contact

Records a contact attempt.

### Request

```json
{
  "bodyId": "body_123",
  "type": "PHONE"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "contactAttemptId": "contact_123",
    "status": "INITIATED"
  }
}
```

The mobile application may then open the native phone dialer.

---

## POST /api/v1/reports/:reportId/response

Updates the citizen's understanding of the response.

### Request

```json
{
  "status": "RESPONDER_CONTACTED"
}
```

Allowed citizen-facing values should be restricted by backend rules.

---

# 7. Feedback APIs

## POST /api/v1/reports/:reportId/feedback

Creates feedback for the responder interaction.

### Request

```json
{
  "bodyId": "body_123",
  "overallRating": 5,
  "responseTimeRating": 5,
  "professionalismRating": 5,
  "outcome": "SUCCESSFUL",
  "comment": "They responded quickly."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "feedbackId": "fb_123"
  }
}
```

---

# 8. Admin Authentication

Admin authentication should use a separate protected flow.

Example:

```text
POST /api/v1/admin/auth/login
```

or an external identity provider.

Do not allow a normal citizen token to access admin APIs.

---

# 9. Admin Dashboard APIs

## GET /api/v1/admin/dashboard

Returns dashboard summary.

### Response

```json
{
  "success": true,
  "data": {
    "citizens": 9341,
    "reports": 12482,
    "activeReports": 31,
    "resolvedReports": 11842,
    "bodies": 182,
    "governmentBodies": 54,
    "ngoBodies": 76,
    "privateBodies": 52,
    "feedback": 8431
  }
}
```

---

# 10. Admin Citizen APIs

## GET /api/v1/admin/citizens

Query parameters:

```text
search
state
district
city
page
limit
```

---

## GET /api/v1/admin/citizens/:userId

Returns citizen profile and report history.

---

# 11. Admin Report APIs

## GET /api/v1/admin/reports

Query parameters:

```text
search
status
animal
condition
state
district
city
from
to
page
limit
```

Example:

```text
GET /api/v1/admin/reports?state=Uttar%20Pradesh&district=Bareilly
```

---

## GET /api/v1/admin/reports/:reportId

Returns the complete administrative report view.

Includes:

```text
Citizen
Images
AI analysis
Citizen assessment
Location
Responder matches
Contact attempts
Events
Feedback
```

---

# 12. Admin Body APIs

## GET /api/v1/admin/bodies

Query parameters:

```text
search
type
verificationStatus
state
district
city
page
limit
```

---

## POST /api/v1/admin/bodies

Creates a responder body.

### Request

```json
{
  "name": "Forest Department Bareilly",
  "type": "GOVERNMENT",
  "description": "Wildlife response organization",
  "phone": "+91XXXXXXXXXX",
  "email": "example@gov.in",
  "state": "Uttar Pradesh",
  "district": "Bareilly",
  "city": "Bareilly",
  "postalCode": "244001",
  "latitude": 28.367,
  "longitude": 79.43,
  "services": ["WILDLIFE_RESCUE", "INJURED_ANIMAL"]
}
```

---

## GET /api/v1/admin/bodies/:bodyId

Returns complete body details.

---

## PATCH /api/v1/admin/bodies/:bodyId

Updates body information.

---

## PATCH /api/v1/admin/bodies/:bodyId/verification

Updates verification status.

### Request

```json
{
  "status": "VERIFIED"
}
```

Allowed values:

```text
PENDING
UNDER_REVIEW
VERIFIED
REJECTED
SUSPENDED
```

---

# 13. Admin Feedback APIs

## GET /api/v1/admin/feedback

Query parameters:

```text
bodyId
bodyType
state
district
city
rating
from
to
page
limit
```

Example:

```text
GET /api/v1/admin/feedback?state=Uttar%20Pradesh&district=Bareilly
```

---

## GET /api/v1/admin/feedback/:feedbackId

Returns complete feedback details.

---

# 14. Admin Location APIs

## GET /api/v1/admin/locations/states

Returns supported states.

---

## GET /api/v1/admin/locations/states/:state/districts

Returns districts.

---

## GET /api/v1/admin/locations/districts/:district/cities

Returns cities.

---

## GET /api/v1/admin/locations/summary

Returns location-level platform statistics.

Query parameters:

```text
state
district
city
from
to
```

Example:

```text
GET /api/v1/admin/locations/summary?state=Uttar%20Pradesh&district=Bareilly
```

---

# 15. Admin Analytics APIs

## GET /api/v1/admin/analytics/reports

Returns report statistics.

Possible filters:

```text
state
district
city
from
to
```

---

## GET /api/v1/admin/analytics/bodies

Returns body statistics grouped by body type.

---

## GET /api/v1/admin/analytics/feedback

Returns feedback statistics.

---

## GET /api/v1/admin/analytics/response-time

Returns response-time statistics.

---

# 16. Health API

## GET /api/v1/health

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

---

# 17. Authorization Matrix

| Resource              |     Citizen |    Admin |
| --------------------- | ----------: | -------: |
| Own profile           |        Read |     Read |
| Own reports           |  Read/Write |     Read |
| Other citizen reports |          No |     Read |
| Submit report         |         Yes | Optional |
| Responder list        |        Read |     Read |
| Contact responder     |         Yes |     Read |
| Own feedback          | Create/Read |     Read |
| All feedback          |          No |     Read |
| Create body           |          No |      Yes |
| Verify body           |          No |      Yes |
| Manage bodies         |          No |      Yes |
| Dashboard             |          No |      Yes |
| Analytics             |          No |      Yes |

---

# 18. Error Codes

Recommended error codes:

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_ERROR
RESOURCE_NOT_FOUND
REPORT_NOT_FOUND
BODY_NOT_FOUND
INVALID_REPORT_STATUS
LOCATION_REQUIRED
IMAGE_REQUIRED
IMAGE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
AI_ANALYSIS_FAILED
BODY_NOT_VERIFIED
FEEDBACK_ALREADY_EXISTS
INTERNAL_SERVER_ERROR
```

---

# 19. API Design Principles

1. All endpoints use `/api/v1`.
2. Authentication is enforced server-side.
3. Authorization is checked for every protected resource.
4. Client-provided user IDs are never trusted.
5. Report ownership is verified before citizen access.
6. Admin APIs are separated under `/admin`.
7. AI is treated as an analysis service, not the final authority.
8. Image binary data is stored outside PostgreSQL.
9. Important state changes create report events.
10. APIs should return stable, predictable response structures.
