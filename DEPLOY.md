# HireHub deployment guide (based on this project archive)

This project contains a React/Vite frontend in `frontend/hirehub-app` and a PHP/MongoDB API in `backend`.

## 1. MongoDB Atlas
1. Create a MongoDB Atlas cluster and database user.
2. Configure Atlas Network Access so the deployed backend can connect. For a quick demo, Atlas may require a broad IP rule; restrict it when possible.
3. Copy the application connection string and replace the username/password placeholders. Do not commit the real connection string.

## 2. GitHub
1. Extract this ZIP.
2. Create a GitHub repository and upload the extracted project contents, preserving folder structure.
3. Do not upload credentials or real `.env` files. The `.env.example` files contain placeholders only.

## 3. Backend on Render
1. Create a Render Web Service connected to the GitHub repository.
2. Set **Root Directory** to `backend`.
3. Choose **Docker** runtime (Render should detect `Dockerfile`).
4. Add environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `FRONTEND_URL` = your deployed Vercel origin, e.g. `https://hirehub-example.vercel.app`
5. Deploy. The API base URL will be `https://YOUR-RENDER-SERVICE.onrender.com/api`.
6. Test `https://YOUR-RENDER-SERVICE.onrender.com/api/index.php`.

## 4. Frontend on Vercel
1. Import the same GitHub repository in Vercel.
2. Set **Root Directory** to `frontend/hirehub-app`.
3. Framework: Vite (or let Vercel detect it); Build command `npm run build`; Output directory `dist`.
4. Add environment variable `VITE_API_BASE_URL` = `https://YOUR-RENDER-SERVICE.onrender.com/api`.
5. Deploy. Copy the Vercel origin (no path) into Render's `FRONTEND_URL` and redeploy the backend if necessary.

## Notes
- `VITE_API_BASE_URL` is public frontend configuration, not a secret.
- Never put `MONGODB_URI` in the frontend.
- Uploaded resumes are currently stored in the backend filesystem. Files on ephemeral hosting storage may not persist across restarts/redeploys; use persistent/object storage for production.
- The archive may include local development/test files. Remove diagnostic endpoints such as `phpinfo.php` and test scripts before production if you publish them under the web root.
