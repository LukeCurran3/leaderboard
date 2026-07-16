# BMI Board

Shared leaderboard. React + Vite frontend, Supabase for storage, deployable to Vercel in a few clicks.

## 1. Supabase (~5 min)

1. Go to supabase.com → New project (free tier is fine).
2. Once it's created, open **SQL Editor → New query**, paste the contents of `supabase-schema.sql`, and hit Run.
3. Go to **Project Settings → API** and copy two things: the **Project URL** and the **anon public key**.

## 2. Run locally (optional)

```bash
cp .env.example .env    # paste your URL + anon key into .env
npm install
npm run dev
```

## 3. Deploy to Vercel (~5 min)

1. Push this folder to a GitHub repo (a personal one, not battelle-software).
2. On vercel.com → **Add New → Project** → import the repo. Vercel auto-detects Vite.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. You get a live URL like `bmi-board.vercel.app`.

## 4. iPhone app feel

Send friends the URL. In Safari: **Share → Add to Home Screen**. It installs with the "BMI" icon and opens fullscreen like a native app (the meta tags in `index.html` handle this). Replace `public/icon.png` if you want a different icon.

## Notes

- The anon key is safe to expose in frontend code — that's what it's for. Row Level Security limits what it can do (read + insert only; no edits or deletes from the app).
- To delete a bad entry, do it from the Supabase dashboard: **Table Editor → entries**.
- Custom domain: buy one (Namecheap/Cloudflare, ~$10/yr), then Vercel → Project → Settings → Domains.
