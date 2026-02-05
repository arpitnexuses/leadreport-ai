# Quick Setup Guide: User Management System

This guide will help you set up and start using the new user management system with project-based access control.

## 🚀 Quick Start (5 Minutes)

### Step 1: Migrate Existing Users (If Applicable)

If you have existing users in your database, run the migration script:

```bash
node scripts/migrate-users.js
```

This will:
- Add `role` field to all existing users (set to 'admin')
- Add `assignedProjects` field (empty array for admins)
- Display a summary of all users

**Note**: If this is a fresh installation, skip this step.

### Step 2: Log In as Admin

1. Open your application: `http://localhost:3000`
2. Log in with your existing credentials
3. You're automatically an admin if you're the first user or were migrated

### Step 3: Access User Management

1. Look for the **"Users"** tab in the left sidebar
2. If you see it, you're logged in as an admin ✅
3. If you don't see it, you're a project user

### Step 4: Create Your First Project User

1. Click the **"Users"** tab
2. Click **"Add User"** button
3. Fill in the form:
   ```
   Email: user@example.com
   Password: SecurePassword123!
   Role: Project User (Limited Access)
   Assigned Projects: ✓ Project Alpha
                     ✓ Project Beta
   ```
4. Click **"Create"**

### Step 5: Test the New User

1. Log out (bottom of sidebar)
2. Log in with the new user credentials
3. Notice:
   - ✅ Only assigned projects appear in dashboard
   - ✅ Only assigned projects in project dropdown
   - ❌ No "Users" tab visible
   - ❌ Cannot create reports for other projects

## 📋 Verification Checklist

After setup, verify everything works:

- [ ] Migration completed (if applicable)
- [ ] Admin can access Users tab
- [ ] Admin can create new users
- [ ] Admin can edit existing users
- [ ] Admin can delete users (except themselves)
- [ ] Project users only see their assigned projects
- [ ] Project users cannot access Users tab
- [ ] Project users cannot create reports for unassigned projects

## 🎯 Common Scenarios

### Scenario 1: Give User Access to Multiple Projects

```
Role: Project User
Assigned Projects: ✓ Project A
                  ✓ Project B
                  ✓ Project C
```

User can view and create reports for Projects A, B, and C only.

### Scenario 2: Promote User to Admin

1. Edit the user
2. Change role from "Project User" to "Admin"
3. Save
4. User now has full access (assigned projects ignored)

### Scenario 3: Restrict Admin to Specific Projects

1. Edit the user
2. Change role from "Admin" to "Project User"
3. Select specific projects
4. Save
5. User now has limited access

## 🔍 Troubleshooting

### Issue: "Users tab not showing"

**Solution**: You're logged in as a Project User. Only admins can manage users.

### Issue: "Cannot create user - must have at least one assigned project"

**Solution**: Project Users must have at least one project assigned. Either:
- Select at least one project, OR
- Change role to Admin

### Issue: "Cannot delete user"

**Possible Causes**:
1. Trying to delete yourself → Not allowed for safety
2. Not logged in as admin → Only admins can delete users

### Issue: Migration script fails

**Solution**:
1. Check MONGODB_URI in `.env.local`
2. Ensure MongoDB is running
3. Check network connectivity
4. Verify you have write permissions to the database

### Issue: "No projects available" when creating user

**Solution**: 
1. Create some reports first
2. Make sure reports have project names (not "Unassigned")
3. Refresh the Users page

## 📊 Understanding Access Control

### Admin vs Project User

| Feature | Admin | Project User |
|---------|-------|--------------|
| View all reports | ✅ | ❌ (only assigned) |
| Create reports for any project | ✅ | ❌ (only assigned) |
| Access Users tab | ✅ | ❌ |
| Manage other users | ✅ | ❌ |
| View all dashboard analytics | ✅ | ❌ (only assigned) |
| Access Settings | ✅ | ✅ |

### Project Assignment Flow

```
Admin creates Project User
        ↓
Assigns Projects: ["Alpha", "Beta"]
        ↓
User logs in
        ↓
System filters everything by assigned projects
        ↓
User only sees:
  - Reports from Alpha & Beta
  - Alpha & Beta in dropdowns
  - Analytics for Alpha & Beta
```

## 🎓 Best Practices

1. **Start with one test user** to ensure everything works
2. **Use strong passwords** for all users
3. **Review permissions regularly** - edit users as needs change
4. **Document your project structure** for easier management
5. **Don't overassign** - only give access to needed projects
6. **Regular audits** - check who has access to what

## 🆘 Need More Help?

- Full documentation: [USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md)
- Project README: [README.md](./README.md)
- Check application logs for detailed error messages

## ✅ You're All Set!

Your user management system is now configured. You can:

1. Create users with specific project access
2. Manage permissions easily
3. Control who sees what reports
4. Maintain security with role-based access

Happy user managing! 🎉
