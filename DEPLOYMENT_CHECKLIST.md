# Deployment Checklist: User Management System

Use this checklist when deploying the user management system to production.

## Pre-Deployment

### 1. Environment Variables
- [ ] `MONGODB_URI` is set correctly
- [ ] `JWT_SECRET` is set to a strong, random secret (minimum 32 characters)
- [ ] `APOLLO_API_KEY` is configured
- [ ] `OPENAI_API_KEY` is configured
- [ ] `NODE_ENV` is set to `production`

### 2. Database Preparation
- [ ] MongoDB instance is accessible
- [ ] Database backup created (if existing data)
- [ ] Database connection tested
- [ ] Sufficient storage available

### 3. Code Review
- [ ] All new files committed to repository
- [ ] No debug console.logs in production code
- [ ] No hardcoded credentials
- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript compilation successful (`npm run build`)

### 4. Documentation
- [ ] README.md updated
- [ ] USER_MANAGEMENT_GUIDE.md available
- [ ] SETUP_USER_MANAGEMENT.md available
- [ ] ARCHITECTURE_DIAGRAM.md available
- [ ] IMPLEMENTATION_SUMMARY.md available

## Deployment Steps

### Step 1: Deploy Code
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build for production
npm run build

# Or deploy to Vercel
vercel --prod
```
- [ ] Code deployed successfully
- [ ] No build errors
- [ ] Environment variables configured on hosting platform

### Step 2: Database Migration (if existing users)
```bash
# Run migration script
node scripts/migrate-users.js
```
- [ ] Migration script executed successfully
- [ ] All existing users now have `role` field
- [ ] All existing users have `assignedProjects` field
- [ ] Verification passed (no users without role)

### Step 3: Verify Deployment
- [ ] Application loads without errors
- [ ] Login page accessible
- [ ] Existing users can log in
- [ ] Dashboard loads correctly

## Post-Deployment Testing

### Admin User Tests
- [ ] Log in as admin user
- [ ] Users tab is visible in sidebar
- [ ] Can access Users page
- [ ] Can view all existing users
- [ ] User list displays correctly with roles

### Create First Project User
- [ ] Click "Add User" button
- [ ] Form opens successfully
- [ ] Project dropdown shows available projects
- [ ] Can select multiple projects
- [ ] Can create user with "Project User" role
- [ ] Success message appears
- [ ] New user appears in list

### Test Project User Login
- [ ] Log out as admin
- [ ] Log in with new project user credentials
- [ ] Dashboard loads with filtered data
- [ ] Only assigned projects visible
- [ ] Users tab NOT visible
- [ ] Can view reports for assigned projects only

### Test Report Creation
**As Admin:**
- [ ] Can create report for any project
- [ ] Project dropdown shows all projects
- [ ] Report creates successfully

**As Project User:**
- [ ] Project dropdown shows only assigned projects
- [ ] Can create report for assigned project
- [ ] Report creates successfully
- [ ] Cannot manually create report for unassigned project (API rejects)

### Test User Management (Admin)
- [ ] Can edit user (change email)
- [ ] Can update user role (Admin ↔ Project User)
- [ ] Can add/remove assigned projects
- [ ] Can delete other users
- [ ] Cannot delete own account (protected)

### Security Tests
- [ ] Project user cannot access `/api/users` directly
- [ ] Project user cannot see unassigned projects in API responses
- [ ] JWT token includes role and assignedProjects
- [ ] HTTP-only cookie is set
- [ ] Cannot create report for unassigned project via API

## Performance Checks

- [ ] Page load times acceptable (< 3 seconds)
- [ ] User list loads quickly even with many users
- [ ] Project filtering doesn't cause lag
- [ ] Database queries are optimized

## Recommended Database Indexes

Run these commands in MongoDB to optimize performance:

```javascript
// In MongoDB shell or Compass
use lead-reports

