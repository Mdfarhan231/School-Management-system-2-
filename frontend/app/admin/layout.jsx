"use client";

import React, { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. The Reusable Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* 2. The Main Page Content Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Mobile Sidebar Toggle Button - shows up when sidebar is closed */}
        {!isSidebarOpen && (
          <div className="p-4 absolute z-40 lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl p-2.5 bg-white shadow-sm border border-slate-200 transition-colors hover:bg-slate-100"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
          </div>
        )}

        {/* This will render page.jsx, students/page.jsx, teachers/page.jsx, etc. */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}