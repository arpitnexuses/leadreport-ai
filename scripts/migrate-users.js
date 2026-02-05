/**
 * Migration Script: Add role and assignedProjects to existing users
 * 
 * This script updates all existing user records in the database to include
 * the new role and assignedProjects fields required by the user management system.
 * 
 * Usage:
 *   node scripts/migrate-users.js
 * 
 * Requirements:
 *   - MongoDB connection string in .env.local (MONGODB_URI)
 *   - Node.js with mongodb package installed
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  console.error('Please ensure .env.local exists with MONGODB_URI defined');
  process.exit(1);
}

async function migrateUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully');

    const db = client.db('lead-reports');
    const usersCollection = db.collection('users');

    // Find users without role field
    const usersToUpdate = await usersCollection.find({
      role: { $exists: false }
    }).toArray();

    if (usersToUpdate.length === 0) {
      console.log('✨ No users need migration. All users already have role field.');
      return;
    }

    console.log(`\n📊 Found ${usersToUpdate.length} user(s) to migrate:`);
    usersToUpdate.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email}`);
    });

    console.log('\n🔄 Starting migration...');

    // Update all users without role to be admins
    const result = await usersCollection.updateMany(
      { role: { $exists: false } },
      {
        $set: {
          role: 'admin',
          assignedProjects: [],
          updatedAt: new Date()
        }
      }
    );

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   - Matched: ${result.matchedCount} user(s)`);
    console.log(`   - Modified: ${result.modifiedCount} user(s)`);
    console.log(`   - All migrated users are now admins`);

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const usersWithoutRole = await usersCollection.countDocuments({
      role: { $exists: false }
    });

    if (usersWithoutRole === 0) {
      console.log('✅ Verification successful: All users now have role field');
    } else {
      console.warn(`⚠️  Warning: ${usersWithoutRole} user(s) still missing role field`);
    }

    // Display summary of all users
    console.log('\n📋 User Summary:');
    const allUsers = await usersCollection.find({}, {
      projection: { password: 0 }
    }).toArray();

    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Assigned Projects: ${user.assignedProjects?.length || 0} project(s)`);
      if (user.assignedProjects?.length > 0) {
        console.log(`     Projects: ${user.assignedProjects.join(', ')}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration
console.log('🚀 User Migration Script');
console.log('========================\n');

migrateUsers()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
