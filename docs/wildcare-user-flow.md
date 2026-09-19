# WildCare — User Flows

> Version: 1.0  
> Product: WildCare  
> Purpose: Define the primary user journeys and system workflows before domain, schema, API, and architecture implementation.

---

# 1. Flow Overview

WildCare has four major workflows:

```text
1. Citizen Incident Reporting
2. Responder Organization Onboarding
3. Government Responder Provisioning
4. Incident Dispatch & Response
```

The complete platform flow is:

```text
Citizen
   ↓
Capture Incident
   ↓
Capture GPS + Evidence
   ↓
AI Assessment
   ↓
Find Eligible Responders
   ↓
Citizen Selects Responder
   ↓
Submit Incident
   ↓
Dispatch Engine
   ↓
Responder's Configured Channel
   ↓
Responder Action
   ↓
Status Updates
   ↓
Citizen Tracking
```

---

# 2. Flow 1 — Citizen Incident Reporting

## 2.1 Start

```text
Citizen
  ↓
Open WildCare
  ↓
Start New Incident
```

The citizen begins a new wildlife incident report.

---

## 2.2 Safety Notice

Before collecting incident information, WildCare displays basic safety guidance.

```text
Maintain safe distance.
Do not touch or move the animal.
Do not attempt rescue.
Do not feed the animal.
```

The citizen continues after acknowledging the safety guidance.

```text
Safety Notice
     ↓
Acknowledge
     ↓
Continue
```

---

# 3. Incident Capture

## 3.1 Capture Evidence

The citizen can:

```text
Take Photo
   OR
Upload Photo
   OR
Upload Video
```

MVP priority:

```text
Photo
```

The evidence is uploaded to private storage.

```text
Citizen
   ↓
Photo
   ↓
S3
```

The system creates an evidence reference.

---

# 4. Location Capture

After or during evidence capture, WildCare requests location permission.

```text
Request Location
       ↓
Permission Granted?
     /          YES        NO
    │          │
    ▼          ▼
Capture GPS   Show location error
    │
    ▼
Latitude
Longitude
Accuracy
Timestamp
```

The incident should not silently use an unrelated location.

If exact location cannot be captured, the user should be informed and given an appropriate fallback.

---

# 5. Citizen Description

The citizen can provide an optional description.

Example:

```text
"I found this animal near the roadside.
It appears unable to move one of its legs."
```

The description is stored with the incident draft.

---

# 6. AI-Assisted Assessment

Once evidence is available:

```text
Photo / Video
      +
Description
      ↓
Amazon Bedrock
      ↓
AI Assessment
```

Possible output:

```text
Animal:
Possible Deer

Incident:
Possible Injury

Urgency:
HIGH

Confidence:
0.79

Visible Indicators:
Possible abnormal leg position

Safety Advice:
Maintain a safe distance.
Do not touch or move the animal.
```

The AI result is shown to the citizen for review.

---

# 7. AI Review

The citizen sees:

```text
AI-Assisted Assessment

Possible Animal:
Deer

Possible Condition:
Injury

Urgency:
HIGH

[ Edit Information ]

[ Continue ]
```

The citizen can correct basic incident information before continuing.

AI output is not final authority.

---

# 8. Responder Discovery

After location and incident information are available:

```text
Incident
   ↓
Location
   ↓
Responder Matching Engine
   ↓
Eligible Responders
```

The system checks:

- Geographic coverage
- Organization verification
- Responder status
- Supported incident types
- Supported animal types
- Availability/configuration

Example:

```text
Aligarh Incident

Eligible Responders:

Forest Department — Aligarh
Coverage: Aligarh District
Dispatch: Voice Call

Wildlife NGO
Coverage: Aligarh + Nearby Districts
Dispatch: WhatsApp

Wildlife Rescue Organization
Coverage: Uttar Pradesh
Dispatch: Dashboard
```

---

# 9. Citizen Selects Responder

The citizen chooses one responder.

```text
Eligible Responders
        ↓
Citizen Selects
        ↓
Selected Responder
```

The selected responder becomes the primary dispatch target.

WildCare does not automatically send the incident to every responder unless a future multi-dispatch feature is explicitly enabled.

---

# 10. Incident Review

Before final submission, the citizen sees:

```text
Incident Review

Animal:
Possible Deer

Incident:
Possible Injury

Urgency:
HIGH

Location:
Aligarh, Uttar Pradesh

Evidence:
1 Photo

Responder:
Forest Department — Aligarh

Dispatch:
Voice Call

[ Edit ]

[ Submit Incident ]
```

The citizen confirms the report.

---

# 11. Incident Creation

After confirmation:

