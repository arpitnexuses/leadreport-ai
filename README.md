# Lead Report AI

A comprehensive lead management and report generation system powered by AI with project-based access control.

## Features

### Core Features
- 🤖 AI-powered lead report generation using Apollo.io data
- 📊 Comprehensive dashboard with analytics
- 📈 Lead pipeline management
- 🎯 Project-based organization
- 📄 Professional PDF report generation
- 🔗 Shareable report links

### User Management & Access Control ⭐ NEW
- 👥 Role-based access control (Admin & Project User)
- 🔒 Project-specific permissions
- 🛡️ Secure authentication with JWT
- 📋 User management interface for admins
- 🎫 Granular access to reports and projects

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Apollo.io API key
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd leadreport-ai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
APOLLO_API_KEY=your_apollo_api_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret_key
```

4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## User Management System

The application now includes a comprehensive user management system that allows administrators to create users with project-specific access.

### User Roles

1. **Admin** - Full access to:
   - All projects and reports
   - User management
   - All dashboard features

2. **Project User** - Limited access to:
   - Only assigned projects
   - Reports for their assigned projects
   - Cannot access user management

### Quick Start for Admins

1. **First User**: The first user to sign up is automatically an admin
2. **Access User Management**: Click the "Users" tab in the sidebar (admin only)
3. **Create Project Users**: 
   - Click "Add User"
   - Enter email and password
   - Select "Project User" role
   - Assign specific projects
4. **Manage Permissions**: Edit or delete users as needed

For detailed documentation, see [USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md)

## Project Structure

```
leadreport-ai/
├── app/
│   ├── actions.ts              # Server actions with access control
│   ├── api/
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── logout/
│   │   │   └── me/            # Current user info
│   │   ├── users/             # User management API (NEW)
│   │   ├── reports/           # Report endpoints
│   │   └── form-options/      # Project options API
│   ├── page.tsx               # Main dashboard
│   └── ...
├── components/
│   ├── dashboard/
│   │   ├── UserManagement.tsx # User management UI (NEW)
│   │   ├── Sidebar.tsx        # Updated with Users tab
│   │   └── ...
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── auth.ts                # Authentication helpers (NEW)
│   ├── mongodb.ts             # Database connection
│   └── ...
├── types/
│   └── dashboard.ts           # TypeScript definitions
└── USER_MANAGEMENT_GUIDE.md   # Detailed user management docs
```

## Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **Authentication**: JWT with bcryptjs
- **AI**: OpenAI GPT models
- **Data Source**: Apollo.io API
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Security Features

- 🔐 Password hashing with bcryptjs
- 🎫 JWT-based authentication
- 🛡️ Role-based access control
- ✅ Server-side permission validation
- 🚫 Self-deletion protection
- 🔒 HTTP-only cookies for token storage

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### User Management (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user
- `DELETE /api/users?userId=<id>` - Delete user

### Reports
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report by ID
- `GET /api/reports/[id]/status` - Check report status

## Development

This project uses:
- [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to optimize and load Geist font
- Server Actions for form submissions
- MongoDB for data persistence
- Real-time status polling for report generation

## Learn More

To learn more about Next.js and the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Apollo.io API](https://www.apollo.io/api/)
- [OpenAI API](https://platform.openai.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your License Here]

## Support

For issues related to:
- **User Management**: See [USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md)
- **General Issues**: Check the documentation or create an issue
