"use client";

import { FolderOpen, FileText, Tag, FileType, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface Statistics {
  total_projects: number;
  total_documents: number;
  total_tags: number;
  total_document_types: number;
  project_documents: Record<string, number>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics>({
    total_projects: 0,
    total_documents: 0,
    total_tags: 0,
    total_document_types: 0,
    project_documents: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const accessToken = Cookies.get("accessToken");
        
        if (!accessToken) {
          throw new Error("Authentication token not found");
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/statistics/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch statistics: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your file management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Projects Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden group">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Projects</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    stats.total_projects
                  )}
                </h3>
                <Link href="/dashboard/projects" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  View projects
                  <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <FolderOpen className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden group">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Documents</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    stats.total_documents
                  )}
                </h3>
                <Link href="/dashboard/documents" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  View documents
                  <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tags Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden group">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tags</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    stats.total_tags
                  )}
                </h3>
                <Link href="/dashboard/system-setup/add-tags" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  Manage tags
                  <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Tag className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Document Types Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden group">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Document Types</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    stats.total_document_types
                  )}
                </h3>
                <Link href="/dashboard/system-setup/add-document-type" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  Manage types
                  <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <FileType className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
          <p>Error loading statistics: {error}</p>
        </div>
      )}
    </div>
  );
}
