"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart2,
  Calendar,
  Bell,
  User,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 bg-white border-r border-gray-200 flex flex-col`}
        style={{
          width: isSidebarOpen ? "280px" : "0",
          minWidth: isSidebarOpen ? "280px" : "0",
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-1.5 rounded">
              <FileText size={20} />
            </div>
            <span className="text-xl font-semibold text-gray-800">
              FileManager
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group ${
                pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Home
                className={`mr-3 h-5 w-5 ${
                  pathname === "/dashboard"
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              />
              Dashboard
            </Link>

            {/* Projects Section with Dropdown */}
            <div>
              <button
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md group ${
                  pathname.includes("/dashboard/projects")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <FolderOpen
                    className={`mr-3 h-5 w-5 ${
                      pathname.includes("/dashboard/projects")
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-600"
                    }`}
                  />
                  Projects
                </div>
                {isProjectsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {isProjectsExpanded && (
                <div className="ml-10 mt-1 space-y-1">
                  <Link
                    href="/dashboard/projects"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/dashboard/projects"
                        ? "text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    All Projects
                  </Link>
                  <Link
                    href="/dashboard/projects/recent"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/dashboard/projects/recent"
                        ? "text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    Recent
                  </Link>
                  {/* <Link
                    href="/dashboard/projects/archived"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/dashboard/projects/archived"
                        ? "text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    Archived
                  </Link> */}
                </div>
              )}
            </div>

            {/* <Link
              href="/dashboard/analytics"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group ${
                pathname === "/dashboard/analytics"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart2
                className={`mr-3 h-5 w-5 ${
                  pathname === "/dashboard/analytics"
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              />
              Analytics
            </Link> */}

            {/* <Link
              href="/dashboard/calendar"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group ${
                pathname === "/dashboard/calendar"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Calendar
                className={`mr-3 h-5 w-5 ${
                  pathname === "/dashboard/calendar"
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              />
              Calendar
            </Link> */}

            <Link
              href="/dashboard/users"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group ${
                pathname === "/dashboard/users"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users
                className={`mr-3 h-5 w-5 ${
                  pathname === "/dashboard/users"
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              />
              Users
            </Link>
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Bottom Navigation */}
          <nav className="space-y-1">
            <Link
              href="/dashboard/settings"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
            >
              <Settings className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-600" />
              Settings
            </Link>
            <Link
              href="/dashboard/help"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
            >
              <HelpCircle className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-600" />
              Help & Support
            </Link>
          </nav>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={18} />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">john.doe@example.com</p>
            </div>
            <button className="ml-auto p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center space-x-4">
            <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
