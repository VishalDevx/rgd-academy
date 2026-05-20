# Vercel Deployment Guide

## ✅ Build Status
**Build Successful** - All errors fixed and ready for deployment!

## Required Environment Variables

Set these in your Vercel project settings:

### Database
- `DATABASE_URL` - PostgreSQL connection string (Supabase or Neon)

### Authentication
- `NEXTAUTH_SECRET` - Strong random secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### Supabase (for file uploads)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Vercel Cron Jobs
- `CRON_SECRET` or `CRON_SECRET_TOKEN` - Secret token for cron job authentication

### Upstash Redis (for rate limiting)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token

## Deployment Steps

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Set Environment Variables**
   - Add all variables listed above in Vercel dashboard
   - Under Settings → Environment Variables

4. **Run Database Migrations**
   ```bash
   # Using Vercel CLI
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

   Or use Vercel's database migration feature if available.

5. **Deploy**
   - Vercel will automatically build and deploy
   - Check build logs for any issues

## Post-Deployment

1. **Verify Database Connection**
   - Check that Prisma can connect to your database

2. **Test Authentication**
   - Try logging in as admin/staff/student

3. **Verify Cron Jobs**
   - Check Vercel Cron dashboard for scheduled jobs
   - Test `/api/cron/promote-students` endpoint

4. **Test Image Uploads**
   - Upload images via admin settings
   - Verify they appear on the website

## Build Configuration

- **Framework**: Next.js 15.5.9
- **Node Version**: 18+ (set in `package.json` if needed)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (runs `prisma generate` via postinstall)

## Important Notes

- Prisma Client is auto-generated on `npm install` via `postinstall` script
- Database migrations must be run manually after first deployment
- Image uploads require Supabase storage bucket named `kakshaone`
- Rate limiting requires Upstash Redis (free tier available)

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify `DATABASE_URL` is accessible from Vercel
- Check build logs for specific errors

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL is enabled if required

### Image Upload Issues
- Verify Supabase bucket `kakshaone` exists
- Check `SUPABASE_SERVICE_ROLE_KEY` has correct permissions
- Verify bucket is public or CORS is configured

### Cron Jobs Not Running
- Check `CRON_SECRET` is set in environment variables
- Verify cron schedule in `vercel.json`
- Check Vercel Cron dashboard for execution logs
