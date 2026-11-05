# Database Migration Complete ✓

## Current Status

**D1 Database**: `bridge-wallet-db` (876fdde8-1857-477a-94d0-218f9fb1862e)
- Region: APAC
- Status: ✓ Tables created and indexed

**Tables:**
- ✓ users (email, password, balance, referrals)
- ✓ email_otps (OTP codes with expiry)
- ✓ rate_limits (rate limiting keys)
- ✓ transactions (user transaction history)

**Migration Files:**
- `migrations/0001_initial_schema.sql` - Initial database schema
- Migration already applied to remote database

## Verify Database

```bash
# List all tables
npx wrangler d1 execute bridge-wallet-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"

# Check users table structure
npx wrangler d1 execute bridge-wallet-db --remote --command "PRAGMA table_info(users)"

# Count users
npx wrangler d1 execute bridge-wallet-db --remote --command "SELECT COUNT(*) FROM users"
```

## Next: Deploy & Configure

### 1. Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy out
```

### 2. Add Environment Variable

**Option A: Via Cloudflare Dashboard**
1. Go to https://dash.cloudflare.com
2. Pages > bridge-wallet > Settings > Environment variables
3. Production tab > Add variable
4. Name: `RESEND_API_KEY`
5. Value: `re_xxxxxxxxxxxxx` (from resend.com)
6. Click Save

**Option B: Via CLI (after first deploy)**
```bash
npx wrangler pages secret put RESEND_API_KEY
# Paste your Resend API key when prompted
```

### 3. Get Resend API Key

1. Sign up at https://resend.com (Free: 100 emails/day)
2. Go to API Keys > Create API Key
3. Copy the key (starts with `re_`)
4. Add to Cloudflare as shown above

### 4. Configure Email Domain (Optional)

**Default**: Uses `onboarding@resend.dev` (works immediately)

**Custom domain**: 
1. Verify your domain in Resend dashboard
2. Edit `functions/api/send-code.ts` line 75:
   ```typescript
   from: 'Bridge Wallet <noreply@yourdomain.com>'
   ```

## Test Signup

1. Visit your deployed site: `https://bridge-wallet.pages.dev/signup`
2. Enter email address
3. Check inbox for 6-digit OTP
4. Complete registration form
5. User created with 2500 BDT initial balance

## Troubleshooting

**OTP not received?**
- Check spam folder
- Verify RESEND_API_KEY is set correctly
- Check Resend dashboard for delivery status

**Database errors?**
- Verify binding name is `DB` in wrangler.toml
- Check database ID matches in wrangler.toml

**Rate limit errors?**
- Wait 60 seconds between OTP requests
- Maximum 5 emails per hour per email address
