/**
 * Quick script to check and fix user roles
 * Run this to make your current user an admin
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env.local file
let MONGODB_URI = process.env.MONGODB_URI;

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('MONGODB_URI=')) {
      MONGODB_URI = line.substring('MONGODB_URI='.length).trim();
      break;
    }
  }
} catch (err) {
  console.log('Note: Could not read .env.local, using environment variable');
}

async function checkUsers() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('lead-reports');
    const usersCollection = db.collection('users');

    // Get all users
    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();

    if (users.length === 0) {
      console.log('⚠️  No users found. Please sign up first at http://localhost:3000/signup');
      return;
    }

    console.log(`Found ${users.length} user(s):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role || '❌ MISSING'}`);
      console.log(`   Assigned Projects: ${user.assignedProjects ? JSON.stringify(user.assignedProjects) : '❌ MISSING'}`);
      console.log('');
    });

    // Check if any users are missing role
    const usersWithoutRole = users.filter(u => !u.role);

    if (usersWithoutRole.length > 0) {
      console.log(`\n⚠️  ${usersWithoutRole.length} user(s) missing role field!`);
      console.log('Would you like to make them all admins? (This script will do it automatically)\n');

      // Update all users without role to admin
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

      console.log(`✅ Updated ${result.modifiedCount} user(s) to admin role`);
      
      // Show updated users
      console.log('\nUpdated user list:');
      const updatedUsers = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
      updatedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - Role: ${user.role}`);
      });
    } else {
      console.log('✅ All users have roles assigned!');
      
      const admins = users.filter(u => u.role === 'admin');
      console.log(`\n👑 ${admins.length} admin(s):`);
      admins.forEach(u => console.log(`   - ${u.email}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

console.log('🔍 Checking user roles...\n');
checkUsers();
