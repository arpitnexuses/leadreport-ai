"use client";

import { Card, CardContent } from "@/components/ui/card";

export function SettingsView() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Configure your account settings</p>
      </div>
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <CardContent className="p-8">
          <p className="text-gray-600 dark:text-gray-300">Settings content will go here</p>
        </CardContent>
      </Card>
    </div>
  );
} 