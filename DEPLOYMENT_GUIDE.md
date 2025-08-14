# 📧 Email Management Platform - Deployment Guide

## 🗂️ Project Structure
```
/app/
├── frontend/           # React frontend application
├── backend/           # FastAPI backend application
├── contracts.md       # API integration specifications
└── DEPLOYMENT_GUIDE.md # This guide
```

## 📋 Prerequisites

### Required Services
1. **Domain Name** - You need to own a domain (e.g., yourdomain.com)
2. **Email Server** - For actual email functionality:
   - **Option A**: Email hosting service (Google Workspace, Microsoft 365)
   - **Option B**: Self-hosted mail server (Postfix, Dovecot)
   - **Option C**: Email service providers (SendGrid, Mailgun for sending)
3. **Web Hosting** - VPS or cloud hosting (AWS, DigitalOcean, etc.)
4. **Database** - MongoDB hosting (MongoDB Atlas or self-hosted)

## 🚀 Deployment Options

### Option 1: Full Self-Hosted Setup

#### 1. Server Setup (Ubuntu/Linux VPS)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (for frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python (for backend)
sudo apt install python3 python3-pip python3-venv -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Nginx (reverse proxy)
sudo apt install nginx -y
```

#### 2. Deploy Backend
```bash
# Create app directory
sudo mkdir -p /var/www/email-platform
cd /var/www/email-platform

# Upload your backend code
# Copy /app/backend/* to /var/www/email-platform/backend/

# Create virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Set up environment variables
sudo nano backend/.env
```

**Backend .env Configuration:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=email_platform
JWT_SECRET=your-super-secret-jwt-key-here
MASTER_PASSWORD_HASH=$2b$12$your-hashed-master-password
CORS_ORIGINS=https://yourdomain.com
```

#### 3. Deploy Frontend
```bash
cd /var/www/email-platform

# Upload your frontend code
# Copy /app/frontend/* to /var/www/email-platform/frontend/

# Install dependencies
cd frontend
npm install

# Update environment variables
nano .env
```

**Frontend .env Configuration:**
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

```bash
# Build for production
npm run build
```

#### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/email-platform
```

**Nginx Configuration:**
```nginx
# Frontend (main app)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        root /var/www/email-platform/frontend/build;
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/email-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

#### 6. Process Management (PM2)
```bash
# Install PM2
sudo npm install -g pm2

# Create ecosystem file
nano /var/www/email-platform/ecosystem.config.js
```

**PM2 Configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'email-backend',
    cwd: '/var/www/email-platform/backend',
    script: 'venv/bin/uvicorn',
    args: 'server:app --host 0.0.0.0 --port 8001',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

```bash
# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 2: Cloud Deployment (Recommended)

#### Vercel (Frontend) + Railway/Render (Backend)

**Frontend on Vercel:**
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variable: `REACT_APP_BACKEND_URL`
4. Deploy

**Backend on Railway:**
1. Connect GitHub repository
2. Add MongoDB database
3. Set environment variables
4. Deploy

## 📧 Email Server Setup

### Option A: Use Existing Email Provider
If you already have Google Workspace or Microsoft 365:

1. **Create Email Accounts Manually** through your provider's admin panel
2. **Use IMAP/SMTP Integration** in your backend
3. **Store Credentials Securely** in your database

### Option B: Self-Hosted Mail Server
For complete control, set up your own mail server:

#### Install Postfix & Dovecot
```bash
# Install mail server components
sudo apt install postfix dovecot-core dovecot-imapd dovecot-pop3d -y

# Configure Postfix
sudo nano /etc/postfix/main.cf
```

**Key Postfix Settings:**
```
myhostname = mail.yourdomain.com
mydomain = yourdomain.com
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
```

#### DNS Configuration
Set up these DNS records:

```
# MX Record
yourdomain.com.    IN MX 10 mail.yourdomain.com.

# A Record
mail.yourdomain.com.    IN A    YOUR_SERVER_IP

# SPF Record
yourdomain.com.    IN TXT    "v=spf1 mx ~all"

# DKIM (configure after setup)
default._domainkey.yourdomain.com.    IN TXT    "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"

