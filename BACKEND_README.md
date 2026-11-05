# Backend Setup Complete ✓

## Database: Cloudflare D1
- **Database ID**: 876fdde8-1857-477a-94d0-218f9fb1862e
- **Region**: APAC
- **Tables**: users, email_otps, rate_limits, transactions

## API Endpoints
- `POST /api/send-code` - Send OTP to email
- `POST /api/signup` - Register new user

## Setup Instructions

### 1. Get Resend API Key
```bash
# Sign up at https://resend.com
# Get API key from dashboard
# Add to Cloudflare Pages environment variables:
# RESEND_API_KEY = re_xxxxx
```

### 2. Configure Email Domain (Optional)
In `functions/api/send-code.ts`, change:
```typescript
from: 'Bridge Wallet <onboarding@resend.dev>'
```
To your verified domain:
```typescript
from: 'Bridge Wallet <noreply@yourdomain.com>'
```

### 3. Deploy to Cloudflare Pages
```bash
# Build static site
npm run build

# Deploy (first time)
npx wrangler pages deploy out --project-name=bridge-wallet

# Add environment variable in Cloudflare dashboard:
# Pages > bridge-wallet > Settings > Environment variables
# RESEND_API_KEY = your_key_here
```

### 4. Test Signup Flow
1. Visit your deployed site
2. Go to /signup
3. Enter email → receive OTP
4. Complete registration
5. Check D1 database for new user

## Database Schema
- **balance** stored in paisa (250000 = 2500.00 BDT)
- Initial balance: 2500 BDT
- **timestamps** in milliseconds
- **OTP expiry**: 10 minutes
- **Rate limit**: 5 emails per hour

## Security Features
- ✓ Password hashing (SHA-256)
- ✓ OTP rate limiting
- ✓ Email cooldown (60s)
- ✓ Expired OTP cleanup
- ✓ Input validation

## Next Steps
- Add signin endpoint
- Add session/JWT auth
- Add withdrawal logic
- Add team/referral system
