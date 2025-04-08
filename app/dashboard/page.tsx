"use client";

import { FolderOpen, FileText, Tag, FileType, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Sample data - replace with your actual data fetching
  const stats = {
    projects: 24,
    documents: 156,
    tags: 42,
    documentTypes: 8,
  };

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
                <h3 className="text-3xl font-bold text-gray-800">{stats.projects}</h3>
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
                <h3 className="text-3xl font-bold text-gray-800">{stats.documents}</h3>
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
                <h3 className="text-3xl font-bold text-gray-800">{stats.tags}</h3>
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
                <h3 className="text-3xl font-bold text-gray-800">{stats.documentTypes}</h3>
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
    </div>
  );
}
