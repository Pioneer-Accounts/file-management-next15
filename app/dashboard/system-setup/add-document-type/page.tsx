"use client";

import { useState } from "react";
import { FileType, Save, X } from "lucide-react";

export default function AddDocumentTypePage() {
  const [docTypeName, setDocTypeName] = useState("");
  const [docTypes, setDocTypes] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (docTypeName.trim()) {
      setDocTypes([...docTypes, docTypeName.trim()]);
      setDocTypeName("");
      // Here you would typically call an API to save the document type
      console.log("Saving document type:", docTypeName.trim());
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Document Type</h1>
        <p className="text-gray-600">Create and manage document types</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="docTypeName" className="block text-sm font-medium text-gray-700 mb-2">
              Document Type Name
            </label>
            <div className="flex gap-2">
              <input
                id="docTypeName"
                type="text"
                value={docTypeName}
                onChange={(e) => setDocTypeName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter document type name"
                required
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>

        {docTypes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Saved Document Types</h2>
            <div className="flex flex-wrap gap-2">
              {docTypes.map((docType, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <FileType className="h-4 w-4" />
                  <span>{docType}</span>
                  <button
                    onClick={() => {
                      const newDocTypes = [...docTypes];
                      newDocTypes.splice(index, 1);
                      setDocTypes(newDocTypes);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}