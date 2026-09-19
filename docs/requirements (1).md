# WildCare — Product Requirements Document

> Version: 1.0  
> Product: WildCare  
> Domain: Wildlife Incident Reporting & Response Coordination  
> Primary MVP Geography: India  
> Architecture: Serverless / AWS

---

## 1. Product Overview

**WildCare** is a wildlife incident reporting and response coordination platform that connects citizens who encounter wildlife incidents with appropriate local responders.

The platform converts a citizen's report into a structured incident containing:

- Animal information
- Incident type
- Photo/video evidence
- Exact GPS location
- Timestamp
- AI-assisted assessment
- Urgency
- Citizen description

WildCare identifies responders whose registered service areas cover the incident location and allows the citizen to select an appropriate responder.

After submission, WildCare dispatches the incident through the responder's configured communication channel.

Supported channels:

- WildCare Responder Dashboard
- Email
- WhatsApp
- Automated voice call
- External API/Webhook

The platform is designed to support organizations with different technical capabilities.

---

## 2. Problem Statement

When citizens encounter an injured, trapped, distressed, or dead/suspected-dead wild animal, they may:

- Not know whom to contact.
- Contact a responder outside the relevant geographic area.
- Provide incomplete or unstructured information.
- Fail to communicate the exact incident location.
- Use different communication channels from the responder.
- Have no way to know whether the report was successfully dispatched.

The core problem is:

> **How can a wildlife incident be captured once and reliably routed to an appropriate local responder using the communication technology that responder already uses?**

---

## 3. Product Vision

WildCare provides a common digital coordination layer between citizens and wildlife-response organizations.

```text
Citizen
   ↓
Capture Incident
   ↓
AI-Assisted Assessment
   ↓
GPS + Evidence + Incident Data
   ↓
Find Local Responders
   ↓
Citizen Selects Responder
   ↓
Dispatch Engine
   ↓
Responder's Preferred Channel
```

WildCare does not require every responder organization to adopt the WildCare dashboard.

Instead, the platform adapts to the responder's capabilities.

---

## 4. Goals

### 4.1 Simplify Incident Reporting

Allow citizens to create a structured wildlife incident report quickly.

### 4.2 Capture Accurate Location

Automatically capture GPS coordinates, location accuracy, and timestamp.

### 4.3 Provide AI-Assisted Assessment

Use Amazon Bedrock to analyze submitted evidence and provide:

- Possible animal type
- Possible incident type
- Visible signs of injury/distress
- Possible urgency
- Safety recommendations
- Incident summary

AI output is assistive and must not be treated as a definitive diagnosis.

### 4.4 Localized Responder Discovery

Identify verified responders whose configured service areas cover the incident location.

### 4.5 Citizen-Controlled Responder Selection

Show eligible responders and allow the citizen to select the organization they want to notify.

### 4.6 Multi-Channel Dispatch

Dispatch incidents through the responder's configured channel.

### 4.7 Flexible Responder Onboarding

Support organizations with different technical capabilities.

### 4.8 Optional Responder Dashboard

Allow organizations to opt into the WildCare Responder Dashboard.

### 4.9 Administrative Control

Allow administrators to manage:

- Responder verification
- Service areas
- Jurisdictions
- Dispatch methods
- Government responder provisioning
- Organization status

---

## 5. Non-Goals

WildCare will not:

- Replace government authorities.
- Replace Forest Departments or authorized wildlife organizations.
- Guarantee that a rescue will occur.
- Treat AI output as a medical or legal diagnosis.
- Confirm an animal's death solely from an image.
- Instruct citizens to approach, touch, move, feed, or treat wildlife.
- Require every responder to adopt the WildCare dashboard.
- Claim that a responder accepted an incident without an actual acknowledgement.

WildCare is a **coordination and dispatch platform**, not a replacement for wildlife authorities.

---

## 6. Target Users

### 6.1 Citizen

A person who encounters a wildlife incident.

Examples:

- Injured animal
- Trapped animal
- Animal inside a residential area
- Road accident involving wildlife
- Distressed wildlife
- Suspected wildlife death
- Human-wildlife conflict

### 6.2 Responder Organization

An organization capable of receiving or handling wildlife incidents.

Examples:

- Government wildlife/forest department
- Authorized NGO
- Wildlife rescue organization
- Private rescue organization
- Veterinary/wildlife-care organization

### 6.3 Responder

An individual working for a registered responder organization.

