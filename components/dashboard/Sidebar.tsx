"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, History, Settings, LogOut, Sparkles } from "lucide-react";
import Image from "next/image";
import { TabType } from "@/types/dashboard";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter();

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
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'generate',
      label: 'Generate Lead',
      icon: Sparkles,
    },
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
  }> = [
    {
      id: 'settings',
      label: 'Preferences',
      icon: Settings,
    },
  ];

  return (
    <div className="w-72 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 border-r border-blue-700/50 flex flex-col">
      <div className="p-6 border-b border-blue-700/50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-48 flex items-center justify-center">
            <Image
              src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/Nexuses%20logo%20white.svg"
              alt="Brand Name"
              width={180}
              height={45}
              className="object-contain"
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