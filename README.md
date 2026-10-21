# KKS Constructions & Real Estate

Ultra-luxury residential and architectural showcase platform and Owner CMS for **KKS Constructions**. Built with React 19, Tailwind CSS v4, Framer Motion, Node.js Express 5, MongoDB, and Cloudinary.

---

## Quick Start

### Option 1: One-Click Launcher (Windows)
Double-click `start-dev.bat` in the root folder. Both backend and frontend will start concurrently.

### Option 2: Command Line
From the project root:

```bash
npm.cmd install
npm.cmd run dev
```

Or run services individually:
- **Backend API**: `npm.cmd run dev:backend` (runs on `http://localhost:5000`)
- **Frontend App**: `npm.cmd run dev:frontend` (runs on `http://localhost:5173`)

---

## URLs & Access

- **Public Web Application**: [http://localhost:5173](http://localhost:5173)
- **Owner Admin CMS**: [http://localhost:5173/admin](http://localhost:5173/admin)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Live Content API**: [http://localhost:5000/api/content](http://localhost:5000/api/content)
- **Projects Endpoint**: [http://localhost:5000/api/projects](http://localhost:5000/api/projects)
- **Testimonials Endpoint**: [http://localhost:5000/api/testimonials](http://localhost:5000/api/testimonials)
- **Enquiries Endpoint**: [http://localhost:5000/api/enquiries](http://localhost:5000/api/enquiries)

---

## Authentication & Initial Owner Credentials

- **Login Portal**: Access via `/admin/login` or discrete footer link.
- **Owner email**: `constructionskks@gmail.com`
- **Initial development password**: `kks123` (local development only)
- **Security Features**:
  - Secure bcrypt password hashing with automatic initial bootstrapping.
  - HTTP-only signed session cookies (`kks_admin_session`), configured for HTTPS production.
  - Login rate limiter (10 attempts per 15 minutes per IP).
  - Origin-checked, server-protected admin APIs (`requireAuth` middleware).
  - Password change with strict strength validation (min 8 chars, letter, number, special character).
  - No public registration allowed.

> [!WARNING]
> The development password is never accepted in production. Production startup requires a unique bootstrap password and session secret; change the bootstrap password after first owner login.

---

## Admin CMS Features

Through the dashboard at `/admin`, the owner can manage all content without touching code:

1. **Residences & Projects**:
   - Add new projects with custom slug, cover, photo gallery, specs, and amenities.
   - Edit, delete, and reorder projects (move up / down).
   - Instant visibility toggle: Hide (Draft mode) or Publish directly to public visitors.
   - Direct image upload to Cloudinary (or resilient local media fallback).

2. **Testimonials**:
   - Add, edit, delete, reorder, and hide/publish client & press reviews.

3. **Website Content & Sections**:
   - Company branding: name, moniker, tagline, logo upload, bio, overview, mission, and vision.
   - Contact desk: address, city, telephone, email, advisory hours, WhatsApp direct link, studio notes.
   - Highlights & Statistics: dynamic counter values and labels.
   - Core Values: add, edit, and remove brand pillars.
   - Page Banners: editable hero titles, subtitles, and imagery for Home, About, Projects, Contact, and Testimonials.
   - Custom reusable page sections: create text, image, gallery, callout, quote, CTA, and video sections; choose a page and placement, preview, reorder, hide, save as a private draft, and publish without code changes.
   - Public page visibility and editable navigation/footer content, with Home, Projects, and Contact protected from removal.
   - Page copy and content lists: edit homepage introduction, About standards and milestones, Contact FAQs, and press/recognition entries.
   - Disclaimers: legal and architectural concepts disclaimers.

4. **Inbound Inquiries**:
   - Review leads with client name, email, phone, requested residence, message, and date.

---

## Environment & Deployment Configuration

Backend configuration is controlled via `backend/.env`. Copy `backend/.env.example` and configure:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=<unique random secret of at least 32 characters>

# Owner bootstrap credentials
OWNER_USERNAME=constructionskks
OWNER_EMAIL=constructionskks@gmail.com
OWNER_INITIAL_PASSWORD=kks123

# MongoDB Atlas Database URI (Optional in dev; required and reachable in production)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kks_constructions?retryWrites=true&w=majority

# Cloudinary Storage Credentials (Optional in dev; required in production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`kks123` is only for local development. Production requires a different unique bootstrap password (at least 12 characters), a 32+ character session secret, HTTPS `CLIENT_ORIGIN` values, reachable MongoDB Atlas, and Cloudinary credentials. Local development may use the JSON datastore and local media fallback.

For a separately hosted frontend, configure `VITE_API_URL` in `frontend/.env` with the backend HTTPS URL. Backend credentials and session secrets are server-only.

### Production Deployment Notes:
- Set `NODE_ENV=production`.
- Update `CLIENT_ORIGIN` with your deployed frontend domain (e.g., `https://kksconstructions.com`).
- Ensure `MONGODB_URI` points to your production MongoDB Atlas cluster.
- Provide `CLOUDINARY_*` keys so images are served through Cloudinary's global CDN.
- Terminate HTTPS at a trusted reverse proxy/platform and forward the original protocol. Production cookies are Secure and use SameSite=None for cross-origin frontend/API requests.
- Set `CLIENT_ORIGIN` to exact, comma-separated HTTPS frontend origins and `VITE_API_URL` to the backend HTTPS URL at frontend build time.
