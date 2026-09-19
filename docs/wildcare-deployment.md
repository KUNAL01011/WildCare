# WildCare — Deployment

## 1. Purpose

This document defines the deployment strategy for WildCare across local development, staging, and production.

The deployment should prioritize:

- Fast hackathon delivery
- Simple AWS operations
- Secure secrets
- Repeatable deployments
- Clear environment separation
- Independent frontend/dashboard/backend deployment
- A path toward production without redesigning the application

---

# 2. Deployment Architecture

```text
                         Internet
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       Citizen Frontend             Responder/Admin
       apps/frontend                apps/dashboard
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                    Amazon Cognito
                            │
                            ▼
                     API Gateway
                      /api/v1/*
                            │
                            ▼
                         Lambda
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
      DynamoDB             S3             Bedrock
          │                                   │
          └─────────────────┬─────────────────┘
                            ▼
                           SQS
                            │
                            ▼
                    Dispatch Lambda
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
             SES            SMS        External APIs
```

---

# 3. Environments

Use three environments conceptually:

```text
development
staging
production
```

## Development

Used by developers locally.

```text
localhost
AWS development resources
test data
sandbox providers
```

## Staging

Used for:

```text
integration testing
demo testing
pre-production validation
```

## Production

Used for:

```text
real users
real responders
real incidents
real notification channels
```

Do not mix production credentials with development.

---

# 4. Recommended AWS Account Strategy

For the hackathon, a single AWS account with strict environment separation can be sufficient.

Use resource naming:

```text
wildcare-dev-*
wildcare-staging-*
wildcare-prod-*
```

For a production organization, separate AWS accounts are preferable:

```text
AWS Organization
├── Development Account
├── Staging Account
└── Production Account
```

The multi-account setup can be introduced after the MVP.

---

# 5. Region

Choose one AWS region close to the primary user population and keep the MVP resources in the same region where practical.

Example configuration:

```text
AWS_REGION=ap-south-1
```

Do not hard-code the region throughout application code.

Use environment configuration:

```text
AWS_REGION
```

The selected region should be verified against the availability of every AWS service required by the final deployment.

---

# 6. AWS Resources

The initial deployment requires:

```text
Amazon Cognito
Amazon API Gateway
AWS Lambda
Amazon DynamoDB
Amazon S3
Amazon Bedrock
Amazon SQS
Amazon SES
Amazon CloudWatch
AWS Secrets Manager
IAM
```

Optional:

```text
Amazon SNS
Amazon EventBridge
Amazon Route 53
Amazon CloudFront
AWS KMS
```

---

# 7. Resource Naming

Use predictable names.

Example:

```text
WildCareTable-dev
WildCareTable-staging
WildCareTable-prod

wildcare-evidence-dev
wildcare-evidence-staging
wildcare-evidence-prod

wildcare-dispatch-dev
wildcare-dispatch-staging
wildcare-dispatch-prod
```

Lambda examples:

```text
wildcare-api-dev
wildcare-dispatch-worker-dev

wildcare-api-prod
wildcare-dispatch-worker-prod
```

Avoid random names that make operational debugging difficult.

---

# 8. Cognito Deployment

Create:

```text
Cognito User Pool
App Client
```

Application roles:

```text
CITIZEN
RESPONDER
ADMIN
```

Important:

The application role should be controlled by trusted backend/admin configuration rather than blindly trusting arbitrary client input.

Environment values:

```text
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
AWS_REGION=
```

---

# 9. API Gateway Deployment

Expose:

```text
https://api.wildcare.in/api/v1
```

Routes:

```text
/api/v1/users/*
/api/v1/incidents/*
/api/v1/evidence/*
/api/v1/responders/*
/api/v1/organizations/*
/api/v1/service-areas/*
/api/v1/assignments/*
/api/v1/dispatch/*
/api/v1/notifications/*
/api/v1/admin/*
```

Configure:

```text
HTTPS
CORS
Cognito authorization
throttling
access logging
```

The API version should remain part of the public URL.

---

# 10. Lambda Deployment

Initial Lambda functions:

