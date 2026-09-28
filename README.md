# ECO CLUB HOUSE MANAGEMENT SYSTEM

A complete, production-ready web application built for college Eco Club management, inter-house environmental competitions, activity tracking, and weekly score evaluations.

The college has four official Eco Club houses:
1. 🌲 **GREEN** (Emerald Forest)
2. 🌊 **BLUE** (Ocean Wave)
3. ☀️ **RED** (Solar Flare)
4. 🌻 **YELLOW** (Golden Sun)

The application is built with **React**, **Vite**, **Tailwind CSS**, and integrates directly with **Supabase PostgreSQL** and **Supabase Authentication** using Row Level Security (RLS). It is fully optimized and configured for seamless deployment on **Vercel**.

---

## 1. TECHNOLOGY STACK

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v7, Lucide React icons, Recharts (for charts), PapaParse & SheetJS XLSX (for CSV/Excel handling), Canvas Confetti
- **Backend & Database**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Deployment**: Vercel (with `vercel.json` SPA rewrites)
- **No Node/Express server needed**: Frontend communicates securely and directly with Supabase using RLS policies.

---

## 2. PROJECT STRUCTURE

```
Ecoclubfinal/
├── public/
├── src/
│   ├── components/
│   │   ├── ConfigBanner.jsx        # Guides setup if credentials are placeholder
│   │   ├── ConfirmModal.jsx        # Confirmation dialog for deletes
│   │   ├── Footer.jsx              # Eco Club public footer
│   │   ├── HouseBadge.jsx          # Color-coded badge for 4 houses
│   │   ├── LoadingSkeleton.jsx     # Card & table loading animations
│   │   ├── Navbar.jsx              # Public header & navigation
│   │   └── ProtectedRoute.jsx      # Role & session authentication guard
│   ├── context/
│   │   ├── AuthContext.jsx         # Supabase session, role, and student record
│   │   └── ToastContext.jsx        # Animated toast notifications
│   ├── layouts/
│   │   ├── AdminLayout.jsx         # Admin sidebar, top bar & navigation
│   │   ├── PublicLayout.jsx        # Landing page layout
│   │   └── StudentLayout.jsx       # Student dashboard layout with house badge
│   ├── lib/
│   │   └── supabase.js             # Supabase client initialization & helper
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── ActivitiesPage.jsx   # Create/Edit/Delete activities & max marks
│   │   │   ├── AdminDashboard.jsx   # Metrics cards & 4 Recharts charts
│   │   │   ├── AdminProfilePage.jsx # Admin account & password change
│   │   │   ├── BulkImportPage.jsx   # CSV/Excel upload & duplicate validation
│   │   │   ├── HousesPage.jsx       # Manage house identities & review metrics
│   │   │   ├── MarksPage.jsx        # Enter & audit weekly activity marks
│   │   │   ├── RankingsPage.jsx     # Dynamic 1st-4th podium & matric standings
│   │   │   ├── ReportsPage.jsx      # Dynamic report generation & CSV/Excel export
│   │   │   └── StudentsPage.jsx     # Student directory, search & CRUD modals
│   │   ├── auth/
│   │   │   └── LoginPage.jsx        # Role-based login for Admin & Student
│   │   ├── student/
│   │   │   ├── StudentActivitiesPage.jsx # Club drives & participation status
│   │   │   ├── StudentDashboard.jsx      # Student welcome, charts, & house rank
│   │   │   ├── StudentMarksPage.jsx      # Personal marks breakdown & remarks
│   │   │   └── StudentProfilePage.jsx    # House credentials & contact info
│   │   ├── HomePage.jsx             # Public landing page with 4 house pillars
│   │   └── LeaderboardPage.jsx      # Public/student interactive leaderboard
│   ├── services/
│   │   └── api.js                  # Centralized Supabase database queries
│   ├── App.css
│   ├── App.jsx                     # Route definitions & guards
│   ├── index.css                   # Tailwind CSS styling & animations
│   └── main.jsx                    # React DOM entry
├── supabase/
│   └── schema.sql                  # PostgreSQL tables, constraints, RLS & seed
├── .env.example                    # Environment variable template
├── index.html                      # HTML entry with Plus Jakarta Sans font
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json                     # SPA client-side routing rewrites
└── vite.config.js                  # Optimized manual chunks for Vercel
```

---

