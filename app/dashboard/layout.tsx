"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Tag,
  FileType,
  ChevronLeft,
  UserCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isSystemSetupExpanded, setIsSystemSetupExpanded] = useState(true);
  // Update state for user profile to include profile picture
  const [userProfile, setUserProfile] = useState<{
    email: string;
    fullName: string;
    username?: string;
    profilePic?: string | null;
  }>({
    email: "",
    fullName: "",
    username: "",
    profilePic: null,
  });

  // State for profile dropdown visibility
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Ref for profile dropdown for click outside handling
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user profile on component mount
  // Click outside handler for profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }

    // Add click event listener if dropdown is open
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        // Get access token from localStorage
        const accessToken = Cookies.get("accessToken");

        if (!accessToken && isMounted) {
          // Instead of immediate redirect, set a flag
          console.log("No access token found");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/profiles/me/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok && isMounted) {
          const data = await response.json();
          setUserProfile({
            email: data.user.email || "",
            fullName: data.full_name?.trim(),
            username: data.user.username || "",
            profilePic: data.profile_pic || null,
          });
          Cookies.set("FMSUID", data.id, { expires: 7 });
        } else if (response.status === 401 && isMounted) {
          // Log instead of immediate redirect
          console.log("Unauthorized access");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Add event listener for profile updates
  useEffect(() => {
    // Function to handle profile update events
    const handleProfileUpdate = (event: CustomEvent) => {
      const { fullName, email, username, profilePic } = event.detail;
      setUserProfile({
        email: email || userProfile.email,
        fullName: fullName || userProfile.fullName,
        username: username || userProfile.username,
        profilePic: profilePic || userProfile.profilePic,
      });
    };

    // Add event listener
    window.addEventListener(
      "profileUpdated",
      handleProfileUpdate as EventListener
    );

    // Cleanup function
    return () => {
      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdate as EventListener
      );
    };
  }, [userProfile]);

  // Handle logout function
  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Clear tokens from cache/cookies if using them
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("FMSUID");

    // Clear any session storage if used
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    // Redirect to login page
    router.push("/signin");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-in-out md:relative md:translate-x-0 bg-white border-r border-gray-200 flex flex-col`}
        style={{
          width: isSidebarOpen ? (isCollapsed ? "80px" : "280px") : "0",
          minWidth: isSidebarOpen ? (isCollapsed ? "80px" : "280px") : "0",
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-1.5 rounded">
                <FileText size={20} />
              </div>
              <span className="text-xl font-semibold text-gray-800">
                FileManager
              </span>
            </Link>
          )}
          {isCollapsed && (
            <div className="mx-auto bg-blue-600 text-white p-1.5 rounded">
              <FileText size={20} />
            </div>
          )}
          <div className="flex items-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
            {!isCollapsed && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ml-2 p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "px-3"
              } py-2.5 text-sm font-medium rounded-md group ${
                pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title="Dashboard"
            >
              <Home
                className={`${isCollapsed ? "" : "mr-3"} h-5 w-5 ${
                  pathname === "/dashboard"
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              />
              {!isCollapsed && "Dashboard"}
            </Link>

            {/* Documents Link */}
            <Link
              href="/dashboard/documents"
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "px-3"
              } py-2.5 text-sm font-medium rounded-md group ${
                pathname === "/dashboard/documents"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title="Documents"
            >
              <FileText
                className={`${isCollapsed ? "" : "mr-3"} h-5 w-5 ${
                  pathname === "/dashboard/documents"
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              />
              {!isCollapsed && "Documents"}
            </Link>

            {/* Projects Section with Dropdown */}
            <div>
              <button
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center" : "justify-between px-3"
                } py-2.5 text-sm font-medium rounded-md group ${
                  pathname.includes("/dashboard/projects")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title="Jobs"
              >
                <div className="flex items-center">
                  <FolderOpen
                    className={`${isCollapsed ? "" : "mr-3"} h-5 w-5 ${
                      pathname.includes("/dashboard/projects")
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-600"
                    }`}
                  />
                  {!isCollapsed && "Jobs"}
                </div>
                {!isCollapsed &&
                  (isProjectsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ))}
              </button>

              {isProjectsExpanded && !isCollapsed && (
                <div className="ml-10 mt-1 space-y-1">
                  <Link
                    href="/dashboard/projects"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/dashboard/projects"
                        ? "text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    All Jobs
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/dashboard/profile"
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "px-3"
              } py-2.5 text-sm font-medium rounded-md group ${
                pathname === "/dashboard/profile"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title="Users"
            >
              <Users
                className={`${isCollapsed ? "" : "mr-3"} h-5 w-5 ${
                  pathname === "/dashboard/profile"
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              />
              {!isCollapsed && "Users"}
            </Link>

            {/* System Setup Dropdown */}
            <div>
              <button
                onClick={() => setIsSystemSetupExpanded(!isSystemSetupExpanded)}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center" : "justify-between px-3"
                } py-2.5 text-sm font-medium rounded-md group ${
                  pathname.includes("/dashboard/system-setup")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title="System Setup"
              >
                <div className="flex items-center">
                  <Settings
                    className={`${isCollapsed ? "" : "mr-3"} h-5 w-5 ${
                      pathname.includes("/dashboard/system-setup")
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-600"
                    }`}
                  />
                  {!isCollapsed && "System Setup"}
                </div>
                {!isCollapsed &&
                  (isSystemSetupExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ))}
              </button>

              {isSystemSetupExpanded && !isCollapsed && (
                <div className="ml-10 mt-1 space-y-1">
                  <Link
                    href="/dashboard/system-setup/add-tags"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/dashboard/system-setup/add-tags"
                        ? "text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Add Tags
                  </Link>
                  <Link
                    href="/dashboard/system-setup/add-document-type"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/dashboard/system-setup/add-document-type"
                        ? "text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <FileType className="mr-2 h-4 w-4" />
                    Add Document Type
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Bottom Navigation */}
          <nav className="space-y-1">
            <Link
              href="/dashboard/settings"
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "px-3"
              } py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group`}
              title="Settings"
            >
              <Settings
                className={`${
                  isCollapsed ? "" : "mr-3"
                } h-5 w-5 text-gray-500 group-hover:text-gray-600`}
              />
              {!isCollapsed && "Settings"}
            </Link>
            <Link
              href="/dashboard/help"
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "px-3"
              } py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group`}
              title="Help & Support"
            >
              <HelpCircle
                className={`${
                  isCollapsed ? "" : "mr-3"
                } h-5 w-5 text-gray-500 group-hover:text-gray-600`}
              />
              {!isCollapsed && "Help & Support"}
            </Link>
          </nav>
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
            <div className="relative" ref={profileDropdownRef}>
              <button
                className="p-1 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {userProfile.profilePic ? (
                    <Image
                      src={userProfile.profilePic}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <UserCircle className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-700">
                        {userProfile.fullName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        @
                        {userProfile.username ||
                          userProfile.email.split("@")[0]}
                      </p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
