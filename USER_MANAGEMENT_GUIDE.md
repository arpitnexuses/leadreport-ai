# User Management System - Project-Based Access Control

## Overview

The Lead Report AI application now includes a comprehensive user management system that allows administrators to create users with project-specific access. This enables organizations to restrict users to only view and create reports for specific projects.

## Features

### 1. **Role-Based Access Control (RBAC)**
   - **Admin Role**: Full access to all projects, reports, and user management
   - **Project User Role**: Limited access to only assigned projects

### 2. **Project-Specific Permissions**
   - Project users can only:
     - View reports for their assigned projects
     - Create new reports for their assigned projects
     - Access only the projects they're assigned to in the project dropdown

### 3. **User Management Interface**
   - Create new users with specific project assignments
   - Edit existing users and update their project access
   - Delete users (with protection against self-deletion)
   - View all users and their permissions in a table

## How to Use

### For Administrators

#### Accessing User Management
1. Log in as an admin user
2. Click on the **"Users"** tab in the sidebar (only visible to admins)
3. You'll see a list of all users and their permissions

#### Creating a New Project User
1. Click the **"Add User"** button
2. Fill in the form:
   - **Email**: User's email address
   - **Password**: Initial password for the user
   - **Role**: Select "Project User (Limited Access)"
   - **Assigned Projects**: Check the boxes for projects this user should access
3. Click **"Create"**

**Important**: Project users must have at least one assigned project.

#### Editing User Permissions
1. Click the edit icon (pencil) next to any user
2. Modify:
   - Email address
   - Password (leave blank to keep current password)
   - Role (change between Admin and Project User)
   - Assigned Projects (for Project Users)
3. Click **"Update"**

#### Deleting a User
1. Click the delete icon (trash) next to any user
2. Confirm the deletion
3. Note: You cannot delete your own account

### For Project Users

#### Login and Access
1. Use your credentials provided by the administrator
2. After login, you'll only see:
   - Reports for your assigned projects in the Dashboard
   - Only your assigned projects in the Pipeline view
   - Only your assigned projects in the project dropdown when creating reports

#### Creating Reports
1. Go to **"Generate Lead"** tab
2. The project dropdown will only show projects you have access to
3. Fill in the lead details and generate the report
4. If you try to create a report for a project you don't have access to, you'll receive an error

#### Viewing Reports
- Dashboard: Shows only analytics for your assigned projects
- Pipeline: Shows only leads from your assigned projects

## Technical Architecture

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed with bcryptjs),
  role: 'admin' | 'project_user',
  assignedProjects: [String], // Array of project names
  createdAt: Date,
  updatedAt: Date
}
```

### Authentication

#### JWT Token Structure
```javascript
{
  userId: String,
  email: String,
  role: 'admin' | 'project_user',
  assignedProjects: [String]
}
```

### API Endpoints

#### User Management (`/api/users`)
- **GET**: Retrieve all users (admin only)
- **POST**: Create new user (admin only)
- **PUT**: Update user (admin only)
- **DELETE**: Delete user (admin only)

#### Current User Info (`/api/auth/me`)
- **GET**: Get current user's role and permissions

#### Form Options (`/api/form-options`)
- **GET**: Get available projects (filtered by user role)

### Authorization Flow

1. **User logs in** → JWT token created with role and assignedProjects
2. **User accesses page** → Token verified, user info extracted
3. **User requests data** → Server filters based on role:
   - Admin: Returns all data
   - Project User: Returns only data for assigned projects
4. **User creates report** → Server validates project access before creation

### Key Files

#### Backend
- `/lib/auth.ts` - Authentication helpers and permission checks
- `/app/api/users/route.ts` - User CRUD operations
- `/app/api/auth/me/route.ts` - Current user info endpoint
- `/app/api/auth/login/route.ts` - Updated to include role in JWT
- `/app/api/auth/signup/route.ts` - Updated to include role field
- `/app/api/form-options/route.ts` - Filters projects by user access
- `/app/actions.ts` - Updated getReports and initiateReport with access control

#### Frontend
- `/components/dashboard/UserManagement.tsx` - User management interface
- `/components/dashboard/Sidebar.tsx` - Updated with conditional Users tab
- `/app/page.tsx` - Updated to check user role and pass to components
- `/types/dashboard.ts` - Updated with 'users' tab type

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds of 12
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Server-side validation of permissions
4. **Self-Deletion Protection**: Users cannot delete their own accounts
5. **Project Validation**: Server validates project access on every report creation

## Migration Guide

### For Existing Installations

1. **Update User Records**: Run a migration to add role and assignedProjects to existing users:
   ```javascript
   db.users.updateMany(
     { role: { $exists: false } },
     { 
       $set: { 
         role: 'admin',
         assignedProjects: [],
         updatedAt: new Date()
       }
     }
   )
   ```

2. **First Login**: All existing users are automatically set as admins

### Creating Your First Project User

1. Log in as admin
2. Ensure you have at least one project with reports
3. Go to Users tab
4. Create a project user and assign them to specific projects
5. Share credentials with the user

## Best Practices

1. **Project Naming**: Use consistent, descriptive project names
2. **User Onboarding**: Provide new users with:
   - Login credentials
   - List of their assigned projects
   - Link to this documentation
3. **Regular Audits**: Periodically review user permissions
4. **Password Policy**: Encourage users to change their initial password
5. **Least Privilege**: Only assign projects that users need to access

## Troubleshooting

### "You don't have permission to create reports for this project"
- **Cause**: Trying to create a report for a project not assigned to you
- **Solution**: Contact your administrator to request access

### "Unauthorized. Admin access required"
- **Cause**: Trying to access admin features as a project user
- **Solution**: These features are admin-only

### Users tab not visible
- **Cause**: You're logged in as a project user
- **Solution**: Only admins can see and manage users

### Cannot see any projects in dropdown
- **Cause**: No projects assigned to your account
- **Solution**: Contact your administrator to assign projects

## Future Enhancements

Potential additions to the user management system:
- [ ] Bulk user import via CSV
- [ ] Password reset functionality
- [ ] Email invitations for new users
- [ ] Activity logging and audit trails
- [ ] More granular permissions (read-only vs. read-write)
- [ ] User groups for easier management
- [ ] Two-factor authentication
- [ ] Session management and force logout

## Support

For issues or questions:
1. Check this documentation first
2. Contact your system administrator
3. Review the application logs for error details
