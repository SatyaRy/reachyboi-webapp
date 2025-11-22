# 🔐 Custom Auth Quick Reference

## Default Credentials

### Admin

```
Email: admin@example.com
Password: admin123
```

### Sample Users

```
Email: user1@example.com        | Exness ID: EXN123456
Email: user2@example.com        | Exness ID: EXN789012
Email: trader@example.com       | Exness ID: EXN345678
```

## URLs

```
Sign In:           http://localhost:3000/auth/signin
Admin Dashboard:   http://localhost:3000/admin/upload-users
Upload Video:      http://localhost:3000/admin/upload
Homepage:          http://localhost:3000
```

## Database Setup

1. Go to: https://supabase.com/dashboard
2. Navigate to: **SQL Editor**
3. Click: **New Query**
4. Paste: `supabase/schema-custom-auth.sql`
5. Click: **Run**

Or use the script:

```bash
./setup-custom-auth.sh
```

## Excel Format

| email              | exness_account_id |
| ------------------ | ----------------- |
| user@example.com   | EXN123456         |
| trader@example.com | EXN789012         |

**Supported column names:**

- `email` or `Email`
- `exness_account_id` or `Exness_Account_ID` or `Exness Account ID`

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run setup script
./setup-custom-auth.sh
```

## API Endpoints

```bash
# Sign in (Admin)
POST /api/auth/signin
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Sign in (User)
POST /api/auth/signin
{
  "email": "user1@example.com",
  "exness_account_id": "EXN123456"
}

# Sign out
POST /api/auth/signout

# Check session
GET /api/auth/session

# Upload users (Admin only)
POST /api/admin/upload-users
FormData: { file: excel_file.xlsx }
```

## Route Protection

### Admin Routes

- `/admin/*` - Requires Supabase Auth + admin table verification

### User Routes

- `/video/*` - Requires custom session OR admin access
- `/category/*` - Requires custom session OR admin access

### Public Routes

- `/` - Homepage (public)
- `/auth/signin` - Sign in page (public)

## Quick Test

### Test Admin:

1. Visit: http://localhost:3000/auth/signin
2. Click: "Admin Login"
3. Email: `admin@example.com`
4. Password: `admin123`
5. Should redirect to: `/admin/upload-users`

### Test User:

1. Visit: http://localhost:3000/auth/signin
2. Click: "User Login"
3. Email: `user1@example.com`
4. Exness ID: `EXN123456`
5. Should redirect to: `/`

### Test Excel Upload:

1. Sign in as admin
2. Click: "Manage Users" in navbar
3. Create Excel with format above
4. Upload file
5. Sign out
6. Try signing in with new user

## Troubleshooting

### Can't sign in as admin?

- Check database schema applied
- Verify admin in `admins` table

### Can't sign in as user?

- Verify user in `authorized_users` table
- Check exact email/Exness ID match

### Excel upload fails?

- Check file format (.xlsx or .xls)
- Verify column names
- Ensure signed in as admin

### Redirected after login?

- Clear browser cookies
- Check browser console for errors

## Files Changed

**New Pages:**

- `/app/auth/signin/page.tsx`
- `/app/admin/upload-users/page.tsx`

**New API Routes:**

- `/api/auth/signin/route.ts`
- `/api/auth/signout/route.ts`
- `/api/auth/session/route.ts`
- `/api/admin/upload-users/route.ts`

**Updated:**

- `/components/Navbar.tsx`
- `/middleware.ts`
- `/app/login/page.tsx` (now redirects)

**New Database:**

- `admins` table
- `authorized_users` table

**Dependencies:**

- `xlsx` (Excel parsing)
- `bcrypt` (password hashing)

## Documentation

- **Setup Guide:** CUSTOM_AUTH_SETUP.md
- **Implementation Summary:** IMPLEMENTATION_SUMMARY.md
- **Flow Diagrams:** AUTH_FLOW_DIAGRAM.md
- **Quick Reference:** QUICK_REFERENCE.md (this file)

## Security Checklist

Before production:

- [ ] Change default admin password
- [ ] Create real admin account
- [ ] Remove sample users
- [ ] Upload real authorized users
- [ ] Set environment variables in Vercel
- [ ] Test authentication in production
- [ ] Verify RLS policies active
- [ ] Check HTTPS enabled

## Support

Need help? Check these docs in order:

1. QUICK_REFERENCE.md (this file)
2. CUSTOM_AUTH_SETUP.md (detailed setup)
3. IMPLEMENTATION_SUMMARY.md (what was built)
4. AUTH_FLOW_DIAGRAM.md (visual diagrams)

---

**Remember:** Change the default admin password before deploying to production! 🔒