# DMARC
_dmarc.yourdomain.com.    IN TXT    "v=DMARC1; p=none; rua=mailto:admin@yourdomain.com"
```

### Option C: Transactional Email Service
For sending emails only (recommended for bulk operations):

**Using SendGrid:**
```bash
pip install sendgrid
```

**Backend Integration:**
```python
import sendgrid
from sendgrid.helpers.mail import Mail

def create_email_account(username, domain, password):
    # This creates the account in your database only
    # Real email sending goes through SendGrid
    
    sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    
    # Send welcome email
    message = Mail(
        from_email=f'noreply@{domain}',
        to_emails=f'{username}@{domain}',
        subject='Account Created',
        html_content='Your email account has been created!'
    )
    
    response = sg.send(message)
    return response
```

## 🔧 Backend Enhancement for Real Email Creation

Currently, the platform creates accounts in the database. To create real email accounts:

### 1. Update Backend Models
```python
# Add to backend/server.py
from passlib.context import CryptContext
import imaplib
import smtplib

class EmailAccountManager:
    def __init__(self, email_server_config):
        self.imap_server = email_server_config['imap_server']
        self.smtp_server = email_server_config['smtp_server']
        self.admin_user = email_server_config['admin_user']
        self.admin_pass = email_server_config['admin_pass']
    
    def create_email_account(self, username, domain, password):
        # Method 1: Use email provider API (Google Workspace, etc.)
        # Method 2: Use mail server admin commands
        # Method 3: Database-only (current implementation)
        
        # Example for cPanel/WHM
        import requests
        
        response = requests.post(
            f"https://your-cpanel-server:2083/execute/Email/add_pop",
            headers={'Authorization': f'cpanel {self.admin_user}:{self.admin_pass}'},
            data={
                'email': username,
                'domain': domain,  
                'password': password,
                'quota': '1000'  # MB
            }
        )
        
        return response.json()
```

### 2. Environment Variables for Email Server
```env
# Add to backend/.env
EMAIL_SERVER_TYPE=cpanel  # or 'gsuite', 'office365', 'postfix'
EMAIL_SERVER_HOST=your-server.com
EMAIL_ADMIN_USER=admin@yourdomain.com
EMAIL_ADMIN_PASS=admin-password
CPANEL_API_TOKEN=your-cpanel-token
```

## 📱 Usage Instructions

### 1. Access the Platform
- Go to `https://yourdomain.com`
- Login with master password (default: `master123`)

### 2. Create Email Accounts
- Click "Manage Accounts" → "Create Accounts"
- Enter your domain name
- Add usernames (one per line)
- Click "Create Accounts"

### 3. Manage Accounts
- View all created accounts
- Change individual passwords
- Export account list to CSV
- Delete accounts when needed

### 4. Email Operations
- Click "Open Mailbox" for any account
- View inbox, sent, drafts, trash folders
- Compose and send emails
- Search through emails

## 🔒 Security Considerations

### 1. Change Default Passwords
```bash
# Generate new master password hash
python3 -c "
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
print(pwd_context.hash('your-new-master-password'))
"
```

### 2. Secure Environment Variables
- Never commit `.env` files to version control
- Use environment-specific configurations
- Rotate API keys regularly

### 3. Database Security
- Enable MongoDB authentication
- Use SSL/TLS connections
- Regular backups

### 4. Server Security
- Keep system updated
- Configure firewall (UFW)
- Use SSH keys instead of passwords
- Enable fail2ban

## 🆘 Troubleshooting

### Common Issues:

1. **Emails not sending**: Check SMTP configuration and DNS records
2. **Login not working**: Verify master password hash in database
3. **API errors**: Check CORS settings and API endpoints
4. **Domain not resolving**: Verify DNS propagation (24-48 hours)

### Logs Location:
- Frontend: Browser developer console
- Backend: PM2 logs or systemd journal
- Nginx: `/var/log/nginx/`
- Mail server: `/var/log/mail.log`

## 📞 Support

For technical support:
1. Check logs for error messages
2. Verify all environment variables are set
3. Ensure all services are running
4. Check firewall and DNS settings

This platform gives you complete control over email account creation and management for your domain!