```text
Submit
  ↓
Validate Request
  ↓
Create Incident
  ↓
Generate Incident ID
  ↓
Create Assignment
  ↓
Start Dispatch
```

Example:

```text
Incident ID:
WC-000123
```

The incident is no longer a draft.

---

# 12. Dispatch Engine Flow

```text
Incident Created
       ↓
Selected Responder
       ↓
Read Dispatch Configuration
       ↓
Determine Channel
       ↓
Execute Dispatch
```

The dispatch channel depends on the responder profile.

---

# 13. Dashboard Dispatch

For dashboard-enabled responders:

```text
Incident
   ↓
Create Dashboard Assignment
   ↓
Responder Dashboard
   ↓
Notification
   ↓
Responder Opens Incident
```

The responder can then:

```text
View
  ↓
Acknowledge
  ↓
Accept
  ↓
Update Status
```

---

# 14. WhatsApp Dispatch

For a WhatsApp responder:

```text
Incident
   ↓
Generate Standard Report
   ↓
WhatsApp Provider
   ↓
Responder WhatsApp
```

Example message:

```text
WILDCARE INCIDENT

Incident: WC-000123
Animal: Possible Deer
Condition: Possible Injury
Urgency: HIGH

Location:
[Secure Google Maps Link]

AI Assessment:
Possible leg injury.

Description:
Animal found near roadside.
```

The exact integration depends on the selected WhatsApp Business/API provider.

---

# 15. Email Dispatch

For an email responder:

```text
Incident
   ↓
Generate Email
   ↓
Email Provider
   ↓
Responder Email
```

The email contains:

- Incident ID
- Animal
- Incident type
- Urgency
- Location
- Description
- AI assessment
- Evidence
- Timestamp

---

# 16. Voice Call Dispatch

For a mobile-only responder:

```text
Incident
   ↓
Voice Dispatch Service
   ↓
Text-to-Speech
   ↓
Responder Phone
```

Example:

```text
WildCare wildlife incident alert.

Incident WC-000123.

A possible injured deer has been reported.

The urgency is high.

The reported location is available in the incident details.
```

The system records the call attempt and provider result.

A successful phone connection does not automatically mean that the responder accepted the incident.

---

# 17. Webhook/API Dispatch

For organizations with their own software:

```text
Incident
   ↓
Generate Structured Payload
   ↓
Authenticated Webhook/API
   ↓
External Responder System
```

Example:

```json
{
  "incidentId": "WC-000123",
  "animalType": "DEER",
  "incidentType": "INJURED",
  "urgency": "HIGH",
  "location": {
    "latitude": 27.89,
    "longitude": 78.08
  }
}
```

The dispatch system records:

```text
SENT
DELIVERED
FAILED
RETRYING
```

---

# 18. Dispatch Failure Flow

Every external dispatch can fail.

```text
Dispatch
   ↓
Success?
 /     YES     NO
 │       │
 ▼       ▼
Delivered  Retry
            ↓
         Success?
         /            YES      NO
        │        │
        ▼        ▼
    Delivered   Failed
                 ↓
            Admin Alert
```

A failed dispatch must not be represented as a successful notification.

---

# 19. Citizen Post-Submission Flow

After submitting:

```text
Incident Submitted
       ↓
Show Incident ID
       ↓
Show Selected Responder
       ↓
Show Dispatch Status
       ↓
Track Incident
```

Example:

```text
Incident:
WC-000123

Responder:
Forest Department — Aligarh

Dispatch:
Delivered

Current Status:
Awaiting Responder Acknowledgement
```

The citizen can view the incident later from:

```text
My Incidents
```

---

# 20. Responder Dashboard Flow

For dashboard-enabled responders:

```text
Login
  ↓
Dashboard
  ↓
New Incidents
  ↓
Open Incident
  ↓
View Details
```

Incident details include:

```text
Incident ID
Animal
Incident Type
Urgency
Description
Evidence
Location
AI Assessment
Created At
```

The responder can then:

```text
Acknowledge
    ↓
Accept
    ↓
In Progress
    ↓
Resolved
```

---

# 21. Responder Status Flow

```text
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

Possible alternative outcomes:

```text
REJECTED
DUPLICATE
CANCELLED
```

Important:

```text
DISPATCHED ≠ ACCEPTED
ACCEPTED ≠ RESOLVED
```

---

# 22. Citizen Status Tracking

Citizen sees only appropriate status information.

Example:

```text
✓ Report Created

✓ Responder Notified

✓ Dispatch Delivered

○ Awaiting Responder

○ Response In Progress

○ Resolved
```

The citizen must not see an artificial "Resolved" status unless a responder or authorized actor actually marks the incident resolved.

---

# 23. Flow 2 — Responder Organization Onboarding

An organization wants to join WildCare.

```text
Organization
      ↓
