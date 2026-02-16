import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface UserPayload {
  userId: string;
  email: string;
  role: 'admin' | 'project_user' | 'client';
  assignedProjects?: string[];
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as UserPayload;

    return decoded;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): UserPayload | null {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as UserPayload;

    return decoded;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

export function canAccessProject(user: UserPayload, project: string): boolean {
  // Admins can access all projects
  if (user.role === 'admin') {
    return true;
  }

  // Project users and clients can only access their assigned projects
  if (user.role === 'project_user' || user.role === 'client') {
    return user.assignedProjects?.includes(project) || false;
  }

  return false;
}

export function getAccessibleProjects(user: UserPayload, allProjects: string[]): string[] {
  // Admins can access all projects
  if (user.role === 'admin') {
    return allProjects;
  }

  // Project users and clients can only access their assigned projects
  if (user.role === 'project_user' || user.role === 'client') {
    return allProjects.filter(project => user.assignedProjects?.includes(project));
  }

  return [];
}
