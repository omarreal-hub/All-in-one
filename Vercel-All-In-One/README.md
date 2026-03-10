# 🚀 Vercel Deployment Instructions

This folder is a unified Next.js + React project. It contains both your Frontend and Backend API routes, making it easy to deploy to Vercel in one click.

## 📦 How to Deploy

1.  **Push to GitHub**:
    - Create a new repository on GitHub.
    - Upload (or `git push`) the contents of this folder (`Vercel-All-In-One`) to that repository.

2.  **Connect to Vercel**:
    - Go to [Vercel.com](https://vercel.com).
    - Click **"Add New"** -> **"Project"**.
    - Select your GitHub repository.
    - Vercel will automatically detect **Next.js**.

3.  **Configure Environment Variables**:
    - In the Vercel dashboard, go to **Settings** -> **Environment Variables**.
    - Add the following keys from your `.env.local`:
        - `NOTION_API_KEY`
        - `GROQ_API_KEY`
        - `GOOGLE_GENERATIVE_AI_API_KEY`
        - ... (and any page IDs like `NOTION_HABITS_DB_ID`, etc.)

4.  **Deploy**:
    - Click **Deploy**. Your app will be live in a few seconds!

---

## 🛠 Project Structure
- `/src/app/api`: All your backend logic.
- `/src/components` & `/src/views`: Your React frontend.
- `/src/app/page.tsx`: The main entry point for the frontend.
- `/public`: Static assets.