Visit WildCare Website
      ↓
Apply as Responder
      ↓
Submit Organization Details
      ↓
Submit Credentials
      ↓
Define Service Areas
      ↓
Choose Dispatch Method
      ↓
Dashboard Opt-In
      ↓
Submit Application
```

---

# 24. Admin Review Flow

```text
New Application
      ↓
Admin Reviews
      ↓
Credentials Valid?
    /         NO         YES
   │          │
   ▼          ▼
Reject      Approve
              ↓
        Organization Verified
```

Possible states:

```text
PENDING
UNDER_REVIEW
VERIFIED
REJECTED
SUSPENDED
```

---

# 25. Dashboard Opt-In Flow

After verification:

```text
Dashboard Opt-In?
      /           YES        NO
     │          │
     ▼          ▼
Create       Push-Only
Account      Responder
     │          │
     ▼          ▼
Dashboard    External
Access       Dispatch
```

---

# 26. Push-Only Responder Flow

For an organization that does not want a dashboard:

```text
Organization
      ↓
Dashboard = NO
      ↓
Select Dispatch Channel
      ↓
Configure Contact
      ↓
Admin Verification
      ↓
Active Push-Only Responder
```

Possible channels:

```text
EMAIL
WHATSAPP
VOICE_CALL
WEBHOOK
```

No responder login is required.

---

# 27. Flow 3 — Government Responder Provisioning

Government responders may be manually added by an administrator.

```text
Admin
  ↓
Create Government Responder
  ↓
Enter Officer/Department Details
  ↓
Enter Jurisdiction
  ↓
Configure Service Area
  ↓
Configure Contact
  ↓
Configure Dispatch Method
  ↓
Verify
  ↓
Active
```

Example:

```text
Department:
Forest Department

Jurisdiction:
Aligarh District

Contact:
Government Officer

Dashboard:
NO

Dispatch:
VOICE_CALL
```

---

# 28. Flow 4 — Geographic Responder Matching

When an incident is created:

```text
Incident Location
       ↓
Get Coordinates
       ↓
Find Service Areas
       ↓
Check Responder Status
       ↓
Check Organization Verification
       ↓
Check Supported Incident
       ↓
Eligible Responders
```

Conceptually:

```text
Incident
  │
  │ latitude + longitude
  ▼
Service Area Matching
  │
  ├── Responder A ✓
  ├── Responder B ✓
  ├── Responder C ✗ outside area
  └── Responder D ✗ suspended
  │
  ▼
Eligible Responder List
```

---

# 29. Service Area Flow

A responder can have:

### District Coverage

```text
Aligarh District
```

### Multiple District Coverage

```text
Aligarh
Hathras
Etah
Kasganj
```

### State Coverage

```text
Uttar Pradesh
```

### Future Custom Polygon

```text
GIS Polygon
```

The routing engine should be designed so the matching implementation can evolve without changing the citizen workflow.

---

# 30. Duplicate Incident Flow

WildCare may identify possible duplicates.

```text
New Incident
      ↓
Check Nearby Incidents
      ↓
Check Time Window
      ↓
Check Animal Type
      ↓
Check Incident Type
      ↓
Possible Duplicate?
     /          NO         YES
   │           │
   ▼           ▼
Continue    Show Warning
                ↓
          Admin/Authorized Review
```

Example:

```text
Possible duplicate incident found:

WC-000118
Distance: 400m
Reported: 7 minutes ago
Animal: Deer
```

The system should not automatically merge incidents without an authorized decision.

---

# 31. Location Privacy Flow

```text
Incident Created
       ↓
Location Stored Privately
       ↓
Access Request
       ↓
Check Role + Authorization
       ↓
Authorized?
    /         YES        NO
   │          │
   ▼          ▼
Exact       Restricted
Location    Location
```

Access principles:

```text
Citizen
  → Own incident location

Authorized Responder
  → Exact location when needed

Admin
  → Authorized administrative access

Public
  → No exact sensitive wildlife location
```

---

# 32. Safety Flow

At minimum, safety guidance appears:

```text
Before Reporting
       ↓
Safety Instructions
       ↓
Citizen Acknowledges
       ↓
Continue
```

AI may provide incident-specific safety guidance.

Example:

```text
Maintain distance.
Do not approach the animal.
Do not attempt to move it.
```

Safety guidance must not encourage risky intervention.

---

# 33. Authentication Flow

### Citizen

```text
Open App
   ↓
Login / Register
   ↓
Cognito
   ↓
Authenticated
   ↓
Citizen Application
```

### Responder

```text
Open Dashboard
   ↓