```text
wildcare-api
wildcare-dispatch-worker
```

Optional later:

```text
wildcare-ai-worker
wildcare-notification-worker
wildcare-cleanup-worker
```

For the hackathon, keep the number of Lambda functions small unless independent scaling or permissions require separation.

---

# 11. Backend Environment Variables

Example:

```env
NODE_ENV=production

AWS_REGION=ap-south-1

DYNAMODB_TABLE_NAME=WildCareTable-prod

S3_BUCKET_NAME=wildcare-evidence-prod

COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=

BEDROCK_MODEL_ID=

SQS_DISPATCH_QUEUE_URL=

LOG_LEVEL=info
```

External provider settings:

```env
SMS_PROVIDER=
WHATSAPP_PROVIDER=
VOICE_PROVIDER=
```

Provider secrets should not be stored directly in source-controlled environment files.

---

# 12. Secrets Management

Use AWS Secrets Manager for sensitive values.

Examples:

```text
WhatsApp API credentials
SMS provider credentials
Voice provider credentials
Webhook signing secrets
External API keys
```

Do not commit:

```text
.env
.env.production
API keys
AWS access keys
provider passwords
```

to Git.

---

# 13. IAM

Use least privilege.

## API Lambda

Needs only the permissions required for:

```text
DynamoDB
S3
Bedrock
SQS
CloudWatch
```

## Dispatch Worker

Needs only:

```text
SQS consume
DynamoDB update
SES/SNS or configured provider access
CloudWatch
Secrets Manager read where required
```

## Admin operations

Application-level authorization should enforce:

```text
ADMIN
```

IAM alone should not be treated as the application's user authorization model.

---

# 14. DynamoDB Deployment

Create:

```text
WildCareTable-<environment>
```

The table should contain the primary key structure defined in:

```text
docs/domain-and-schema.md
```

Recommended:

```text
PK
SK
GSI1PK
GSI1SK
GSI2PK
GSI2SK
```

Enable appropriate point-in-time recovery and backup settings for production.

---

# 15. S3 Deployment

Create a private bucket per environment:

```text
wildcare-evidence-dev
wildcare-evidence-staging
wildcare-evidence-prod
```

Recommended controls:

```text
Block public access
Server-side encryption
Lifecycle rules
Versioning where appropriate
Access logging/monitoring where required
```

Never make incident evidence publicly readable.

---

# 16. S3 CORS

If browsers upload directly to S3 using pre-signed URLs, configure CORS for the frontend origins.

Development:

```text
http://localhost:5173
```

Production:

```text
https://wildcare.in
```

Dashboard:

```text
https://dashboard.wildcare.in
```

Only allow the HTTP methods and headers actually required.

---

# 17. SQS Deployment

Create:

```text
WildCareDispatchQueue-<environment>
WildCareDispatchDLQ-<environment>
```

Flow:

```text
API Lambda
    ↓
Dispatch Queue
    ↓
Dispatch Worker
    ↓
Provider
```

Failure:

```text
Dispatch Worker
    ↓
retry
    ↓
retry
    ↓
DLQ
```

Configure visibility timeout, retry behavior, and dead-letter handling according to worker execution time.

---

# 18. Bedrock Deployment

The backend invokes the configured Bedrock model.

Environment:

```text
BEDROCK_MODEL_ID=
```

Do not expose the model ID as a security credential.

The application should validate the model response before storing it as `AIAnalysis`.

The AI output should remain advisory.

---

# 19. SES / Email Deployment

If email is used:

```text
Lambda
  ↓
Amazon SES
  ↓
Responder email
```

Before production:

```text
Verify sending identity
Configure domain/email
Handle sandbox restrictions if applicable
Configure bounce/complaint monitoring
```

The sender should be a controlled WildCare address.

---

# 20. SMS Deployment

If using Amazon SNS:

```text
Dispatch Worker
      ↓
SNS
      ↓
Responder
```

If using another provider:

```text
Dispatch Worker
      ↓
SmsDispatchProvider
      ↓
Provider
```

The provider should remain behind the dispatch abstraction.

---

