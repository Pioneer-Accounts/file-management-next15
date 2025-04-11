import React, { useEffect, useRef, useState } from 'react';
import { FileText } from "lucide-react";
import Cookies from "js-cookie";

interface DocumentPreviewProps {
  documentId: string;
}

export function DocumentView({ documentId }: DocumentPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const fetchPdf = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(`http://localhost:8000/documents/${documentId}/download-archive/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }

        const blob = await response.blob();
        // Create and store URL for cleanup later
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError(error instanceof Error ? error.message : 'Failed to load PDF');
        setLoading(false);
      }
    };

    fetchPdf();

    // Cleanup blob URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId]);

  // Create a PDF viewer that works securely in the sandbox
  const renderPdfViewer = () => {
    if (!pdfUrl) return null;

    return (
      <object
        data={pdfUrl}
        type="application/pdf"
        className="w-full h-full"
        style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
      >
        <div className="flex items-center justify-center h-full bg-gray-100 p-4">
          <p>
            Your browser doesn't support embedded PDFs.{" "}
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              Click here to view the PDF
            </a>
          </p>
        </div>
      </object>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Document Preview</h3>
      </div>
     
      <div className="flex-1 p-0 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading document...</p>
            </div>
          </div>
        )}

        {!loading && !error && pdfUrl && renderPdfViewer()}
       
        {!loading && !pdfUrl && !error && (
          <div className="flex items-center justify-center h-full bg-gray-100 rounded-md" style={{ minHeight: "500px" }}>
            <div className="text-center p-6">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Preview Available</h3>
              <p className="text-gray-500 max-w-md">
                This document doesn't have an archive PDF version available. You can download the original file from the button above.
              </p>
            </div>
          </div>
        )}
       
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center p-6">
              <div className="text-red-500 mb-4">
                <FileText className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-red-700 mb-2">Error Loading Preview</h3>
              <p className="text-red-600 max-w-md">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}