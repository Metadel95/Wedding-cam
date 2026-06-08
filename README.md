# 💒 Wedding Disposable Camera

A romantic web app for wedding guests to share photos — like a disposable camera. Each guest gets exactly **10 photos**. Photos are stored in Cloudinary and displayed in a shared gallery.

---

## ✨ Features

- 10-photo limit per guest (tracked in browser localStorage)
- Film strip counter showing used/remaining frames  
- Direct-to-Cloudinary photo uploads
- Shared gallery for all guests
- Mobile-first, opens camera directly on phones
- Romantic, elegant design

---

## 🚀 Setup (5 minutes)

### 1. Cloudinary (free photo storage)

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for free
2. From your dashboard, copy your **Cloud name**, **API Key**, and **API Secret**
3. In Cloudinary dashboard → Settings → Upload → **Add upload preset**
   - Set as "Unsigned" — NOT needed here (we use signed server uploads)

### 2. Local development

```bash
# Install dependencies
npm install

# Copy env file and fill in your Cloudinary keys
cp .env.local .env.local   # already exists — just edit it

# Edit .env.local:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Deploy to Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "Wedding camera app"
git remote add origin https://github.com/YOUR_USERNAME/wedding-cam.git
git push -u origin main
```

Then in [vercel.com](https://vercel.com):
1. Import your GitHub repo
2. Add environment variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`  
   - `CLOUDINARY_API_SECRET`
3. Deploy! 🎉

---

## 🎨 Customization

**Change the couple's names and date** → Edit `app/layout.tsx` and `app/page.tsx`

Search for `Sara & Ahmed` and `June 14, 2026` and replace throughout.

**Change photo limit** → Edit `MAX_PHOTOS` in `app/page.tsx` (line 5)

---

## 📱 How guests use it

1. Scan QR code (generate one pointing to your Vercel URL)
2. They see the welcome message: *"You have only 10 photos. Use them wisely."*
3. Tap to take or upload a photo
4. After 10 photos, they're locked out (per device)
5. Anyone can visit `/gallery` to see all photos

---

## 📦 Tech stack

- **Next.js 14** (App Router)
- **Cloudinary** (photo storage, free tier = 25GB)
- **Vercel** (hosting)
- **localStorage** (per-guest photo counting)

---

## 🔒 Notes

- The 10-photo limit is per-browser (localStorage). Guests could bypass by clearing cache or using a different browser — but it's a wedding, trust your guests 😊
- All photos go into the `wedding` folder in your Cloudinary account
- You can download all photos from Cloudinary after the wedding