# 21. WhatsApp Deployment

WhatsApp should be implemented through the selected supported business/API provider.

Architecture:

```text
Dispatch Worker
      ↓
WhatsAppDispatchProvider
      ↓
Provider API
      ↓
Responder
```

Provider credentials belong in Secrets Manager.

Do not put credentials in frontend code.

---

# 22. Voice Deployment

Architecture:

```text
Dispatch Worker
      ↓
VoiceDispatchProvider
      ↓
Voice provider
      ↓
Responder phone
```

The voice message should be generated from structured incident data.

Keep the message concise and operational.

---

# 23. Frontend Deployment

The citizen frontend can be deployed independently.

Recommended options:

```text
CloudFront + S3
```

or a managed frontend platform such as:

```text
Vercel
Netlify
```

The frontend needs:

```text
VITE_API_BASE_URL
VITE_COGNITO_*
```

Only public client configuration belongs in frontend environment variables.

Never put secrets in frontend environment variables.

---

# 24. Dashboard Deployment

The responder/admin dashboard is deployed independently from the citizen frontend.

Example:

```text
https://dashboard.wildcare.in
```

Configuration:

```text
VITE_API_BASE_URL=https://api.wildcare.in/api/v1
```

Authentication uses the same Cognito user pool if desired.

Role-based routing determines:

```text
RESPONDER
ADMIN
```

---

# 25. Domain Structure

Recommended production domains:

```text
wildcare.in
www.wildcare.in

api.wildcare.in

dashboard.wildcare.in
```

Optional:

```text
admin.wildcare.in
```

The dashboard can share the same application as the admin interface if role-based routing is used.

---

# 26. DNS

If Route 53 is used:

```text
wildcare.in
    ↓
frontend

api.wildcare.in
    ↓
API Gateway

dashboard.wildcare.in
    ↓
dashboard hosting
```

DNS should point to the appropriate production endpoints.

---

# 27. HTTPS

All production traffic must use HTTPS.

Required:

```text
https://wildcare.in
https://api.wildcare.in
https://dashboard.wildcare.in
```

Never send:

```text
JWTs
private evidence
citizen information
```

over plain HTTP in production.

---

# 28. CI/CD

Recommended Git workflow:

```text
main
  ↓
production

develop
  ↓
staging
```

For a small hackathon team, a simpler workflow is acceptable:

```text
main
  ↓
production/demo
```

GitHub Actions can automate:

```text
Install
Lint
Typecheck
Test
Build
Deploy
```

---

# 29. Backend CI/CD

Example pipeline:

```text
Git push
   ↓
GitHub Actions
   ↓
npm ci
   ↓
lint
   ↓
typecheck
   ↓
tests
   ↓
build
   ↓
package Lambda
   ↓
deploy
```

Deployment credentials should use secure GitHub/AWS authentication rather than hard-coded AWS access keys.

---

# 30. Frontend CI/CD

```text
Git push
   ↓
Install
   ↓
Lint
   ↓
Typecheck
   ↓
Build
   ↓
Deploy frontend
```

Environment configuration should be provided by the hosting platform.

---

# 31. Infrastructure as Code

For a repeatable deployment, use infrastructure as code.

Possible options:

```text
AWS CDK
CloudFormation
Terraform
Serverless Framework
```

For this project, choose one rather than mixing several.

A practical AWS-native choice is:

```text
AWS CDK
```

or CloudFormation if the team is already comfortable with it.

---

# 32. Suggested Infrastructure Layout

If using CDK:

```text
infra/
└── cdk/
    ├── bin/
    │   └── wildcare.ts
    ├── lib/
    │   ├── auth-stack.ts
    │   ├── data-stack.ts
    │   ├── api-stack.ts
    │   ├── dispatch-stack.ts
    │   └── frontend-stack.ts
    ├── cdk.json
    └── package.json
```

Do not create all of these stacks if the project is too small.

The goal is repeatability, not infrastructure complexity.

---

# 33. Deployment Order

Deploy infrastructure in dependency order:

