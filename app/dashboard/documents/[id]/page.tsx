"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DocumentEditPage } from "@/components/documents/DocumentEditPage";
import Cookies from "js-cookie";

export default function DocumentEditPageWrapper() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [correspondents, setCorrespondents] = useState<{ id: string; name: string }[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data needed for the document edit page
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
          throw new Error("Authentication token not found");
        }

        // Fetch correspondents
        const correspondentsResponse = await fetch("http://localhost:8000/correspondents/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!correspondentsResponse.ok) {
          throw new Error("Failed to fetch correspondents");
        }

        const correspondentsData = await correspondentsResponse.json();
        setCorrespondents(correspondentsData);

        // Fetch document types
        const documentTypesResponse = await fetch("http://localhost:8000/document-type/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!documentTypesResponse.ok) {
          throw new Error("Failed to fetch document types");
        }

        const documentTypesData = await documentTypesResponse.json();
        setDocumentTypes(documentTypesData.map((type: any) => type.name));

        // Fetch tags
        const tagsResponse = await fetch("http://localhost:8000/tags", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!tagsResponse.ok) {
          throw new Error("Failed to fetch tags");
        }

        const tagsData = await tagsResponse.json();
        setAllTags(tagsData.map((tag: any) => tag.name));

      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading document editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Error Loading Document</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/documents")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DocumentEditPage
      documentId={documentId}
      correspondents={correspondents}
      documentTypes={documentTypes}
      allTags={allTags}
      onClose={() => router.push(`/documents/${documentId}`)}
    />
  );
}