Capabilities:

- Receive incidents
- View incident information
- View authorized location
- Accept incidents
- Update status
- Add notes
- Resolve incidents

### 6.4 Administrator

Responsible for:

- Responder verification
- Organization management
- Geographic service areas
- Government responder provisioning
- Dispatch configuration
- User management
- Platform monitoring

---

## 7. Core Features

### 7.1 Citizen Incident Reporting

The citizen can:

1. Open WildCare.
2. Start a wildlife incident report.
3. Capture/upload an image.
4. Allow location access.
5. Capture GPS coordinates.
6. Add an optional description.
7. Submit evidence for AI-assisted assessment.
8. Review the generated assessment.
9. See eligible responders.
10. Select a responder.
11. Confirm and submit the incident.

### 7.2 Incident Information

An incident may contain:

```text
Incident ID
Reporter
Animal Type
Incident Type
Description
Latitude
Longitude
Location Accuracy
District
State
Timestamp
Photos
Videos
AI Assessment
Urgency
Selected Responder
Dispatch Method
Status
Created At
Updated At
```

### 7.3 GPS Capture

WildCare should capture:

- Latitude
- Longitude
- Location accuracy
- Timestamp

The original coordinates are preserved for authorized response purposes.

Sensitive wildlife locations must not be publicly exposed.

### 7.4 AI-Assisted Assessment

Amazon Bedrock analyzes incident evidence.

Example:

```json
{
  "animalType": "Possible Deer",
  "incidentType": "Possible Injury",
  "urgency": "HIGH",
  "confidence": 0.79,
  "visibleIndicators": [
    "Possible abnormal leg position"
  ],
  "safetyAdvice": [
    "Maintain a safe distance",
    "Do not touch or move the animal"
  ],
  "summary": "The image appears to show a deer with a possible leg injury."
}
```

The result must be presented as an **AI-assisted assessment**, not a confirmed diagnosis.

---

## 8. Responder Discovery

After location capture, WildCare queries registered responders.

Eligibility can depend on:

- Geographic service area
- District
- State
- Incident type
- Animal type
- Responder status
- Organization verification
- Availability
- Supported dispatch method

Example:

```text
Incident Location:
Aligarh, Uttar Pradesh

Eligible Responders:

1. Forest Department — Aligarh
   Coverage: Aligarh District
   Method: Voice Call

2. Wildlife Rescue NGO
   Coverage: Aligarh + Nearby Districts
   Method: WhatsApp

3. Wildlife Response Organization
   Coverage: Uttar Pradesh
   Method: Dashboard
```

---

## 9. Citizen Responder Selection

WildCare does not automatically send an incident to every nearby organization.

The citizen is shown eligible responders and selects the organization they want to notify.

The selected responder becomes the primary dispatch target.

---

## 10. Responder Onboarding

Responder organizations can apply through the WildCare website.

Example application data:

```text
Organization Name
Organization Type
Contact Person
Phone
Email
Service Area
Supported Incident Types
Supported Animal Types
Credentials
Preferred Dispatch Method
Dashboard Opt-In
```

---

## 11. Responder Verification

Responder organizations must be verified by a WildCare administrator before becoming active responders.

Possible states:

```text
PENDING
UNDER_REVIEW
VERIFIED
REJECTED
SUSPENDED
```

Only verified responders can receive incidents through WildCare.

---

## 12. Dashboard Opt-In

During onboarding:

```text
Do you want to use the WildCare Dashboard?
```

### Dashboard Enabled

If the organization selects `YES`:

- Organization account is created after approval.
- Responder users can log in.
- Incidents can be queued in the dashboard.
- Incident status can be updated.
- Responders can manage assigned cases.

### Dashboard Disabled

If the organization selects `NO`:

- No WildCare dashboard account is required.
- The organization operates through its configured external channel.

This is called a **Push-Only Responder**.

---

## 13. Dispatch Engine

The Dispatch Engine determines how an incident is delivered.

```text
Incident
   ↓
Selected Responder
   ↓
Read Dispatch Configuration
   ↓
Determine Channel
   ↓
Dispatch
```

Supported channels:

```text
DASHBOARD
EMAIL
WHATSAPP
VOICE_CALL
WEBHOOK
```

---

## 14. Dashboard Dispatch

For dashboard-enabled organizations:

