"use client";

import { useState, useEffect } from "react";
import { FileType, Save, X } from "lucide-react";
import Cookies from "js-cookie";

interface DocumentType {
  id: number;
  name: string;
}

export default function AddDocumentTypePage() {
  const [docTypeName, setDocTypeName] = useState("");
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch document types when component mounts
  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  // Function to fetch all document types
  const fetchDocumentTypes = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch("http://localhost:8000/document-type/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch document types: ${response.statusText}`);
      }

      const fetchedDocTypes = await response.json();
      setDocTypes(fetchedDocTypes);
    } catch (err) {
      console.error("Error fetching document types:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch document types");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (docTypeName.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        // Get access token from cookies
        const accessToken = Cookies.get("accessToken");

        if (!accessToken) {
          throw new Error("Authentication token not found");
        }

        // Call the API to save the document type
        const response = await fetch("http://localhost:8000/document-type/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: docTypeName.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save document type: ${response.statusText}`);
        }

        const savedDocType = await response.json();
        console.log("Document type saved successfully:", savedDocType);

        // Refresh the document types list
        fetchDocumentTypes();
        
        // Clear the input field
        setDocTypeName("");
      } catch (err) {
        console.error("Error saving document type:", err);
        setError(err instanceof Error ? err.message : "Failed to save document type");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to delete a document type
  const handleDeleteDocType = async (docTypeId: number) => {
    try {
      const accessToken = Cookies.get("accessToken");
      
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`http://localhost:8000/document-type/${docTypeId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete document type: ${response.statusText}`);
      }

      // Refresh the document types list after deletion
      fetchDocumentTypes();
    } catch (err) {
      console.error("Error deleting document type:", err);
      setError(err instanceof Error ? err.message : "Failed to delete document type");
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {docTypes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Saved Document Types</h2>
            <div className="flex flex-wrap gap-2">
              {docTypes.map((docType) => (
                <div
                  key={docType.id}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <FileType className="h-4 w-4" />
                  <span>{docType.name}</span>
                  <button
                    onClick={() => handleDeleteDocType(docType.id)}
                    className="text-blue-600 hover:text-red-600"
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