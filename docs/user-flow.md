# WildCare — User Flow

## 1. System Actors

```text
Citizen
Admin
Responder Body
AI Service
```

---

# 2. Citizen Flow

```text
Open WildCare
      ↓
Google Login
      ↓
Home
 ┌────┴───────────┐
 ↓                ↓
Previous       New Report
Reports            ↓
               Permissions
              ┌────┴────┐
              ↓         ↓
           Camera    Location
              └────┬────┘
                   ↓
               Take Photo
                   ↓
             Retake / Continue
                   ↓
             Upload to API
                   ↓
              AI Analysis
                   ↓
             Review Report
                   ↓
              Edit if needed
                   ↓
             Submit Report
                   ↓
          Responder Matching
                   ↓
          Recommended Bodies
                   ↓
              Call / Contact
                   ↓
            Response Tracking
                   ↓
                Resolved
                   ↓
                Feedback
```

---

# 3. Authentication Flow

```text
Mobile App
   ↓
Continue with Google
   ↓
Google Authentication
   ↓
Backend verifies authentication
   ↓
Find/Create User
   ↓
Application Session
   ↓
Home Screen
```

---

# 4. New Report Flow

## Step 1 — Start

Citizen taps:

```text
Create New Report
```

## Step 2 — Permission Check

The app checks:

- Camera permission.
- Location permission.

If camera is denied:

```text
Cannot capture incident evidence.
```

If location is denied:

```text
Location is required to create a report.
```

The app should guide the user to enable permissions.

## Step 3 — Capture

User opens camera and captures an animal photo.

Options:

```text
Retake
Continue
```

Recommended maximum:

```text
3 photos
```

## Step 4 — Location

Device provides:

```text
latitude
longitude
```

Backend resolves the coordinates to:

```text
state
district
city
postalCode
```

## Step 5 — Upload

```text
Mobile
  ↓
POST /api/v1/reports
  ↓
Express API
  ↓
Validate
  ↓
Store report
  ↓
Store image
  ↓
AI analysis
```

---

# 5. AI Analysis Flow

```text
Report
  ↓
Images
  ↓
AI Vision Service
  ↓
Structured Analysis
```

Example:

```json
{
  "animal": {
    "name": "deer",
    "confidence": 0.91
  },
  "condition": {
    "status": "injured",
    "confidence": 0.84
  },
  "severity": "high",
  "observations": ["Possible front-leg injury"]
}
```

The result is stored as an AI assessment.

---

# 6. Citizen Review Flow

```text
AI Result
   ↓
Report Review Screen
   ↓
Citizen checks information
   ↓
Citizen edits if necessary
   ↓
Citizen submits
```

Example:

```text
AI:
Animal = Deer
Condition = Injured

Citizen:
Animal = Deer
Condition = Dead
```

Store both:

```text
AI condition = INJURED
Citizen condition = DEAD
```

Never silently overwrite the original AI assessment.

---

# 7. Responder Matching Flow

```text
Final Report
      ↓
Incident Location
      ↓
Find verified bodies
      ↓
Check service compatibility
      ↓
Check geographic proximity
      ↓
Check availability
      ↓
Create responder matches
      ↓
Show citizen recommendations
```

Example:

```text
Forest Department
Government
4.2 km
Verified

Wildlife Rescue NGO
NGO
7.8 km
Verified

Private Rescue Organization
Private
10.1 km
Verified
```

---

# 8. Contact Flow

```text
Citizen
   ↓
Select responder
   ↓
View body details
   ↓
Tap Call
   ↓
Create Contact Attempt
   ↓
Open phone dialer
```

The system records:

```text
reportId
bodyId
citizenId
initiatedAt
```

A contact attempt does not prove that the responder answered.

---

# 9. Response Flow

Citizen can update the interaction:

```text
Waiting
   ↓
Responder Contacted
   ↓
Responder Accepted
   ↓
In Progress
   ↓
Resolved
```

Alternative:

```text
Unable to Reach Responder
```

---

# 10. Feedback Flow

