from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import os
import jwt
import hashlib
import uuid
from passlib.context import CryptContext
import asyncio
from contextlib import asynccontextmanager
import smtplib
import imaplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import email
from email.header import decode_header

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET", "your-email-service-secret-key")
ALGORITHM = "HS256"

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = "email_service"

# Global database client
db_client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global db_client, db
    db_client = AsyncIOMotorClient(MONGO_URL)
    db = db_client[DATABASE_NAME]
    
    # Create indexes
    await db.email_accounts.create_index("email", unique=True)
    await db.emails.create_index([("account_id", 1), ("folder", 1), ("timestamp", -1)])
    
    yield
    
    # Shutdown
    if db_client:
        db_client.close()

app = FastAPI(
    title="Email Service API",
    description="Complete email service for domain management",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class EmailAccountCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None

class EmailAccountResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]
    storage_used: int = 0
    storage_quota: int = 1000  # MB

class EmailSend(BaseModel):
    to: List[EmailStr]
    subject: str
    body: str
    cc: Optional[List[EmailStr]] = []
    bcc: Optional[List[EmailStr]] = []

class EmailResponse(BaseModel):
    id: str
    from_email: str
    to: List[str]
    cc: List[str]
    bcc: List[str]
    subject: str
    body: str
    timestamp: datetime
    read: bool
    folder: str
    attachments: List[str] = []

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class BulkAccountCreate(BaseModel):
    accounts: List[EmailAccountCreate]
    domain: str

# Helper Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        account = await db.email_accounts.find_one({"email": email})
        if account is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return account
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Email Server Simulation Functions
class EmailServer:
    def __init__(self):
        self.smtp_host = "localhost"
        self.smtp_port = 587
        self.imap_host = "localhost"
        self.imap_port = 993
    
    async def send_email(self, from_email: str, to_emails: List[str], subject: str, body: str, cc: List[str] = [], bcc: List[str] = []):
        """Simulate sending an email"""
        # In production, this would use real SMTP
        email_id = str(uuid.uuid4())
        
        # Store in sender's sent folder
        sent_email = {
            "id": email_id,
            "account_id": from_email,
            "from_email": from_email,
            "to": to_emails,
            "cc": cc,
            "bcc": bcc,
            "subject": subject,
            "body": body,
            "timestamp": datetime.utcnow(),
            "folder": "sent",
            "read": True,
            "attachments": []
        }
        
        await db.emails.insert_one(sent_email)
        
        # Store in recipients' inbox (simulate delivery)
        for recipient in to_emails + cc:
            # Check if recipient exists in our system
            recipient_account = await db.email_accounts.find_one({"email": recipient})
            if recipient_account:
                inbox_email = {
                    "id": str(uuid.uuid4()),
                    "account_id": recipient,
                    "from_email": from_email,
                    "to": [recipient],
                    "cc": cc,
                    "bcc": [],  # BCC recipients don't see each other
                    "subject": subject,
                    "body": body,
                    "timestamp": datetime.utcnow(),
                    "folder": "inbox",
                    "read": False,
                    "attachments": []
                }
                await db.emails.insert_one(inbox_email)
        
        return email_id
    
    async def get_emails(self, account_email: str, folder: str = "inbox", limit: int = 50, offset: int = 0):
        """Get emails from a specific folder"""
        cursor = db.emails.find(
            {"account_id": account_email, "folder": folder}
        ).sort("timestamp", -1).skip(offset).limit(limit)
        
        emails = await cursor.to_list(length=limit)
        return emails

# Initialize email server
email_server = EmailServer()

# API Routes