## 3. SUPABASE DATABASE SETUP

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/).
2. Click **New Project**, choose your organization, and name your database (e.g., `ecoclub-db`).
3. Set a strong database password and select a region closest to your users.

### Step 2: Run the Database Schema
1. In your Supabase dashboard, open the **SQL Editor** from the left navigation.
2. Open the file `supabase/schema.sql` located in this repository.
3. Copy the entire contents, paste it into the Supabase SQL Editor, and click **Run**.
4. This script automatically:
   - Enables UUID and Crypto extensions
   - Creates tables: `houses`, `users`, `students`, `activities`, `weekly_marks`
   - Configures foreign keys, cascading deletes, and unique constraints
   - Sets up indexes on roll numbers, house IDs, and week numbers
   - Configures the `is_admin()` and `get_current_student_id()` security functions
   - Enables Row Level Security (RLS) on all tables with explicit read/write policies
   - Inserts the initial seed data for the 4 houses (**GREEN**, **BLUE**, **RED**, **YELLOW**)

---

## 4. DEFAULT ADMIN CREATION INSTRUCTIONS

The default credentials for the administrator portal are:
- **Default Email**: `admin@ecoclub.org`
- **Default Password**: `sxcce1234`

Follow these steps to provision this default administrator in your Supabase project:

### Step 1: Create the User in Supabase Authentication
1. Go to your Supabase project dashboard and select **Authentication** > **Users**.
2. Click **Add User** > **Create User**.
3. Enter:
   - **Email**: `admin@ecoclub.org`
   - **Password**: `sxcce1234`
4. Toggle **Auto Confirm User?** to **ON** (or confirm via email).
5. Click **Create User**.
6. Copy the generated **User UID** (a UUID string such as `b6c1e95b-381f-4efc-8bb2-3112c22299d1`).

### Step 2: Insert the Admin Profile Record
1. In your Supabase dashboard, open the **SQL Editor**.
2. Run the following SQL query, replacing `<PASTE-USER-UID-HERE>` with the UID copied in step 1:

```sql
INSERT INTO public.users (id, name, email, role)
VALUES (
    '<PASTE-USER-UID-HERE>',
    'Chief Environmental Officer',
    'admin@ecoclub.org',
    'ADMIN'
);
```

3. Your administrator account is now active! You can now log into the web application at `/login` with `admin@ecoclub.org` and password `sxcce1234`.

---

## 5. CREATING STUDENT USERS & PASSWORD MANAGEMENT

Students log in using their **Roll Number** (not email) and the default password:
- **Student Username**: Student Roll Number (e.g. `502433` or `23CS042`)
- **Default Password**: `stud@sxcce`

### How Student Onboarding & Login Works:
1. **Registered by Admin**:
   - An administrator adds a student at `/admin/students` or bulk-imports student lists at `/admin/students/import` (assigning Roll Number, Name, Department, Year, and House).
2. **Instant Student Login with Roll Number**:
   - Students go to `/login`, select **Student Portal**, and sign in using:
     - **Username**: Their College Roll Number (e.g. `502433`)
     - **Password**: `stud@sxcce`
   - The system automatically resolves their Roll Number, initializes their Supabase session, links their profile, and immediately opens the **Student Dashboard** with their allocated house color badge and statistics!

### 🔑 Student Forgot Password Feature (On Login Page):
If a student forgets their password:
1. On the login screen (`/login`), click **"Forgot Password?"**.
2. Enter the student's **College Roll Number** (e.g. `502433`) and click **"Find Student"**.
3. The system looks up the student, displaying their verified name, department, and House badge.
4. The student has two options:
   - **Option 1 (One-Click)**: Click **"Reset to Default (stud@sxcce)"** to instantly restore default access.
   - **Option 2 (Custom)**: Enter a new custom password and confirm it.
5. The login form automatically populates with the roll number and new password ready for sign in!

### 🔒 Reset Password in Student Portal (While Logged In):
When logged in to the student portal:
1. Navigate to **Reset Password** in the sidebar menu (or visit `/student/reset-password`).
2. Students can:
   - Set a new custom password (minimum 6 characters) with instant confirmation.
   - Click **"Reset to Default (stud@sxcce)"** to revert back to college default at any time.
3. Also accessible on the **My Profile** page (`/student/profile`).