```text
Incident Created
       ↓
Create Dashboard Assignment
       ↓
Queue Incident
       ↓
Send Email/SMS Alert
       ↓
Responder Opens Dashboard
```

The dashboard contains:

- Incident details
- Photos
- AI assessment
- Location
- Urgency
- Reporter information where appropriate
- Status
- Notes
- Assignment information

---

## 15. WhatsApp Dispatch

For organizations configured for WhatsApp, WildCare generates a standardized incident report.

Example:

```text
WILDCARE INCIDENT

Incident: WC-000123

Animal:
Possible Deer

Incident:
Possible Injury

Urgency:
HIGH

Location:
Google Maps Location

AI Assessment:
Possible leg injury.

Description:
Animal found near roadside.

Evidence:
Photo attached / secure evidence link.
```

The exact implementation depends on an approved WhatsApp Business/API provider.

---

## 16. Email Dispatch

For email-enabled responders, WildCare sends a structured incident email containing:

- Incident ID
- Animal
- Incident type
- Urgency
- Location
- Description
- AI assessment
- Evidence
- Reporter contact where appropriate
- Timestamp

---

## 17. Automated Voice Call

Some field responders may primarily use a standard mobile phone.

WildCare can support automated voice dispatch:

```text
Incident Created
       ↓
Responder = Mobile Phone
       ↓
Voice Dispatch
       ↓
Text-to-Speech
       ↓
Responder receives phone call
```

The voice message may communicate:

```text
This is a WildCare wildlife incident alert.

Incident number WC-000123.

A possible injured deer has been reported.

The reported location is...

The urgency is high.

Please check the incident details through the provided communication channel.
```

The voice system must not falsely claim that the responder accepted or attended the incident.

---

## 18. API / Webhook Dispatch

Organizations with their own software can configure an API/Webhook integration.

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
  },
  "timestamp": "2026-09-19T10:30:00Z"
}
```

Webhook delivery should support:

- Authentication
- Retry
- Delivery status
- Timeout handling
- Failure logging

---

## 19. Dispatch Configuration

Each responder profile contains a dispatch configuration.

Example:

```text
Responder:
Aligarh Wildlife Response Team

Verified:
YES

Coverage:
Aligarh District

Dashboard:
NO

Dispatch Method:
VOICE_CALL

Phone:
XXXXXXXXXX
```

Another:

```text
Responder:
Wildlife NGO

Verified:
YES

Coverage:
Aligarh + Nearby Districts

Dashboard:
NO

Dispatch Method:
WHATSAPP
```

Another:

```text
Responder:
Wildlife Organization

Verified:
YES

Coverage:
Uttar Pradesh

Dashboard:
YES

Dispatch Method:
DASHBOARD
```

---

## 20. Admin Geographic Configuration

Administrators can define geographic service areas.

Example:

```text
Zone:
Aligarh District

Responders:
- Forest Department Aligarh
- Wildlife NGO A
- Rescue Organization B
```

A responder can cover:

- District
- Multiple districts
- State
- Custom geographic polygon

Future versions may support GIS-based polygon matching.

---

## 21. Government Responder Provisioning

Government responders may not directly register themselves.

Administrators can manually create their responder profiles.

Admin can enter:

```text
Name
Designation
Department
Jurisdiction
Phone
Email
Supported Incident Types
Dispatch Method
Coverage Area
Verification Status
```

Example:

```text
Name:
Forest Officer

Department:
Forest Department

Jurisdiction:
Aligarh District

Dispatch:
VOICE_CALL

Status:
VERIFIED
```

---

## 22. Incident Lifecycle

Initial lifecycle:

```text
DRAFT
  ↓
AI_ANALYZED
  ↓
RESPONDER_SELECTED
  ↓
SUBMITTED
  ↓
DISPATCHING
  ↓
DISPATCHED
  ↓
ACKNOWLEDGED
  ↓
IN_PROGRESS
  ↓
RESOLVED
```

Additional states:

```text
FAILED_DISPATCH
REJECTED
DUPLICATE
CANCELLED
```

`DISPATCHED` means WildCare successfully delivered or attempted delivery through the configured channel.

It does **not** mean the responder accepted or acted on the case.

`ACKNOWLEDGED` should only be used when an actual acknowledgement signal exists.

---

## 23. Incident Status Transparency

WildCare distinguishes platform events from real-world events.

### Platform-confirmed

```text
Report Created
Dispatch Initiated
Dispatch Delivered
Dashboard Assignment Created
```

### Responder-confirmed

```text
Acknowledged
Accepted
In Progress
Resolved
```

WildCare must not automatically mark a case as resolved because a notification was delivered.

---

## 24. Duplicate Incident Detection

WildCare may detect possible duplicates using:

- GPS proximity
- Time window
- Animal type
- Incident type
- Image similarity

Example:

```text
Incident A
Location: 500m
Time: 5 minutes ago
Animal: Deer

