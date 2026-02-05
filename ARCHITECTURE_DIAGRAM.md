# User Management System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Lead Report AI Application                   │
│                   with Project-Based Access Control              │
└─────────────────────────────────────────────────────────────────┘
```

## User Roles & Access Levels

```
                    ┌───────────────┐
                    │     Users     │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐      ┌──────▼────────┐
        │     Admin      │      │ Project User  │
        │  (Full Access) │      │ (Limited)     │
        └───────┬────────┘      └──────┬────────┘
                │                      │
        ┌───────▼────────────┐  ┌──────▼────────────────┐
        │ • All Projects     │  │ • Assigned Projects   │
        │ • All Reports      │  │   Only                │
        │ • User Management  │  │ • Cannot manage users │
        │ • Full Dashboard   │  │ • Filtered Dashboard  │
        └────────────────────┘  └───────────────────────┘
```

## Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Login (email, password)
     ▼
┌────────────────┐
│ /api/auth/login│
└────┬───────────┘
     │
     │ 2. Verify credentials
     │    Hash comparison
     ▼
┌────────────────┐
│   MongoDB      │
│ users.findOne  │
└────┬───────────┘
     │
     │ 3. Found & valid
     ▼
┌────────────────┐
│  Create JWT    │
│  {userId,      │
│   email,       │
│   role,        │
│   assigned     │
│   Projects}    │
└────┬───────────┘
     │
     │ 4. Set HTTP-only cookie
     ▼
┌────────────────┐
│   Response     │
│  + cookie      │
└────────────────┘
```

## Authorization Flow (Viewing Reports)

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Request reports
     ▼
┌────────────────┐
│ getReports()   │
└────┬───────────┘
     │
     │ 2. Extract user from cookie
     ▼
┌────────────────┐
│getCurrentUser()│
└────┬───────────┘
     │
     │ 3. Check role
     ▼
     ┌─────────┐
     │  Role?  │
     └────┬────┘
          │
     ┌────┴─────┐
     │          │
     ▼          ▼
  Admin    Project User
     │          │
     │          │ 4a. Filter by
     │          │     assignedProjects
     │          ▼
     │    ┌──────────────┐
     │    │ reports.find │
     │    │ {project: {  │
     │    │  $in: [...]}}│
     │    └──────┬───────┘
     │           │
     │ 4b. Get all reports
     ▼           ▼
┌────────────────────────┐
│   Filtered Reports     │
└────────────────────────┘
```

## Report Creation Flow with Validation

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Create report for "Project Alpha"
     ▼
┌────────────────────┐
│ initiateReport()   │
└────┬───────────────┘
     │
     │ 2. Extract user
     ▼
┌────────────────────┐
│ getCurrentUser()   │
│ {role: 'project_  │
│  user',            │
│  assignedProjects: │
│  ['Beta', 'Gamma']}│
└────┬───────────────┘
     │
     │ 3. Check permission
     ▼
┌────────────────────────────────┐
│ canAccessProject(user, 'Alpha')│
└────┬──────────────────────┬────┘
     │                      │
     │ NO                   │ YES
     ▼                      ▼
┌─────────────┐      ┌─────────────┐
│ Throw Error │      │ Create      │
│ "No access" │      │ Report      │
└─────────────┘      └─────────────┘
```

## User Management Interface Flow

```
┌──────────────┐
│ Admin User   │
└──────┬───────┘
       │
       │ 1. Open Users tab
       ▼
┌──────────────────┐
│ UserManagement   │
│ Component        │
└──────┬───────────┘
       │
       │ 2. Click "Add User"
       ▼
┌──────────────────────────┐
│ Dialog Form              │
│ • Email                  │
│ • Password               │
│ • Role                   │
│ • Assigned Projects      │
│   ☑ Project Alpha        │
│   ☐ Project Beta         │
│   ☑ Project Gamma        │
└──────┬───────────────────┘
       │
       │ 3. Submit
       ▼
┌──────────────────┐
│ POST /api/users  │
└──────┬───────────┘
       │
       │ 4. Validate
       │    • Email unique?
       │    • Password strong?
       │    • Projects selected?
       ▼
┌──────────────────┐
│ Create in DB     │
│ {email,          │
│  password: hash, │
│  role,           │
│  assignedProjects│
│ }                │
└──────┬───────────┘
       │
       │ 5. Success
       ▼
┌──────────────────┐
│ Refresh list     │
│ Show new user    │
└──────────────────┘
```