```text
1. Cognito
        ↓
2. DynamoDB
        ↓
3. S3
        ↓
4. SQS + DLQ
        ↓
5. IAM
        ↓
6. Lambda
        ↓
7. API Gateway
        ↓
8. Bedrock permissions/config
        ↓
9. Frontend
        ↓
10. Dashboard
        ↓
11. DNS
```

Provider integrations can be enabled after the core system works.

---

# 34. Local Development

Local development should use:

```text
apps/frontend
apps/dashboard
apps/backend
```

Example:

```text
Frontend:
http://localhost:5173

Dashboard:
http://localhost:5174

Backend:
http://localhost:3000

API:
http://localhost:3000/api/v1
```

AWS development resources can be used directly for the MVP.

If local AWS emulation is introduced later, it should not complicate the initial development workflow.

---

# 35. Local Environment

Example:

```env
NODE_ENV=development
AWS_REGION=ap-south-1
DYNAMODB_TABLE_NAME=WildCareTable-dev
S3_BUCKET_NAME=wildcare-evidence-dev
SQS_DISPATCH_QUEUE_URL=
BEDROCK_MODEL_ID=
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
```

Use a separate Cognito user pool and data resources for development.

---

# 36. Production Deployment Checklist

## Authentication

- [ ] Cognito production user pool configured
- [ ] Application client configured
- [ ] Admin role protected
- [ ] Responder accounts verified

## API

- [ ] API Gateway deployed
- [ ] `/api/v1` routes working
- [ ] Cognito authorization enabled
- [ ] CORS configured
- [ ] throttling configured
- [ ] custom domain configured

## Database

- [ ] DynamoDB production table created
- [ ] GSIs configured
- [ ] backups/PITR configured
- [ ] least-privilege IAM configured

## Storage

- [ ] S3 production bucket created
- [ ] public access blocked
- [ ] encryption enabled
- [ ] CORS configured
- [ ] lifecycle rules configured

## AI

- [ ] Bedrock model access configured
- [ ] AI response validation implemented
- [ ] AI failure handling tested

## Dispatch

- [ ] SQS queue created
- [ ] DLQ created
- [ ] worker deployed
- [ ] retry behavior tested
- [ ] at least one real channel configured

## Monitoring

- [ ] CloudWatch logs
- [ ] Lambda errors monitored
- [ ] queue depth monitored
- [ ] DLQ monitored
- [ ] dispatch failures visible

## Domain

- [ ] `wildcare.in`
- [ ] `api.wildcare.in`
- [ ] `dashboard.wildcare.in`
- [ ] HTTPS enabled

---

# 37. Hackathon Deployment Plan

Do not spend the majority of the hackathon building CI/CD infrastructure.

Recommended order:

```text
Phase 1
AWS resources manually/quickly provisioned
        ↓
Phase 2
Backend deployed
        ↓
Phase 3
Frontend deployed
        ↓
Phase 4
Dashboard deployed
        ↓
Phase 5
Real notification channel
        ↓
Phase 6
End-to-end demo
        ↓
Phase 7
Only then improve automation
```

The goal is a working vertical slice first.

---

# 38. Minimum Working Production-Like Setup

For the hackathon demo:

```text
Cognito
   ↓
API Gateway
   ↓
Lambda
   ├── DynamoDB
   ├── S3
   └── Bedrock
        ↓
SQS
   ↓
Dispatch Lambda
   ↓
Email
```

Frontend:

```text
wildcare.in
```

Dashboard:

```text
dashboard.wildcare.in
```

API:

```text
api.wildcare.in/api/v1
```

This is enough to demonstrate the core WildCare architecture.

---

# 39. Monitoring and Alerts

Important alerts:

```text
Lambda error spike
API 5xx spike
SQS queue backlog
DLQ message created
Bedrock failure
Dispatch failure rate
DynamoDB throttling
S3 upload failure
```

For the hackathon, CloudWatch logs and basic alarms are sufficient.

---

# 40. Backup and Recovery

Production should protect:

```text
DynamoDB
S3 evidence
configuration
```

Recommended:

```text
DynamoDB point-in-time recovery
S3 versioning where appropriate
S3 lifecycle/retention policies
Infrastructure as code
```