Incident B
Location: 400m
Time: 7 minutes ago
Animal: Deer
```

The system can flag:

```text
Possible Duplicate
```

Final merging should require authorized human/admin action.

---

## 25. Location Privacy

Wildlife locations can be sensitive.

### Citizen

Can view their own incident location.

### Authorized Responder

Can view exact coordinates when required for response.

### Public

Should not have access to exact sensitive wildlife coordinates.

### Admin

Can access exact location according to authorization.

---

## 26. Citizen Safety

Before submitting an incident, WildCare should communicate basic safety guidance:

- Maintain a safe distance.
- Do not touch the animal.
- Do not attempt rescue.
- Do not feed the animal.
- Do not attempt medical treatment.
- Avoid provoking or surrounding wildlife.
- Contact emergency services if there is immediate danger to people.

AI may adapt safety guidance, but must not provide unsafe rescue instructions.

---

## 27. Notifications

### Citizen

- Report created
- Dispatch completed
- Responder acknowledgement
- Status updates

### Responder

- New incident
- High-priority incident
- Assignment
- Reminder

### Admin

- New responder application
- Failed dispatch
- Invalid responder configuration
- System errors

Possible channels:

```text
Email
SMS
WhatsApp
Voice
Dashboard
```

---

## 28. Authentication & Authorization

### Citizen

Can:

- Create account
- Create incidents
- View own incidents
- Upload evidence
- View own incident status

### Responder

Can:

- Access assigned/eligible incidents
- View authorized incident information
- Update incident status
- Add notes
- Manage assigned cases

### Admin

Can:

- Manage users
- Verify organizations
- Configure responders
- Configure geographic coverage
- Configure dispatch channels
- Provision government responders
- View platform incidents
- View audit information

---

## 29. Data Storage Requirements

### Amazon S3

Used for:

- Incident images
- Videos
- Evidence
- Generated reports

Evidence should not be publicly exposed.

### Amazon DynamoDB

Used for:

- Users
- Organizations
- Responders
- Incidents
- Assignments
- Dispatch records
- Status history
- Geographic configuration
- Audit information

### Amazon Cognito

Used for:

- Authentication
- User identity
- Responder authentication
- Admin authentication
- Token management

### Amazon Bedrock

Used for:

- Image analysis
- Incident classification
- AI-assisted assessment
- Structured incident summary
- Safety recommendations

---

## 30. Core AWS Requirements

The MVP architecture should use:

```text
React
   ↓
Amazon Cognito
   ↓
API Gateway
   ↓
AWS Lambda
   ├── DynamoDB
   ├── S3
   └── Amazon Bedrock
          ↓
    AI Assessment
          ↓
Responder Routing
          ↓
Dispatch Engine
```

Potential communication integrations:

```text
Email Provider
SMS Provider
WhatsApp Business API
Voice Provider
External Webhooks
```

The exact external provider should remain configurable.

---

## 31. Security Requirements

The platform must:

- Authenticate users.
- Authorize actions by role.
- Keep S3 evidence private.
- Use pre-signed URLs for controlled evidence access.
- Protect responder contact information.
- Protect exact wildlife coordinates.
- Validate uploaded files.
- Validate API input.
- Log administrative actions.
- Protect webhook credentials.
- Avoid exposing sensitive environment variables.
- Encrypt data in transit.
- Use AWS IAM least privilege.

---

## 32. Reliability Requirements

The dispatch engine should handle communication failures.

```text
Dispatch
   ↓
Success
   OR
Failure
   ↓
Retry
   ↓
Failure
   ↓