## Database Schema Relationships

```
┌──────────────────────────────────────┐
│           MongoDB Database            │
├──────────────────────────────────────┤
│                                       │
│  ┌────────────────┐                  │
│  │ users          │                  │
│  ├────────────────┤                  │
│  │ _id            │◄────┐           │
│  │ email          │     │           │
│  │ password       │     │           │
│  │ role           │     │ Reference │
│  │ assignedProjects│    │ (via JWT) │
│  │ createdAt      │     │           │
│  │ updatedAt      │     │           │
│  └────────────────┘     │           │
│                         │           │
│  ┌────────────────┐     │           │
│  │ reports        │     │           │
│  ├────────────────┤     │           │
│  │ _id            │     │           │
│  │ email          │     │           │
│  │ reportOwnerName│─────┘           │
│  │ apolloData     │                 │
│  │ leadData       │                 │
│  │   ├─ project   │◄─── Filtered    │
│  │   ├─ name      │     by          │
│  │   └─ company   │     assignedProjects
│  │ status         │                 │
│  │ createdAt      │                 │
│  └────────────────┘                 │
│                                      │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
┌──────────────────────────────────────────────────┐
│                   app/page.tsx                    │
│                  (Main Dashboard)                 │
├──────────────────────────────────────────────────┤
│  • Fetches user role via /api/auth/me           │
│  • Loads reports via getReports()                │
│  • Passes isAdmin prop to Sidebar                │
└───────────────┬──────────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌────────────┐   ┌───────────────────┐
│  Sidebar   │   │  Tab Content      │
├────────────┤   ├───────────────────┤
│ • Dashboard│   │ • DashboardView   │
│ • Generate │   │ • GenerateForm    │
│ • Pipeline │   │ • PipelineTable   │
│ • Settings │   │ • SettingsView    │
│ • Users*   │   │ • UserManagement* │
│   (admin   │   │   (admin only)    │
│    only)   │   │                   │
└────────────┘   └───────────────────┘

* Only visible/accessible to admins
```

## API Route Protection

```
                ┌──────────────┐
                │  API Request │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ getCurrentUser│
                │ from cookie   │
                └──────┬───────┘
                       │
                ┌──────▼───────┐
                │  User found? │
                └──────┬───────┘
                       │
                  YES ┌┴┐ NO
                   ┌──▼──────────┐
                   │ 401         │
                   │ Unauthorized│
                   └─────────────┘
                      │
                      ▼
                ┌─────────────┐
                │ Check route │
                │ requirements│
                └──────┬──────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    Requires Admin            No restriction
          │                         │
          ▼                         ▼
    ┌──────────┐              ┌──────────┐
    │user.role?│              │ Process  │
    └────┬─────┘              │ Request  │
         │                    └──────────┘
    ┌────┴────┐
admin│         │project_user
     ▼         ▼
┌─────────┐ ┌────────┐
│ Process │ │  403   │
│ Request │ │Forbidden
└─────────┘ └────────┘
```

## Security Layers

```
┌────────────────────────────────────────────┐
│           Security Architecture             │
├────────────────────────────────────────────┤
│                                             │
│  Layer 1: Authentication                   │
│  ┌──────────────────────────────────────┐ │
│  │ • JWT Token in HTTP-only cookie      │ │
│  │ • bcrypt password hashing (12 rounds)│ │
│  │ • 1-day token expiration             │ │
│  └──────────────────────────────────────┘ │
│                                             │
│  Layer 2: Authorization                    │
│  ┌──────────────────────────────────────┐ │
│  │ • Role-based access control          │ │
│  │ • Server-side permission checks      │ │
│  │ • Project access validation          │ │
│  └──────────────────────────────────────┘ │
│                                             │
│  Layer 3: Data Filtering                   │
│  ┌──────────────────────────────────────┐ │
│  │ • Query-level filtering              │ │
│  │ • Only accessible data returned      │ │
│  │ • No client-side data exposure       │ │
│  └──────────────────────────────────────┘ │
│                                             │
│  Layer 4: Input Validation                 │
│  ┌──────────────────────────────────────┐ │
│  │ • Required field validation          │ │
│  │ • Email format checking              │ │
│  │ • Project assignment validation      │ │
│  │ • Self-deletion prevention           │ │
│  └──────────────────────────────────────┘ │
│                                             │
└────────────────────────────────────────────┘
```

