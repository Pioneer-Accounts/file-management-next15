"use client";

import { Eye, Download, FileText, Edit } from "lucide-react";

export default function Documents() {
  const documents = [
    {
      id: 1,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 1,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 1,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 1,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 1,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 1,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    // Add more documents as needed
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Documents</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            {/* Thumbnail */}
            <div className="relative aspect-[4/4] bg-gray-800">
              {doc.thumbnail ? (
                <img
                  src={doc.thumbnail}
                  alt={doc.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {/* Tags */}
              <div className="absolute top-2 left-2">
                {doc.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mr-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Document Info */}
            <div className="p-3">
              <h3 className="text-white text-sm font-medium mb-1">
                {doc.title}
              </h3>
              <p className="text-gray-400 text-xs mb-3">{doc.date}</p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-white">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