Admin Alert
```

Each dispatch attempt should maintain:

```text
Dispatch ID
Incident ID
Responder ID
Channel
Attempt
Timestamp
Status
Provider Response
Error
```

---

## 33. Auditability

Important actions should be logged:

```text
Responder Created
Responder Verified
Responder Suspended
Incident Created
Incident Dispatched
Dispatch Failed
Incident Assigned
Incident Status Changed
Admin Configuration Changed
```

Audit records should contain:

```text
Actor
Action
Resource
Timestamp
Previous Value
New Value
```

---

## 34. MVP Scope

### Citizen

- Authentication
- Incident creation
- Photo upload
- GPS capture
- Description
- AI assessment
- Responder discovery
- Responder selection
- Incident submission
- Incident tracking

### Admin

- Admin authentication
- Responder creation
- Organization management
- Responder verification
- Geographic coverage
- Dispatch configuration
- Government responder provisioning

### Responder

- Optional dashboard
- Incident list
- Incident details
- Status updates

### Backend

- API Gateway
- Lambda
- DynamoDB
- S3
- Cognito
- Bedrock

### Dispatch

At least one real dispatch channel should be implemented for the MVP.

The architecture must support:

```text
Dashboard
Email
WhatsApp
Voice
Webhook
```

even if every channel is not fully implemented during the hackathon.

---

## 35. Hackathon Demo Flow

The primary demonstration should show one complete incident:

```text
Citizen
  ↓
Take Photo
  ↓
GPS Captured
  ↓
AI Analysis
  ↓
Possible Injured Deer
  ↓
Urgency: HIGH
  ↓
Nearby Responders
  ↓
Citizen Selects Responder
  ↓
Submit
  ↓
Dispatch Engine
  ↓
Selected Channel
  ↓
Responder Receives Incident
  ↓
Responder Updates Status
  ↓
Citizen Sees Status
```

A second demonstration can show:

```text
Admin
  ↓
Create Government Responder
  ↓
Set Aligarh Coverage
  ↓
Set Voice Call Dispatch
```

This demonstrates why the platform supports multiple responder capabilities.

---

## 36. Example End-to-End Scenario

A citizen sees a potentially injured deer near a road in Aligarh.

### Step 1 — Capture

Citizen opens WildCare and captures a photo.

### Step 2 — Location

WildCare captures:

```text
Latitude
Longitude
Accuracy
Timestamp
```

### Step 3 — AI Assessment

Amazon Bedrock analyzes the photo.

Example:

```text
Animal:
Possible Deer

Condition:
Possible Injury

Urgency:
HIGH
```

### Step 4 — Responder Discovery

WildCare searches responder coverage and finds:

```text
Forest Department — Aligarh
Wildlife NGO — Aligarh
Regional Wildlife Rescue Organization
```

### Step 5 — Selection

Citizen selects:

```text
Forest Department — Aligarh
```

### Step 6 — Dispatch Configuration

Responder configuration:

```text
Dashboard:
NO

Dispatch:
VOICE_CALL
```

### Step 7 — Incident Creation

WildCare creates:

```text
WC-000123
```

### Step 8 — Dispatch

The Dispatch Engine initiates the configured voice notification.

### Step 9 — Platform Status

The system records:

```text
Dispatch Status:
DELIVERED
```

### Step 10 — Citizen View

The citizen sees:

```text
Incident Submitted

Incident ID:
WC-000123

Responder:
Forest Department — Aligarh

Notification:
Dispatched

Current Status:
Awaiting Responder Acknowledgement
```

WildCare does not claim that the Forest Department has accepted or rescued the animal unless an actual acknowledgement is received.

---

## 37. Future Scope

Future versions may add:

- Advanced GIS
- Polygon-based geographic routing
- Real-time responder locations
- Mobile responder application
- WhatsApp two-way communication
- Advanced voice agents
- Government API integrations
- Wildlife veterinary workflow
- Rescue-center management
- Duplicate incident clustering
- Analytics
- Wildlife incident heatmaps
- Multi-state expansion
- Multi-language citizen interface
- Offline incident capture
- IoT/camera integrations

---

## 38. Success Criteria

The MVP is successful if a citizen can:

1. Capture a wildlife incident.
2. Capture its location.
3. Upload evidence.
4. Receive an AI-assisted assessment.
5. See eligible local responders.
6. Select a responder.
7. Submit the incident.
8. Dispatch the incident through the configured channel.
9. Track platform-confirmed status.

An administrator must be able to:

1. Verify a responder.
2. Configure its geographic coverage.
3. Configure its dispatch method.
4. Manually provision government responders.
5. Manage responder organizations.

A responder using the WildCare dashboard must be able to:

1. Receive assigned incidents.
2. View incident details.
3. View authorized location/evidence.
4. Update the incident status.
5. Add response notes.