Do not rely on a developer's laptop as the only copy of application configuration.

---

# 41. Cost Control

For the hackathon:

- Keep resources serverless where practical.
- Avoid always-on EC2 servers unless required.
- Delete unused test resources.
- Avoid unnecessary high-frequency polling.
- Keep S3 lifecycle policies in mind.
- Monitor Bedrock usage.
- Monitor logs and retention.
- Use small test datasets.
- Avoid sending real notifications during repeated development tests.

Production cost should be reviewed after actual usage patterns are known.

---

# 42. Security Deployment Rules

Never deploy production with:

```text
Public S3 evidence
Hard-coded AWS credentials
Provider secrets in Git
Admin endpoints without authorization
Unrestricted CORS
HTTP-only production API
Debug logs containing tokens
```

Always use:

```text
HTTPS
Cognito
IAM least privilege
Secrets Manager
Private S3
Server-side authorization
Audit logs
```

---

# 43. Rollback Strategy

If a deployment fails:

```text
New Lambda version
       ↓
Health/test failure
       ↓
Rollback previous version
```

For frontend:

```text
Previous known-good build
```

should remain recoverable.

Database schema changes should be backward compatible where possible.

---

# 44. Production Deployment Flow

```text
Developer
   ↓
Git push
   ↓
CI
   ├── lint
   ├── typecheck
   ├── test
   └── build
        ↓
Infrastructure deployment
        ↓
Lambda deployment
        ↓
API deployment
        ↓
Frontend deployment
        ↓
Smoke tests
        ↓
Production
```

---

# 45. Smoke Test

After deployment, verify:

```text
1. Citizen can sign in
2. Citizen can create incident
3. GPS is captured
4. Evidence uploads to S3
5. Bedrock analysis succeeds
6. Responder matching returns expected responder
7. Citizen selects responder
8. Assignment is created
9. Dispatch job reaches SQS
10. Dispatch worker processes it
11. Notification reaches configured channel
12. Responder sees incident
13. Responder acknowledges
14. Responder accepts
15. Responder updates status
16. Incident can be resolved
```

If this sequence works, the core WildCare deployment is operational.

---

# 46. Final Deployment Architecture

```text
                        ┌─────────────────┐
                        │   wildcare.in   │
                        │ Citizen Frontend│
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Amazon Cognito  │
                        └────────┬────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ API Gateway            │
                    │ /api/v1/*              │
                    └───────────┬────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Lambda API      │
                       └───────┬─────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
        DynamoDB              S3               Bedrock
             │                                    │
             └────────────────┬───────────────────┘
                              │
                              ▼
                             SQS
                              │
                              ▼
                     Dispatch Lambda
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
               SES            SMS       External APIs
                │             │             │
                └─────────────┼─────────────┘
                              ▼
                         Responders

              dashboard.wildcare.in
                         │
                         ▼
                     Cognito
                         │
                         ▼
                    API Gateway
```

---

# 47. Deployment Completion Criteria

Deployment documentation is complete when:

- [ ] Development environment is defined
- [ ] Staging environment is defined
- [ ] Production environment is defined
- [ ] Cognito deployment is defined
- [ ] API Gateway deployment is defined
- [ ] Lambda deployment is defined
- [ ] DynamoDB deployment is defined
- [ ] S3 deployment is defined
- [ ] Bedrock integration is defined
- [ ] SQS/DLQ deployment is defined
- [ ] Secrets management is defined
- [ ] IAM principles are defined
- [ ] Frontend deployment is defined
- [ ] Dashboard deployment is defined
- [ ] DNS/HTTPS is defined
- [ ] CI/CD is defined
- [ ] Monitoring is defined
- [ ] Backup/recovery is defined
- [ ] Smoke test is defined

---

# 48. Final Rule

The first deployment should optimize for:

```text
WORKING
    >
AUTOMATED
    >
PERFECT
```

Once the complete citizen → responder workflow works reliably, deployment automation, advanced infrastructure, additional communication providers, and production hardening can be added incrementally.
