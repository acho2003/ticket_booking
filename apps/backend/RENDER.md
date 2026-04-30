# Render Deployment

Use the repository root as the Render service root.

## Build Command

```bash
npm install && npm run render:build
```

## Start Command

```bash
npm run render:start
```

The start command runs `prisma migrate deploy` before starting the API, so committed migrations are applied automatically.

## Required Environment Variables

```bash
NODE_ENV=production
HOST=0.0.0.0
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
PUBLIC_API_URL=https://your-render-service.onrender.com
CORS_ORIGIN=https://your-admin-site.com,https://your-web-site.com
UPLOAD_DIR=/opt/render/project/src/apps/backend/uploads
```

`PORT` is provided by Render automatically.

## Health Checks

Use `/health` for Render health checks.

Use `/health/db` when you want to verify database connectivity.

## Notes

Local file uploads work on Render, but Render disk storage is ephemeral unless you attach a persistent disk. For production posters, move the storage provider to S3 or Cloudinary later.