// Index on users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Index on reports collection
db.reports.createIndex({ "leadData.project": 1 })
db.reports.createIndex({ createdAt: -1 })
db.reports.createIndex({ email: 1 })
```

- [ ] Email index created (unique)
- [ ] Role index created
- [ ] Project index created
- [ ] CreatedAt index created

## Security Hardening

### JWT Configuration
- [ ] JWT_SECRET is strong and random
- [ ] Token expiration is appropriate (1 day default)
- [ ] Tokens stored in HTTP-only cookies
- [ ] Secure flag enabled in production

### Password Security
- [ ] bcryptjs salt rounds = 12 (configured)
- [ ] No plain text passwords stored
- [ ] Password hashing working correctly

### API Security
- [ ] All admin endpoints check user role
- [ ] All user endpoints check authentication
- [ ] CORS configured correctly
- [ ] Rate limiting considered (if applicable)

## Monitoring Setup

- [ ] Error logging configured
- [ ] User activity logging (optional)
- [ ] Database monitoring enabled
- [ ] Performance monitoring setup
- [ ] Alerts configured for errors

## Documentation for Team

- [ ] Admin training completed
- [ ] User guide distributed
- [ ] Support contact information shared
- [ ] Escalation process defined

## Rollback Plan

In case of issues, document rollback steps:

### Rollback Code
```bash
# Revert to previous version
git revert <commit-hash>
git push origin main

# Or redeploy previous version
vercel --prod --force
```

### Rollback Database
```bash
# Restore from backup
mongorestore --uri="your_mongodb_uri" ./backup
```

- [ ] Rollback plan documented
- [ ] Team knows how to execute rollback
- [ ] Backup accessible

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error logs hourly
- [ ] Check user login success rate
- [ ] Verify no authentication issues
- [ ] Watch for performance degradation

### First Week
- [ ] Review user feedback
- [ ] Check for any permission issues
- [ ] Monitor database performance
- [ ] Verify report creation working correctly

### First Month
- [ ] Analyze usage patterns
- [ ] Review security logs
- [ ] Optimize if needed
- [ ] Gather admin feedback on user management

## Common Issues & Solutions

### Issue: Users can't log in after deployment
**Solution:** 
1. Check JWT_SECRET matches between build and runtime
2. Verify MongoDB connection
3. Check cookie settings (secure flag in production)

### Issue: Migration script fails
**Solution:**
1. Check MongoDB connection string
2. Verify database permissions
3. Ensure network connectivity
4. Check for existing role fields

### Issue: Users tab not showing
**Solution:**
1. Verify user has admin role in database
2. Check JWT token includes role field
3. Clear browser cookies and re-login

### Issue: Project user sees all reports
**Solution:**
1. Verify assignedProjects in database
2. Check JWT token includes assignedProjects
3. Ensure getReports() has filtering logic
4. Clear cache and reload

## Success Criteria

Deployment is successful when:

- ✅ All existing users can log in
- ✅ Admins can access Users tab
- ✅ New project users can be created
- ✅ Project users only see assigned data
- ✅ Report creation works for both roles
- ✅ No console errors on any page
- ✅ Performance is acceptable
- ✅ Security tests pass

## Final Sign-Off

Before marking deployment complete:

- [ ] Technical lead approval
- [ ] Admin tested and approved
- [ ] Test project user created and verified
- [ ] Documentation accessible to team
- [ ] Support team briefed
- [ ] Monitoring active

## Deployment Date

**Deployed by:** ___________________  
**Date:** ___________________  
**Version:** ___________________  
**Status:** [ ] Successful [ ] Issues [ ] Rolled back  

## Notes

```
Add any deployment-specific notes here:
- 
- 
- 
```

---

## Need Help?

- Review: `SETUP_USER_MANAGEMENT.md`
- Detailed guide: `USER_MANAGEMENT_GUIDE.md`
- Architecture: `ARCHITECTURE_DIAGRAM.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`

## Next Steps After Deployment

1. **User Onboarding**
   - Create project users as needed
   - Assign appropriate projects
   - Distribute credentials securely

2. **Training**
   - Train admins on user management
   - Train users on their limited access
   - Provide documentation links

3. **Optimization**
   - Monitor performance
   - Add indexes if queries are slow
   - Consider caching for large user bases

4. **Feedback Collection**
   - Gather admin feedback on interface
   - Collect user feedback on access
   - Note feature requests for future

---

**Remember:** Test thoroughly in a staging environment before production deployment!
