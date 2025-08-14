# Email Management Platform - Frontend & Backend Integration Contracts

## Current Status
✅ **Frontend Complete** - Gmail/Outlook-inspired interface with mock data
- Master password authentication system
- Dashboard with email account overview
- Bulk account creation interface
- Email management interface
- Account password management

## API Contracts

### Authentication APIs
```
POST /api/auth/login
Body: { "masterPassword": "string" }
Response: { "success": boolean, "token": "string", "error": "string" }

POST /api/auth/verify
Headers: { "Authorization": "Bearer {token}" }
Response: { "valid": boolean }
```

### Email Account Management APIs
```
GET /api/accounts
Response: { "accounts": EmailAccount[] }

POST /api/accounts/bulk
Body: { "usernames": string[], "domain": "string" }
Response: { "created": EmailAccount[], "errors": string[] }

PUT /api/accounts/{id}/password
Body: { "newPassword": "string" }
Response: { "success": boolean }

DELETE /api/accounts/{id}
Response: { "success": boolean }
```

### Email Operations APIs
```
GET /api/accounts/{id}/emails/{folder}
Response: { "emails": Email[] }

POST /api/accounts/{id}/emails/send
Body: { "to": "string", "subject": "string", "body": "string" }
Response: { "success": boolean, "emailId": "string" }

GET /api/accounts/{id}/emails/{emailId}
Response: { "email": Email }
```

## Data Models

### EmailAccount
```javascript
{
  id: "string",
  email: "string",
  username: "string", 
  password: "string",
  domain: "string",
  createdAt: "ISO string",
  status: "active" | "inactive",
  emailCounts: {
    inbox: number,
    sent: number,
    drafts: number,
    trash: number
  }
}
```

### Email
```javascript
{
  id: "string",
  from: "string",
  to: "string",
  subject: "string",
  body: "string",
  timestamp: "ISO string",
  read: boolean,
  folder: "inbox" | "sent" | "drafts" | "trash"
}
```

## Mock Data Currently Used
Located in `/frontend/src/utils/mockData.js`:
- 2 sample email accounts (john.doe, sarah.wilson)
- Sample emails in inbox/sent/drafts folders
- 15 sample usernames (Indian and foreign names)
- Domain placeholder: "yourdomain.com"

## Backend Implementation Plan

### 1. Database Schema (MongoDB)
- **users** collection: Master authentication
- **email_accounts** collection: Bulk created email accounts  
- **emails** collection: Email messages and metadata

### 2. Core Features to Implement
- Master password authentication with JWT
- CRUD operations for email accounts
- Email storage and retrieval
- Password management for individual accounts
- Bulk account creation with validation

### 3. Email Server Integration (Future Phase)
- IMAP/SMTP server setup for actual email sending/receiving
- Domain DNS configuration
- Email server authentication

### 4. Frontend Integration Points
- Replace mock data in EmailContext with API calls
- Add error handling and loading states
- Implement proper authentication flow
- Add email synchronization

## Security Considerations
- Master password hashing (bcrypt)
- JWT token management
- Individual email password encryption
- Input validation and sanitization
- Rate limiting for bulk operations

## Environment Variables Required
```
MONGO_URL=existing
JWT_SECRET=to_be_generated
MASTER_PASSWORD_HASH=to_be_generated
EMAIL_SERVER_HOST=future_implementation
EMAIL_SERVER_PORT=future_implementation
```

## Testing Strategy
- Backend API testing with automated tests
- Frontend integration testing
- End-to-end user flow testing
- Bulk operations stress testing