After response:

```text
Report Resolved
      ↓
Feedback Prompt
      ↓
Overall Rating
      ↓
Response Time Rating
      ↓
Professionalism Rating
      ↓
Outcome
      ↓
Comment
      ↓
Submit
```

Feedback is linked to:

```text
Citizen
Report
Responder Body
```

---

# 11. Previous Reports Flow

```text
Home
  ↓
Previous Reports
  ↓
Report List
  ↓
Select Report
  ↓
Report Details
  ↓
Timeline
```

Timeline:

```text
Report Created
      ↓
AI Analysis Completed
      ↓
Report Submitted
      ↓
Responder Contacted
      ↓
Responder Accepted
      ↓
In Progress
      ↓
Resolved
      ↓
Feedback
```

---

# 12. Admin Dashboard Flow

```text
Admin Login
    ↓
Dashboard
    ├── Reports
    ├── Citizens
    ├── Bodies
    ├── Feedback
    ├── Locations
    └── Analytics
```

---

# 13. Admin — Report Flow

```text
Reports
  ↓
Filter/Search
  ↓
Select Report
  ↓
Report Details
```

Admin can view:

- Citizen.
- Images.
- AI assessment.
- Citizen-confirmed assessment.
- Location.
- Status.
- Responder matches.
- Contact attempts.
- Feedback.
- Timeline.

---

# 14. Admin — Citizen Flow

```text
Citizens
  ↓
Search / Filter
  ↓
Select Citizen
  ↓
Citizen Profile
  ↓
Report History
```

---

# 15. Admin — Body Flow

```text
Bodies
  ↓
Filter by:
  Type
  State
  District
  Status
  ↓
Body List
  ↓
Body Details
```

Admin can:

```text
Create
Edit
Verify
Reject
Suspend
```

---

# 16. Admin — Create Body

```text
Bodies
  ↓
Create Body
  ↓
Select Type
  ├── Government
  ├── NGO
  └── Private
  ↓
Enter Organization Details
  ↓
Enter Contact Details
  ↓
Enter Location
  ↓
Select Services
  ↓
Create
  ↓
PENDING
  ↓
Admin Review
  ↓
VERIFIED / REJECTED
```

---

# 17. Admin — Feedback Flow

```text
Feedback
  ↓
Filter
  ├── Body
  ├── Body Type
  ├── State
  ├── District
  ├── City
  └── Rating
  ↓
Feedback List
  ↓
Feedback Details
```

---

# 18. Location-Wise Admin Flow

```text
Locations
   ↓
Uttar Pradesh
   ↓
Bareilly
   ↓
Bareilly Statistics
```

Show:

```text
Reports
Citizens
Bodies
Government Bodies
NGOs
Private Bodies
Average Response Time
Feedback
Average Rating
```

---

# 19. Complete End-to-End Flow

```text
                     CITIZEN
                        │
                        ↓
                  Google Login
                        │
                        ↓
                      HOME
                        │
                  Create Report
                        │
                Camera + Location
                        │
                        ↓
                    Photo(s)
                        │
                        ↓
                    Backend
                        │
              ┌─────────┴─────────┐
              ↓                   ↓
          Image Store          Location
              │                   │
              └─────────┬─────────┘
                        ↓
                   AI Analysis
                        │
                        ↓
                 Citizen Review
                        │
                        ↓
                 Final Submission
                        │
                        ↓
               Responder Matching
                        │
             ┌──────────┼──────────┐
             ↓          ↓          ↓
          GOVT         NGO       PRIVATE
             └──────────┼──────────┘
                        ↓
                      CALL
                        ↓
                  RESPONSE
                        ↓
                    RESOLVED
                        ↓
                    FEEDBACK
                        │
                        ↓
                ADMIN DASHBOARD
                        │
       ┌────────────────┼────────────────┐
       ↓                ↓                ↓
    REPORTS          BODIES          FEEDBACK
       │                │                │
       └────────────────┼────────────────┘
                        ↓
                LOCATION ANALYTICS
```
