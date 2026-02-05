import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth';

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const users = await db.collection('users')
      .find({})
      .project({ password: 0 }) // Exclude password from response
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { email, password, role, assignedProjects } = await request.json();

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'project_user') {
      return NextResponse.json(
        { message: 'Role must be either "admin" or "project_user"' },
        { status: 400 }
      );
    }

    if (role === 'project_user' && (!assignedProjects || assignedProjects.length === 0)) {
      return NextResponse.json(
        { message: 'Project users must have at least one assigned project' },
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

    // Create user
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      role,
      assignedProjects: role === 'project_user' ? assignedProjects : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { userId, email, password, role, assignedProjects } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (role && role !== 'admin' && role !== 'project_user') {
      return NextResponse.json(
        { message: 'Role must be either "admin" or "project_user"' },
        { status: 400 }
      );
    }

    if (role === 'project_user' && (!assignedProjects || assignedProjects.length === 0)) {
      return NextResponse.json(
        { message: 'Project users must have at least one assigned project' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Build update object
    const updateDoc: any = {
      updatedAt: new Date(),
    };

    if (email) updateDoc.email = email;
    if (role) {
      updateDoc.role = role;
      updateDoc.assignedProjects = role === 'project_user' ? (assignedProjects || []) : [];
    } else if (assignedProjects) {
      updateDoc.assignedProjects = assignedProjects;
    }

    if (password) {
      updateDoc.password = await hash(password, 12);
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Prevent deleting yourself
    if (userId === user.userId) {
      return NextResponse.json(
        { message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
