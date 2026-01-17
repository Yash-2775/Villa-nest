# 🏡 VillaNest

VillaNest is a modern villa booking and management web application built with **React (Vite)**, **TypeScript**, **Firebase**, and **Supabase**.  
It allows users to browse villas, check availability, make bookings, and submit verified reviews, while providing admin-level management features.

---

## 🚀 Features

### User Features
- Browse luxury villas with detailed information
- Hourly and nightly booking support
- Authenticated user bookings
- Verified guest reviews and ratings
- Average rating calculation (visible reviews only)
- Secure authentication

### Admin Features
- Admin-protected routes
- Review moderation support
- Booking status management
- Firebase-backed data persistence

---

## 🛠 Tech Stack

**Frontend**
- React + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend / Services**
- Firebase (Auth, Firestore)
- Supabase (optional integrations)

**Tooling**
- Bun / npm
- ESLint
- PostCSS

---

## 📂 Project Structure

VillaNest/
│
├── functions/ # Firebase cloud functions
├── public/ # Static assets
├── src/
│ ├── components/ # Reusable UI components
│ ├── contexts/ # Auth & global contexts
│ ├── firebase/ # Firebase configuration
│ ├── hooks/ # Custom hooks
│ ├── lib/ # Shared utilities
│ ├── pages/ # App pages (routes)
│ ├── routes/ # Protected & admin routes
│ ├── services/ # API & service logic
│ ├── types/ # TypeScript types
│ ├── utils/ # Helper functions
│ ├── App.tsx
│ └── main.tsx
│
├── supabase/ # Supabase config
├── .env.example # Environment variable template
├── .gitignore
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md



---

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

🧑‍💻 Installation & Run Locally
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev

App runs at: http://localhost:5173