### 📱 Personal Gmail & Phone Number Updates (First-Time Setup):
Every student can link and update their personal Gmail and contact phone number:
1. When a student logs in for the first time, a setup reminder appears on the **Student Dashboard** guiding them to link their personal Gmail.
2. In **My Profile** (`/student/profile`), the **Update Contact Information** card allows students to:
   - Enter their personal **Gmail address** (e.g. `yourname@gmail.com`).
   - Enter their active **contact phone / WhatsApp number**.
   - Click **Save Contact Info** to instantly update their verified details across the Eco Club system and the admin directory.

---

## 6. ENVIRONMENT VARIABLES

Create a `.env` file in the root of your project (copy from `.env.example`):

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

> **Where to find these keys:**
> In your Supabase Dashboard, navigate to **Project Settings** > **API**.
> - **Project URL** = `VITE_SUPABASE_URL`
> - **Project API Keys** -> `anon` `public` = `VITE_SUPABASE_ANON_KEY`
>
> ⚠️ **Security Warning**: NEVER use the `service_role` key in frontend `.env` files. Only use the public `anon` key. Row Level Security protects your database.

---

## 7. LOCAL SETUP COMMANDS

### Prerequisites
- Node.js 18+ installed

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Open browser
# Navigate to http://localhost:5173
```

To build for production locally:
```bash
npm run build
npm run preview
```

---

## 8. VERCEL DEPLOYMENT INSTRUCTIONS

The project is completely configured for Vercel with single-page app rewrites via `vercel.json`.

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete eco club house management system"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ecoclubfinal.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com/) and sign in.
   - Click **Add New** > **Project**.
   - Select your GitHub repository `ecoclubfinal`.
   - Framework Preset will automatically be detected as **Vite**.

3. **Configure Environment Variables in Vercel**:
   Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key

4. **Deploy**:
   - Click **Deploy**.
   - Vercel will run `npm run build` and publish your site with a live HTTPS URL (e.g. `https://ecoclubfinal.vercel.app`).

5. **Test Deployment**:
   - Verify that the home page loads.
   - Navigate to `/login` and test authentication.
   - Open `/admin` to verify dashboard charts and database operations.
   - Refresh on any sub-route (e.g. `/admin/students`, `/leaderboard`) to ensure client-side routing works without 404s.

---

## 9. TESTING CHECKLIST

| Test Case | Expected Outcome | Status |
| :--- | :--- | :--- |
| **Public Landing Page** (`/`) | Displays 4 houses, metrics, activities, and CTA buttons | ✅ Verified |
| **Leaderboard** (`/leaderboard`) | Shows house podium and student rankings with filters | ✅ Verified |
| **Unauthenticated Route Guard** | Accessing `/admin` or `/student` without login redirects to `/login` | ✅ Verified |
| **Role-Based Access Control** | Students accessing `/admin` are denied and redirected to `/student` | ✅ Verified |
| **Admin Dashboard** (`/admin`) | Cards and Recharts load real aggregated data from Supabase | ✅ Verified |
| **Student Management** (`/admin/students`) | Search, filter, Add, Edit, and Delete students with confirmation | ✅ Verified |
| **Bulk Import** (`/admin/students/import`) | Validates columns, parses CSV/XLSX, flags duplicates, imports to Supabase | ✅ Verified |
| **House Management** (`/admin/houses`) | Displays 4 houses with dynamic scores; edits house info | ✅ Verified |
| **Activities** (`/admin/activities`) | Schedules environmental drives and sets maximum marks | ✅ Verified |
| **Weekly Marks** (`/admin/marks`) | Logs student marks with activity max-mark validation and remarks | ✅ Verified |
| **House Rankings** (`/admin/rankings`) | Dynamically calculates 1st, 2nd, 3rd, and 4th place with confetti | ✅ Verified |
| **Reports** (`/admin/reports`) | Generates live reports and exports to CSV and Excel (`.xlsx`) | ✅ Verified |
| **Student Dashboard** (`/student`) | Shows personal house badge, weekly performance trend & activity marks | ✅ Verified |
| **Student Profile** (`/student/profile`) | Displays immutable house details; permits phone update | ✅ Verified |
| **Student Reset Password** (`/student/reset-password`) | In-portal password change & one-click reset to `stud@sxcce` | ✅ Verified |
| **Forgot Password Recovery** (`/login`) | Roll number lookup modal with instant default reset or custom password | ✅ Verified |
| **Production Build** | `npm run build` succeeds cleanly with code splitting | ✅ Verified |
| **Vercel Routing** | `vercel.json` rewrites all paths to `index.html` without 404 errors | ✅ Verified |
#   E c o  
 