Login
   ↓
Cognito
   ↓
Check Responder Role
   ↓
Check Organization
   ↓
Dashboard
```

### Admin

```text
Admin Login
   ↓
Cognito
   ↓
Check Admin Role
   ↓
Admin Panel
```

---

# 34. Error Flows

## Location Permission Denied

```text
Location Request
      ↓
Denied
      ↓
Explain Requirement
      ↓
Allow Retry
```

## Evidence Upload Failed

```text
Upload
  ↓
Failed
  ↓
Retry
  ↓
Still Failed
  ↓
Show Error
```

## AI Analysis Failed

```text
AI Analysis
    ↓
Failed
    ↓
Retry
    ↓
Failed Again
    ↓
Allow Citizen to Continue With Manual Information
```

The system should not invent AI results when Bedrock fails.

## No Responder Found

```text
Location
   ↓
Responder Matching
   ↓
No Eligible Responder
   ↓
Show Alternative Options
```

Possible alternatives:

```text
General emergency guidance
Manual contact options
Nearby broader-coverage responder
```

## Dispatch Failed

```text
Dispatch
   ↓
Failure
   ↓
Retry
   ↓
Failure
   ↓
Mark FAILED_DISPATCH
   ↓
Admin Alert
```

---

# 35. Complete Citizen Journey

```text
┌─────────────────────┐
│ Open WildCare       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Safety Notice       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Capture Photo       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Capture GPS         │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Add Description     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Bedrock Assessment  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Review Assessment   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Find Responders     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Select Responder    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Review Report       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Submit Incident     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Dispatch Engine     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Responder Channel   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Track Status        │
└─────────────────────┘
```

---

# 36. Complete Responder Journey

```text
Incident Created
      ↓
Responder Selected
      ↓
Dispatch
      ↓
┌─────────────────────┐
│ Dashboard           │
│ WhatsApp            │
│ Email               │
│ Voice               │
│ Webhook             │
└──────────┬──────────┘
           ↓
Responder Receives
           ↓
Acknowledges
           ↓
Accepts
           ↓
In Progress
           ↓
Resolved
```

---

# 37. Complete Admin Journey

```text
Admin Login
     ↓
Admin Dashboard
     │
     ├── Organizations
     │      ↓
     │   Review
     │      ↓
     │   Verify / Reject
     │
     ├── Responders
     │      ↓
     │   Create / Suspend
     │
     ├── Service Areas
     │      ↓
     │   Configure Coverage
     │
     ├── Dispatch
     │      ↓
     │   Configure Channel
     │
     ├── Government
     │      ↓
     │   Manual Provisioning
     │
     └── Monitoring
            ↓
        Dispatch / Audit
```

---

# 38. Critical Business Rules

1. Only verified responders can receive incidents.
2. The citizen selects the primary responder.
3. Responder eligibility is based on configured coverage and capabilities.
4. Dashboard access is optional.
5. Push-only responders do not require dashboard accounts.
6. Government responders can be manually provisioned by admins.
7. Dispatch method is configured per responder/organization.
8. A dispatch does not equal acceptance.
9. Acknowledgement requires an actual acknowledgement signal.
10. Resolution requires responder/authorized confirmation.
11. Exact sensitive wildlife coordinates are protected.
12. AI output is advisory.
13. AI failure must not create fake assessment data.
14. Dispatch failure must be recorded.
15. Duplicate detection should not automatically merge incidents.
16. Citizens must receive basic wildlife safety guidance.
17. External communication credentials must never be exposed to citizens.
18. Every important administrative and dispatch action should be auditable.

---

# 39. Flow-to-Domain Mapping

The user flows imply the following major domain objects:

```text
Citizen Flow
    ↓
User
Incident
Evidence
AIAnalysis

Responder Discovery
    ↓
Organization
ResponderProfile
ServiceArea

Responder Selection
    ↓
IncidentAssignment

Dispatch
    ↓
DispatchConfiguration
DispatchAttempt
Notification

Status Tracking
    ↓
IncidentStatusHistory

Administration
    ↓
AuditLog
```

These objects will be formally defined in:

```text
domain-and-schema.md
```

---

# 40. Flow Completion Criteria

The core WildCare workflow is considered complete when:

```text
Citizen
  ↓
Creates Incident
  ↓
Provides Evidence
  ↓
Captures Location
  ↓
Receives AI Assessment
  ↓
Finds Eligible Responders
  ↓
Selects Responder
  ↓
Submits Incident
  ↓
Dispatch Occurs
  ↓
Responder Receives Incident
  ↓
Responder Updates Status
  ↓
Citizen Sees Status
```

This is the primary workflow that the MVP must demonstrate end-to-end.
