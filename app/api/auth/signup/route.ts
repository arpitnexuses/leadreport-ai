import { NextResponse } from 'next/server';
// import clientPromise from '@/lib/mongodb';
// import { hash } from 'bcryptjs';

/**
 * PUBLIC SIGNUP DISABLED
 * 
 * Public user registration has been disabled for security.
 * New users must be created by administrators through the User Management interface.
 * 
 * To re-enable public signup, uncomment the code below and the imports above.
 */

export async function POST(req: Request) {
  return NextResponse.json(
    { 
      message: 'Public signup is disabled. Please contact your administrator to create an account.',
      disabled: true
    },
    { status: 403 }
  );

  // ORIGINAL CODE (DISABLED) - Uncomment to re-enable public signup
  /*
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user - first user is admin, rest are admins by default
    // (can be changed through user management)
    const userCount = await db.collection('users').countDocuments();
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      role: userCount === 0 ? 'admin' : 'admin', // First user is always admin
      assignedProjects: [], // Empty for admins, will be set for project_users
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
  */
} 