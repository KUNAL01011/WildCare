# WildCare — Requirements Specification

## 1. Overview

WildCare is a wildlife incident reporting and response coordination platform.

It has two primary applications:

1. **Citizen Mobile Application** — citizens report wildlife incidents using a photo and mandatory location, review an AI-assisted assessment, submit the final report, contact relevant responders, track response progress, and provide feedback.
2. **Admin Dashboard** — administrators manage citizens, reports, responder bodies, verification, feedback, locations, and platform analytics.

The MVP is intentionally small and should use a modular monolith rather than microservices.

---

## 2. Goals

### 2.1 Primary Goals

- Allow a citizen to report a wildlife incident quickly.
- Require a photo and location for a new incident.
- Analyze the submitted image using AI.
- Generate a structured incident assessment.
- Allow the citizen to review and edit AI-generated information.
- Recommend relevant responder bodies based on incident and location.
- Allow the citizen to initiate contact with a responder.
- Track the contact/response lifecycle.
- Collect citizen feedback.
- Give administrators a complete operational view of the platform.
- Support location-wise management and analytics.

### 2.2 Non-Goals for MVP

The first version will not attempt to:

- Automatically dispatch government teams.
- Automatically verify that a phone call was answered.
- Provide live responder GPS tracking.
- Replace official emergency/wildlife authorities.
- Make AI the final authority on animal species or condition.
- Build a microservice architecture.
- Provide complex government integrations.

---

## 3. Actors

### 3.1 Citizen

A registered application user who can:

- Sign in with Google.
- View previous reports.
- Create a new report.
- Grant camera and location permissions.
- Capture and retake photos.
- Submit photos and location.
- Review AI analysis.
- Edit the proposed report.
- Submit the final report.
- View recommended responders.
- Initiate a phone call.
- View response progress.
- Submit feedback.

### 3.2 Admin

A platform administrator who can:

- View platform statistics.
- View citizens.
- View reports.
- View responder bodies.
- Create responder bodies.
- Verify, reject, or suspend bodies.
- View all feedback.
- Filter data by location.
- View location-wise statistics.
- View body performance statistics.
- Manage platform data.

### 3.3 Responder Body

A registered organization that may respond to wildlife incidents.

Types:

- Government
- NGO
- Private

A body contains organizational, contact, service, geographic, verification, and operational information.

---

## 4. Functional Requirements

## 4.1 Authentication

- Citizen can authenticate using Google.
- Backend creates or updates the citizen profile after successful authentication.
- Authenticated requests must contain a valid application session/token.
- Admin authentication must be separate from normal citizen access.
- A citizen must only be able to access their own reports.

## 4.2 Citizen Home

The mobile home screen must provide:

- Create New Report action.
- Previous Reports list.
- Current/active report information where applicable.
- Basic user profile information.

## 4.3 Create Report

A new report requires:

- Camera permission.
- Location permission.
- At least one incident photo.
- Current GPS coordinates.

The user cannot submit a new report without the required photo and location.

Recommended MVP behavior:

- Allow up to 3 photos.
- Allow retaking/removing photos before submission.
- Capture GPS coordinates from the device.
- Resolve coordinates to a human-readable location on the backend.

## 4.4 AI Analysis

After upload:

- Backend stores the report as an analysis-in-progress record.
- Images are passed to an AI vision service.
- AI returns structured observations.
- AI should provide confidence where applicable.
- AI must not be represented as certain when the visual evidence is uncertain.

Example fields:

- Likely animal/species.
- Species confidence.
- Likely condition.
- Condition confidence.
- Visible observations.
- Severity suggestion.
- Additional notes.

The system must preserve the AI assessment separately from the citizen-confirmed assessment.

## 4.5 Citizen Review

The citizen must see:

- Animal/species.
- Condition.
- Severity.
- AI observations.
- Location.
- Photos.

The citizen can edit appropriate fields before final submission.

The system must preserve:

- Original AI result.
- Citizen-confirmed/final result.

## 4.6 Final Report

A submitted report contains:

- Report ID.
- Citizen.
- Incident timestamp.
- Photo evidence.
- Latitude.
- Longitude.
- State.
- District.
- City/town.
- Postal code where available.
- AI assessment.
- Citizen-confirmed assessment.
- Final status.

The location must be stored as a historical snapshot so the original incident location remains intact.

## 4.7 Responder Matching

The system should identify responder bodies based on:

1. Geographic service area/proximity.
2. Animal/service compatibility.
3. Verification status.
4. Availability where known.

The UI should explain relevant information such as:

- Body type.
- Distance.
- Services.
- Verification.
- Historical response time.
- Citizen feedback/rating where enough data exists.

The system should not present a body as universally "best"; recommendations are contextual to the incident.

## 4.8 Contact

A citizen can initiate a phone call to a responder.

