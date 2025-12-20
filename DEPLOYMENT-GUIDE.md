# cPanel Node.js Deployment Guide - Shopping Journey

## Important: Files to Upload

Upload the **entire project folder** to cPanel, including:
- `.next/` folder (the built application)
- `node_modules/` folder (dependencies)
- `public/` folder (static assets)
- `app.js` (entry point)
- `server.js` (Next.js server)
- `package.json`
- `next.config.mjs`
- `.htaccess`
- `.env.local` (create from .env.production.example)

## Step-by-Step Deployment

### Step 1: Upload Files to cPanel

1. Login to cPanel
2. Open **File Manager**
3. Navigate to `/home/yourusername/shopping-journey` folder
   - If folder doesn't exist, create it
4. Upload `shopping-journey-deploy.tar.gz`
5. Right-click the file and select **Extract**
6. After extraction, delete the `.tar.gz` file to save space

### Step 2: Configure Environment Variables

1. In File Manager, navigate to `/home/yourusername/shopping-journey`
2. Find `.env.production.example` and rename it to `.env.local`
3. Edit `.env.local` and add your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://plctjbxxkuettzgueqck.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
   ADMIN_PASSWORD=your-secure-password
   NODE_ENV=production
   ```

### Step 3: Setup Node.js Application in cPanel

1. In cPanel, find **Setup Node.js App** (under Software section)
2. Click **Create Application**
3. Fill in the settings:
   - **Node.js version**: Select 18.x or 20.x (LTS)
   - **Application mode**: Production
   - **Application root**: `shopping-journey`
   - **Application URL**: Choose your domain/subdomain + `/shopping-journey`
   - **Application startup file**: `app.js`
4. Click **Create**

### Step 4: Start the Application

1. After creating, you'll see your app in the list
2. Click **Run NPM Install** (or the app may already have node_modules)
3. Click **Start App** or **Restart**
4. Wait for status to show "Running"

### Step 5: Test Your Application

1. Visit: `https://yourdomain.com/shopping-journey`
2. Check the health endpoint: `https://yourdomain.com/shopping-journey/api/health`

## Troubleshooting

### App won't start
- Check if Node.js version is 18+ (required by Next.js 16)
- Check the error log in cPanel > Errors or Metrics > Errors
- Make sure `app.js` is set as the startup file

### 502 Bad Gateway
- The Node.js app might not be running
- Go to Setup Node.js App and click Restart
- Check if PORT is being set correctly by cPanel

### CSS files not loading / MIME type errors
If you see errors like "MIME type ('text/javascript') is not a supported stylesheet MIME type":
1. Make sure `.htaccess` is uploaded and contains the MIME type definitions
2. Restart the Node.js application in cPanel
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### "require is not defined" or "http already declared" errors
These errors indicate server-side code is being served to the browser:
1. Make sure you rebuilt the app with `npm run build` after config changes
2. Upload the fresh `.next/` folder to the server
3. Delete the old `.next/` folder on server before uploading new one
4. Restart the Node.js application

### Page loads but assets missing
- Verify `basePath` in next.config.mjs matches your URL path (`/shopping-journey`)
- Check browser console for 404 errors on assets
- Ensure `.next/static/` folder was uploaded correctly

### Can't connect to database
- Verify `.env.local` has correct Supabase credentials
- Check if Supabase allows connections from your server IP

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret!) |
| `ADMIN_PASSWORD` | Password for admin panel access |
| `NODE_ENV` | Set to `production` |
| `PORT` | Usually set automatically by cPanel |

## File Structure on Server

```
shopping-journey/
├── .next/              # Built Next.js output (REQUIRED)
│   ├── cache/
│   ├── server/
│   └── static/         # Static assets (CSS, JS, fonts)
├── node_modules/       # Dependencies (REQUIRED)
├── public/             # Public static assets
├── app.js              # cPanel Passenger entry point
├── server.js           # Next.js custom server
├── package.json        # Project config
├── next.config.mjs     # Next.js configuration
├── .env.local          # Environment variables (create this)
└── .htaccess           # MIME types and rewrite rules
```

## Notes

- The app is configured with `basePath: "/shopping-journey"` so all routes are prefixed
- cPanel's Passenger will automatically manage the PORT
- If you need to rebuild, you'll need to run `npm run build` via SSH or upload a new build
