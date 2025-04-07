"use client";

import { FolderOpen, FileText, Tag, FileType } from "lucide-react";

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Projects</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {stats.projects}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FolderOpen className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Documents</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {stats.documents}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tags Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tags</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {stats.tags}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Tag className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Document Types Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Document Types
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {stats.documentTypes}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FileType className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your dashboard content */}
    </div>
  );
}
