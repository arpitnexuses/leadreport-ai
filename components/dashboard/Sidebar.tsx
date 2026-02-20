"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, History, Settings, LogOut, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import { TabType } from "@/types/dashboard";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole?: 'admin' | 'project_user' | 'client';
}

export function Sidebar({ activeTab, setActiveTab, userRole = 'project_user' }: SidebarProps) {
  const router = useRouter();
  const isAdmin = userRole === 'admin';
  const isClient = userRole === 'client';

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (res.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems: Array<{
    id: TabType;
    label: string;
    icon: typeof LayoutDashboard;
  }> = [
    ...(!isClient ? [{
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
    }] : []),
    ...(!isClient ? [{
      id: 'generate' as TabType,
      label: 'Generate Lead',
      icon: Sparkles,
    }] : []),
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: History,
    },
  ];

  const settingsItems: Array<{
    id: TabType;
    label: string;
    icon: typeof Settings;
    adminOnly?: boolean;
  }> = [
    ...(!isClient ? [{
      id: 'settings' as TabType,
      label: 'Project Settings',
      icon: Settings,
    }] : []),
    ...(isAdmin ? [{
      id: 'users' as TabType,
      label: 'Users',
      icon: Users,
      adminOnly: true,
    }] : []),
  ];

  return (
    <div className="w-72 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 border-r border-blue-700/50 flex flex-col">
      <div className="py-8 px-6 border-b border-blue-700/50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-40 flex items-center justify-center">
            <Image
              src="https://cdn-nexlink.s3.us-east-2.amazonaws.com/Nexuses-logo-white_fcc59df4-b0be-47d1-b2ae-aeea3835a1b0.png"
              alt="Brand Name"
              width={140}
              height={35}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <nav className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white/10 backdrop-blur-sm text-white shadow-lg ring-1 ring-white/20'
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-blue-300'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Navigation */}
          <div className="space-y-4">
            {settingsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white/10 backdrop-blur-sm text-white shadow-lg ring-1 ring-white/20'
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-blue-300'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
      
      <div className="p-6 border-t border-blue-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-blue-100 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 text-blue-300" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
} 