The MVP records:

- Report.
- Citizen.
- Responder body.
- Initiated timestamp.

A button click must not be treated as proof that a call was answered.

## 4.9 Response Tracking

A citizen can update the response interaction, for example:

- Waiting.
- Responder contacted.
- Unable to reach responder.
- Responder accepted.
- In progress.
- Resolved.

## 4.10 Feedback

After a response, the citizen can provide:

- Overall rating.
- Response-time rating.
- Professionalism rating.
- Outcome.
- Comment.

Feedback belongs to:

- Citizen.
- Report.
- Responder body.

## 4.11 Previous Reports

Citizens can:

- List their reports.
- Filter/view active and resolved reports.
- Open report details.
- View incident timeline.
- View responder/contact information associated with the report.
- View their submitted feedback.

---

# 5. Admin Requirements

## 5.1 Dashboard

The dashboard should show:

- Total citizens.
- Total reports.
- Active reports.
- Resolved reports.
- Total responder bodies.
- Government body count.
- NGO count.
- Private body count.
- Total feedback.
- Average response time.
- Recent reports.

Statistics should always be associated with an appropriate time period and population.

## 5.2 Citizen Management

Admin can:

- List citizens.
- Search citizens.
- Filter citizens by location.
- Open citizen profile.
- View citizen's report history.

Admin should not expose unnecessary private information.

## 5.3 Report Management

Admin can:

- List reports.
- Search by report ID.
- Filter by status.
- Filter by animal.
- Filter by incident condition.
- Filter by state/district/city.
- View complete report details.
- View images.
- View AI analysis.
- View citizen-confirmed data.
- View response timeline.

## 5.4 Body Management

Admin can:

- List bodies.
- Create a body.
- View body details.
- Edit body details.
- Verify a body.
- Reject a body.
- Suspend a body.
- Filter by type.
- Filter by location.

Body types:

- GOVERNMENT
- NGO
- PRIVATE

## 5.5 Body Details

A body may contain:

- Name.
- Type.
- Description.
- Phone.
- Email.
- Website.
- Address.
- State.
- District.
- City.
- Postal code.
- Latitude.
- Longitude.
- Services.
- Supported animal categories.
- Availability.
- Verification status.
- Historical response metrics.

## 5.6 Feedback Management

Admin can:

- View all feedback.
- Filter by body.
- Filter by body type.
- Filter by state.
- Filter by district.
- Filter by city.
- Filter by rating.
- Open feedback details.
- View aggregate feedback statistics.

## 5.7 Location Management

The system must support hierarchical location data:

```text
Country
  └── State
       └── District
            └── City/Town
                 └── Area
```

Incident reports also preserve their original location snapshot.

## 5.8 Analytics

Admin analytics may include:

- Reports by state.
- Reports by district.
- Reports by city.
- Reports by animal.
- Reports by condition.
- Reports by status.
- Reports by responder type.
- Average response time.
- Feedback ratings.
- Resolution counts.

---

# 6. Report Status Model

Recommended states:

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

Transitions should be controlled by backend business rules.

---

# 7. Body Verification Model

```text
PENDING
UNDER_REVIEW
VERIFIED
REJECTED
SUSPENDED
```

Only appropriate verified bodies should be presented as verified responders to citizens.

---

# 8. Non-Functional Requirements

## Performance

- Mobile API requests should normally respond quickly for non-AI operations.
- Image processing may be asynchronous.
- Large image uploads should be compressed/resized where practical.
- AI processing should not block the entire API process.

## Security

- Validate all authenticated requests.
- Enforce authorization on every report/body/admin endpoint.
- Never trust client-provided user IDs.
- Validate uploaded file type and size.
- Restrict administrative endpoints.
- Do not expose private citizen data unnecessarily.
- Store secrets only in environment/configuration systems.

## Reliability

- Failed AI processing must not destroy the report.
- Failed notification/contact tracking must not destroy the report.
- Report status changes should be auditable.

## Observability

The backend should provide:

- Structured logs.
- Error tracking.
- Health endpoint.
- Request correlation IDs where practical.

---

# 9. Recommended MVP Stack

### Mobile

- React Native
- Expo
- TypeScript

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma

### Database

- PostgreSQL

### Image Storage

- S3-compatible object storage or another dedicated object-storage provider.

### AI

- Vision-capable AI provider behind an internal `AIService` abstraction.

### Admin

- React
- TypeScript
- React Router
- TanStack Query
- Zustand where client-side global state is actually required.

---

# 10. Architecture Principle

Start as a modular monolith:

```text
Express API
├── Auth
├── Users
├── Reports
├── AI
├── Responders
├── Matching
├── Contact
├── Feedback
├── Locations
└── Admin
```

Do not introduce microservices until actual scale or operational requirements justify them.
