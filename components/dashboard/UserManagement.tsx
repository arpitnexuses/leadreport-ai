"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit2, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface User {
  _id: string;
  email: string;
  role: 'admin' | 'project_user' | 'client';
  assignedProjects: string[];
  createdAt: string;
}

interface UserManagementProps {
  availableProjects: string[];
}

export function UserManagement({ availableProjects }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'project_user' as 'admin' | 'project_user' | 'client',
    assignedProjects: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchUsers();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      const updatePayload: any = {
        userId: editingUser._id,
        email: formData.email,
        role: formData.role,
        assignedProjects: formData.assignedProjects,
      };

      // Only include password if it's been changed
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        await fetchUsers();
        setEditingUser(null);
        setIsDialogOpen(false);
        resetForm();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    resetForm();
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      role: user.role,
      assignedProjects: user.assignedProjects || [],
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'project_user',
      assignedProjects: [],
    });
    setShowPassword(false);
  };

  const toggleProject = (project: string) => {
    setFormData(prev => ({
      ...prev,
      assignedProjects: prev.assignedProjects.includes(project)
        ? prev.assignedProjects.filter(p => p !== project)
        : [...prev.assignedProjects, project]
    }));
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 mt-[-25px]">User Management</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage users and their project access permissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">
                  Password {editingUser && <span className="text-sm text-gray-500">(leave blank to keep current)</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'project_user' | 'client' })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="admin">Admin (Full Access)</option>
                  <option value="project_user">Project User (Limited Access)</option>
                  <option value="client">Client (Dashboard + Pipeline only)</option>
                </select>
              </div>

              {(formData.role === 'project_user' || formData.role === 'client') && (
                <div>
                  <Label>Assigned Projects</Label>
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                    {availableProjects.length === 0 ? (
                      <p className="text-sm text-gray-500">No projects available. Create some reports first.</p>
                    ) : (
                      availableProjects.map((project) => (
                        <label key={project} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedProjects.includes(project)}
                            onChange={() => toggleProject(project)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{project}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {(formData.role === 'project_user' || formData.role === 'client') && formData.assignedProjects.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">Please select at least one project</p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={(formData.role === 'project_user' || formData.role === 'client') && formData.assignedProjects.length === 0}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Assigned Projects</th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'client' ? 'Client' : 'Project User'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {user.role === 'admin' ? (
                        <span className="text-sm text-gray-500">All Projects</span>
                      ) : user.assignedProjects && user.assignedProjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.assignedProjects.map((project, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {project}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No projects</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found. Create your first user to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
