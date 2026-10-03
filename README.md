# ATOMIC — Developer Portfolio
> my portoflio

> **انا عملته بالذكاء الاسطناعي لو حد عايز يخده و يعدل عليه براحتوا**
> 
> *Created with AI — feel free to take it, fork it, and modify it however you like.*

---

## ⚡ Quick Deploy to Vercel

### Method 1: Git Integration (Recommended)
1. Push this repository to GitHub or GitLab:
   ```bash
   git init
   git add .
   git commit -m "feat: complete atomic developer portfolio"
   git branch -M main
   git remote add origin https://github.com/atomic133/atomic-portfolio.git
   git push -u origin main
   ```
2. Navigate to [vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. Leave **Build Command** and **Output Directory** default (this is a static zero-build deployment).
5. Click **Deploy**.

### Method 2: Vercel CLI
Run directly from the project root:
```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod
```

---

## 📁 Architecture & File Layout

```
.
├── index.html          # Main Portfolio (Minecraft Systems & Discord Overview)
├── discord.html        # Dedicated Discord Dev Showcase (Bots & Infrastructure)
├── style.css           # Vanilla CSS Design System (Custom tokens, glassmorphism, responsive)
├── main.js             # Canvas telemetry, interactive hotbar, sound synthesis
├── vercel.json         # Routing rewrites, security headers, clean URLs, and caching
├── package.json        # Project metadata and local preview scripts
├── robots.txt          # Search engine crawl directives
├── sitemap.xml         # XML sitemap for SEO indexation
├── .vercelignore       # Excludes heavy non-web assets from deployment
└── .gitignore          # Git exclusion rules
```

---

## 🌐 Routes

| Route | Destination | Description |
|---|---|---|
| `/` | `index.html` | Core portfolio: Hero, Stats, Bento Grid, Works, Tech Stack, Contact |
| `/discord` | `discord.html` | Discord Bot & Community Infrastructure showcase |

---

## 🛡️ Vercel Edge Configuration (`vercel.json`)

- **Clean URLs:** Enabled (`/discord` automatically routes to `discord.html` without trailing `.html`).
- **Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Cache Optimization:** Immutable long-term caching headers on `style.css` and `main.js`.