@app.post("/api/auth/login")
async def login(email: EmailStr, password: str):
    """Login to email account"""
    account = await db.email_accounts.find_one({"email": email})
    if not account or not verify_password(password, account["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await db.email_accounts.update_one(
        {"email": email},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token = create_access_token(data={"sub": email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "account": {
            "id": str(account["_id"]),
            "email": account["email"],
            "display_name": account.get("display_name", ""),
            "storage_used": account.get("storage_used", 0),
            "storage_quota": account.get("storage_quota", 1000)
        }
    }

@app.post("/api/accounts/create", response_model=EmailAccountResponse)
async def create_email_account(account_data: EmailAccountCreate):
    """Create a new email account"""
    # Check if account already exists
    existing = await db.email_accounts.find_one({"email": account_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email account already exists")
    
    # Create account
    account = {
        "email": account_data.email,
        "password_hash": get_password_hash(account_data.password),
        "display_name": account_data.display_name or account_data.email.split("@")[0],
        "created_at": datetime.utcnow(),
        "last_login": None,
        "storage_used": 0,
        "storage_quota": 1000,
        "status": "active"
    }
    
    result = await db.email_accounts.insert_one(account)
    account["id"] = str(result.inserted_id)
    
    # Create default folders by inserting welcome email
    welcome_email = {
        "id": str(uuid.uuid4()),
        "account_id": account_data.email,
        "from_email": "system@" + account_data.email.split("@")[1],
        "to": [account_data.email],
        "cc": [],
        "bcc": [],
        "subject": "Welcome to your new email account!",
        "body": f"Hello {account['display_name']},\n\nYour email account {account_data.email} has been successfully created.\n\nYou can now send and receive emails.\n\nBest regards,\nEmail Service Team",
        "timestamp": datetime.utcnow(),
        "folder": "inbox",
        "read": False,
        "attachments": []
    }
    
    await db.emails.insert_one(welcome_email)
    
    return EmailAccountResponse(**account)

@app.post("/api/accounts/bulk-create")
async def bulk_create_accounts(bulk_data: BulkAccountCreate):
    """Create multiple email accounts for bulk operations"""
    created_accounts = []
    errors = []
    
    for account_data in bulk_data.accounts:
        try:
            # Check if account already exists
            existing = await db.email_accounts.find_one({"email": account_data.email})
            if existing:
                errors.append(f"Account {account_data.email} already exists")
                continue
            
            # Create account
            account = {
                "email": account_data.email,
                "password_hash": get_password_hash(account_data.password),
                "display_name": account_data.display_name or account_data.email.split("@")[0],
                "created_at": datetime.utcnow(),
                "last_login": None,
                "storage_used": 0,
                "storage_quota": 1000,
                "status": "active"
            }
            
            result = await db.email_accounts.insert_one(account)
            account["id"] = str(result.inserted_id)
            created_accounts.append(account)
            
            # Create welcome email
            welcome_email = {
                "id": str(uuid.uuid4()),
                "account_id": account_data.email,
                "from_email": f"welcome@{bulk_data.domain}",
                "to": [account_data.email],
                "cc": [],
                "bcc": [],
                "subject": "Welcome to your new email account!",
                "body": f"Hello {account['display_name']},\n\nYour email account has been created as part of {bulk_data.domain} email service.\n\nBest regards,\nEmail Service Team",
                "timestamp": datetime.utcnow(),
                "folder": "inbox",
                "read": False,
                "attachments": []
            }
            
            await db.emails.insert_one(welcome_email)
            
        except Exception as e:
            errors.append(f"Failed to create {account_data.email}: {str(e)}")
    
    return {
        "created": len(created_accounts),
        "errors": errors,
        "accounts": created_accounts
    }

@app.get("/api/emails/{folder}")
async def get_emails(folder: str, limit: int = 50, offset: int = 0, current_user = Depends(get_current_user)):
    """Get emails from specified folder"""
    valid_folders = ["inbox", "sent", "drafts", "trash", "spam"]
    if folder not in valid_folders:
        raise HTTPException(status_code=400, detail="Invalid folder")
    
    emails = await email_server.get_emails(current_user["email"], folder, limit, offset)
    
    # Convert ObjectId to string
    for email in emails:
        email["_id"] = str(email["_id"])
    
    return {"emails": emails, "total": len(emails)}

@app.post("/api/emails/send")
async def send_email(email_data: EmailSend, current_user = Depends(get_current_user)):
    """Send an email"""
    try:
        email_id = await email_server.send_email(
            from_email=current_user["email"],
            to_emails=email_data.to,
            subject=email_data.subject,
            body=email_data.body,
            cc=email_data.cc,
            bcc=email_data.bcc
        )
        
        return {"success": True, "email_id": email_id, "message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@app.get("/api/emails/{email_id}")
async def get_email(email_id: str, current_user = Depends(get_current_user)):
    """Get a specific email by ID"""
    email = await db.emails.find_one({
        "id": email_id,
        "account_id": current_user["email"]
    })
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Mark as read if it's in inbox
    if email["folder"] == "inbox" and not email["read"]:
        await db.emails.update_one(
            {"id": email_id},
            {"$set": {"read": True}}
        )
        email["read"] = True
    
    email["_id"] = str(email["_id"])
    return email

@app.put("/api/emails/{email_id}/move")
async def move_email(email_id: str, folder: str, current_user = Depends(get_current_user)):
    """Move email to different folder"""
    valid_folders = ["inbox", "sent", "drafts", "trash", "spam"]
    if folder not in valid_folders:
        raise HTTPException(status_code=400, detail="Invalid folder")
    
    result = await db.emails.update_one(
        {"id": email_id, "account_id": current_user["email"]},
        {"$set": {"folder": folder}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    
    return {"success": True, "message": f"Email moved to {folder}"}

@app.delete("/api/emails/{email_id}")
async def delete_email(email_id: str, current_user = Depends(get_current_user)):
    """Delete an email permanently"""
    result = await db.emails.delete_one({
        "id": email_id,
        "account_id": current_user["email"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    
    return {"success": True, "message": "Email deleted permanently"}

@app.put("/api/account/password")
async def change_password(password_data: PasswordChange, current_user = Depends(get_current_user)):
    """Change account password"""
    if not verify_password(password_data.current_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = get_password_hash(password_data.new_password)
    
    await db.email_accounts.update_one(
        {"email": current_user["email"]},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"success": True, "message": "Password changed successfully"}

@app.get("/api/account/stats")
async def get_account_stats(current_user = Depends(get_current_user)):
    """Get account statistics"""
    stats = {}
    
    # Count emails in each folder
    folders = ["inbox", "sent", "drafts", "trash", "spam"]
    for folder in folders:
        count = await db.emails.count_documents({
            "account_id": current_user["email"],
            "folder": folder
        })
        stats[folder] = count
    
    # Count unread emails
    unread_count = await db.emails.count_documents({
        "account_id": current_user["email"],
        "folder": "inbox",
        "read": False
    })
    stats["unread"] = unread_count
    
    # Storage info
    stats["storage_used"] = current_user.get("storage_used", 0)
    stats["storage_quota"] = current_user.get("storage_quota", 1000)
    
    return stats

@app.get("/")
async def root():
    return {"message": "Email Service API is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)