## Data Flow: Complete User Journey

```
1. ADMIN CREATES USER
   ┌─────┐     ┌──────┐     ┌────────┐
   │Admin│────▶│ Form │────▶│POST    │
   └─────┘     └──────┘     │/api/   │
                             │users   │
                             └───┬────┘
                                 │
                                 ▼
                          ┌────────────┐
                          │ MongoDB    │
                          │ Insert User│
                          └────────────┘

2. PROJECT USER LOGS IN
   ┌──────┐    ┌────────┐    ┌────────┐
   │User  │───▶│Login   │───▶│JWT     │
   │(Beta)│    │API     │    │Created │
   └──────┘    └────────┘    │{role:  │
                              │'project│
                              │_user', │
                              │assigned│
                              │Projects│
                              │:['Beta│
                              │']}     │
                              └────────┘

3. USER VIEWS DASHBOARD
   ┌──────────┐   ┌─────────┐   ┌──────────┐
   │Dashboard │──▶│getReports│──▶│Filter by │
   │Load      │   │()        │   │'Beta'    │
   └──────────┘   └─────────┘   └─────┬────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │Show only Beta  │
                              │reports         │
                              └────────────────┘

4. USER CREATES REPORT
   ┌──────┐   ┌──────────┐   ┌─────────┐
   │Form  │──▶│Validate  │──▶│Create   │
   │(Beta)│   │project   │   │Report   │
   └──────┘   │access    │   └─────────┘
              └─────┬────┘
                    │
              ┌─────▼──────┐
              │ ✓ User has │
              │   'Beta'   │
              │   access   │
              └────────────┘

5. USER TRIES UNAUTHORIZED PROJECT
   ┌──────┐   ┌──────────┐   ┌─────────┐
   │Form  │──▶│Validate  │──▶│Error:   │
   │(Alpha│   │project   │   │No access│
   └──────┘   │access    │   └─────────┘
              └─────┬────┘
                    │
              ┌─────▼──────┐
              │ ✗ User has │
              │   no 'Alpha│
              │   access   │
              └────────────┘
```

## Key Functions & Their Roles

```
┌──────────────────────────────────────────────┐
│         Authentication Functions              │
├──────────────────────────────────────────────┤
│                                               │
│  getCurrentUser()                            │
│  ├─ Extracts JWT from cookies                │
│  ├─ Verifies token validity                  │
│  └─ Returns user payload with role & projects│
│                                               │
│  canAccessProject(user, project)             │
│  ├─ Checks if admin (always true)            │
│  └─ Checks if project in assignedProjects    │
│                                               │
│  getAccessibleProjects(user, allProjects)    │
│  ├─ Returns all for admins                   │
│  └─ Filters to assignedProjects for users    │
│                                               │
└──────────────────────────────────────────────┘
```

## Summary: Access Control Matrix

```
╔═══════════════════════╦══════════╦═══════════════╗
║      Feature          ║  Admin   ║ Project User  ║
╠═══════════════════════╬══════════╬═══════════════╣
║ View all reports      ║    ✓     ║      ✗        ║
║ View assigned reports ║    ✓     ║      ✓        ║
║ Create any report     ║    ✓     ║      ✗        ║
║ Create assigned report║    ✓     ║      ✓        ║
║ Access Users tab      ║    ✓     ║      ✗        ║
║ Create users          ║    ✓     ║      ✗        ║
║ Edit users            ║    ✓     ║      ✗        ║
║ Delete users          ║    ✓     ║      ✗        ║
║ View all projects     ║    ✓     ║      ✗        ║
║ View assigned projects║    ✓     ║      ✓        ║
║ Dashboard (all)       ║    ✓     ║      ✗        ║
║ Dashboard (filtered)  ║    ✓     ║      ✓        ║
╚═══════════════════════╩══════════╩═══════════════╝
```

---

*This architecture provides a robust, secure, and scalable foundation for multi-tenant project management with granular access control.*
