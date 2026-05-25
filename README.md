# ✿ MomentStash — Your life, handcrafted. ✿

> **Testing & Access Notice**
> Though I can buy a domain and add the site to public in Google OAuth, it is currently in **Test Mode**. If you want access to sign in, please email your Google account address to **[astralquarks.entrust317@passfwd.com](mailto:astralquarks.entrust317@passfwd.com)** so you can be added as a registered test user in the Google Cloud Console.

MomentStash is a digital memory vault and handcrafted scrapbook for your daily magic — cozy cafés, golden-hour sunsets, quiet walks, and thrifting runs, gathered into an offline-friendly diary only you keep.

---

## 🎨 Features

* **Handcrafted Scrapbook Aesthetic**: Layered papers, vintage Polaroid frames, color-matched Washi Tapes, hand-drawn squiggles, and responsive GSAP ScrollTrigger physics.
* **Smart Tokenized Search**: A robust multi-word timeline search. Easily query memory contents, tags (`#thrift`), places, mood stickers, or exact shelves (collections).
* **watercolor Memory Map**: Drop hand-pinned stickers on a watercolor canvas map to visualize the places where your moments occurred.
* **Persistent Synced Shelves (Cloudflare D1 Backed)**: Group your diary entries into handcrafted shelves. Explicitly created empty shelves sync dynamically with the Cloudflare D1 SQL database so they persist across browsers and devices.
* **Google Drive Sync & Base64 Fallback**:
  * Seamlessly uploads photo attachments to your private, isolated **Google Drive AppData folder**.
  * Fully supports multi-photo Polaroids and photo editing.
  * **Fallback**: If Google Drive is unlinked or offline, photos are securely saved locally inside the database as base64 data URLs.
* **Strict Security Controls**: Built with timing-safe constant-time string checks for secure cookies (`HttpOnly`, `SameSite=Lax`, and `Secure`), cryptographically secure UUIDs, and sanitized error-leak boundaries.

---

## 🚀 Getting Started

### 1. Register for Access
During the test phase, send your login email to **astralquarks.entrust317@passfwd.com**. Once added to the Google Console trust list, you can log in instantly.

### 2. Connect Your Memories
1. **Google Login**: Tap **Start Your Journey** and sign in using your authorized Google Account.
2. **Authorize Drive (Optional)**: Grant app data permissions during sign-in to back up photos to your private Google Drive app folder. 
3. **Capture Daily Magic**: Scribble notes, snap pictures, attach tags, and select emoji mood indicators!

### 3. Organize into Shelves
* Organize moments into thematic shelves (e.g. *Cozy Cafés*, *Golden Hours*, *Sunsets*).
* Tap **+ New Shelf** in your Collections. Custom empty shelves are preserved and synced automatically in the cloud.

---

## 📱 Install as an App (PWA)

MomentStash is a Progressive Web App and can be added directly to your device home screen.

* **On Desktop (Chrome / Edge)**: Tap the **Install App** icon in the address bar.
* **On iOS (Safari)**: Tap the **Share** button $\rightarrow$ select **Add to Home Screen**.
* **On Android (Chrome)**: Tap the three dots menu $\rightarrow$ select **Install App**.

---

## 🔒 Security & Privacy

* **Isolated Drive Storage**: The Google Drive AppData folder is invisible to other applications and keeps your attachments private.
* **Session Cookies Hardening**: Session cookies use strict `HttpOnly`, `SameSite=Lax`, and `Secure` attributes, shielding them from XSS theft and CSRF attacks.
* **Zero-Leak Errors**: Production database structures, internal SQL schemas, and exception traces are sanitized and never leak to HTTP clients.

---

## 🛠️ For Developers

Want to run your own instance of MomentStash or contribute?

### Tech Stack
* **Frontend**: React, TanStack Start (Vite, TanStack Router), Vanilla CSS variables.
* **Backend & API**: Cloudflare Pages Functions (V8 Workers runtime).
* **Database**: Cloudflare D1 SQLite.
* **Animations**: GSAP (GreenSock Animation Platform) + ScrollTrigger.

### Quick Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local developer server**:
   ```bash
   npm run dev
   ```

### Database Setup

1. **Initialize the local D1 database schema**:
   ```bash
   npx wrangler d1 execute momentstash-db --local --file=./schema.sql
   ```

2. **Run local migrations or SQL queries**:
   ```bash
   npx wrangler d1 execute momentstash-db --local --command="SELECT * FROM entries"
   ```

### Deploys (Cloudflare Pages)

MomentStash is configured using `wrangler.jsonc`. To deploy to Cloudflare:
1. **Verify linting & build locally**:
   ```bash
   npm run lint
   npm run build
   ```
2. **Deploy via Wrangler CLI**:
   ```bash
   npx wrangler pages deploy dist/client
   ```

### Environment Variables
For production features (OAuth and Google Drive syncing), configure the following variables in the Cloudflare Pages settings console:
```ini
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

---

**Built with ❤️ for keeper of quiet days.**

[Report an Issue](https://github.com/editinghero/MomentStash/issues) • [Request a Feature](https://github.com/editinghero/MomentStash/issues/new)
