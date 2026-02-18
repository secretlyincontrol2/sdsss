# Deploying to Render.com

Since we have a monorepo structure (client + server), you need to create **two separate services** on Render.

## 1. Backend (Docker Web Service)
1.  Go to **New +** -> **Web Service**.
2.  Connect your repository: `secretlyincontrol2/sdsss`.
3.  **Name**: `fyp-backend`.
4.  **Root Directory**: `server` (Important!).
5.  **Environment**: `Docker`.
6.  **Region**: Oregon (US West) - (To match your database).
7.  **Environment Variables**:
    -   `DB_HOST`: `dpg-d6aamu6mcj7s73dscrsg-a.oregon-postgres.render.com`
    -   `DB_PORT`: `5432`
    -   `DB_NAME`: `group_7_p`
    -   `DB_USER`: `group_7_p_user`
    -   `DB_PASSWORD`: `ofVKfQ6CaF02GlPM1Vuh0IcxowDs7mCV`
    -   `FRONTEND_URL`: `https://your-frontend-url.onrender.com`

## 2. Frontend (Static Site)
1.  Go to **New +** -> **Static Site**.
2.  Connect your repository: `secretlyincontrol2/sdsss`.
3.  **Name**: `fyp-frontend`.
4.  **Root Directory**: `client`.
5.  **Build Command**: `npm install && npm run build`.
6.  **Publish Directory**: `dist`.
7.  **Environment Variables**:
    -   `VITE_API_URL`: `https://your-backend-url.onrender.com` (Copy from backend service)
8.  **Rewrite Rules**:
    -   Source: `/*`
    -   Destination: `/index.html`
    -   Action: `Rewrite`

## 3. Final Step
-   After both are deployed, copy the **Frontend URL** and update the `FRONTEND_URL` variable in your **Backend Service**.
-   Copy the **Backend URL** (e.g., `https://fyp-backend.onrender.com`) and ensure `VITE_API_URL` in **Frontend Service** matches it. Trigger a manual deploy on Frontend if you changed the var.

Good luck! 🚀
