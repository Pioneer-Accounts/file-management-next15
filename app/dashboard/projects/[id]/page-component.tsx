"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { SearchFilterBar } from "@/components/projects/SearchFilterBar";
import { DocumentCard } from "@/components/projects/DocumentCard";
import { NewDocumentModal } from "@/components/projects/NewDocumentModal";
import { FileText } from "lucide-react";
import Cookies from "js-cookie";

// Helper function to determine financial year from date
function getFinancialYearFromDate(date: Date): string {
  const month = date.getMonth();
  const year = date.getFullYear();

  // In India, financial year is from April to March
  // If month is January to March, financial year is previous year to current year
  // If month is April to December, financial year is current year to next year
  if (month < 3) {
    // January to March
    return `AY - ${year - 1}-${year.toString().slice(-2)}`;
  } else {
    // April to December
    return `AY - ${year}-${(year + 1).toString().slice(-2)}`;
  }
}

// Define Project interface based on API response
interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  status_display: string;
  start_date: string | null;
}

// Define Document interface based on API response
interface Document {
  id: number;
  title: string;
  tags: number[];
  created_date: string;
  page_count: number | null;
  thumbnail_str?: string; // Base64 encoded thumbnail string
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

export default function ProjectDetailPage() {
  // Get the project ID from the URL
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  // State for project data
  const [project, setProject] = useState<{
    id: string;
    name: string;
    description: string;
    color: string;
  }>({
    id: projectId,
    name: "Loading...",
    description: "Loading project details...",
    color: "bg-blue-100",
  });

  const [isLoading, setIsLoading] = useState(true);
  
  // State for search term, documents, and tags
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  // Fetch project data from API
  useEffect(() => {
    fetchProject();
    fetchDocuments();
    fetchTags();
  }, [projectId]);

  // Function to fetch project data from API
  async function fetchProject() {
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `http://localhost:8000/projects/${projectId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // If API call fails, try to use query params as fallback
        const title = searchParams.get("title");
        const description = searchParams.get("description");

        if (title) {
          setProject({
            id: projectId,
            name: title,
            description: description || "",
            color: "bg-blue-100",
          });
          return;
        }

        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Map API response to project format
      setProject({
        id: data.id.toString(),
        name: data.title,
        description: data.description,
        color: "bg-blue-100", // Static color as requested
      });

    } catch (error) {
      console.error("Failed to fetch project:", error);
      // If there's an error, check if we have query params to use
      const title = searchParams.get("title");
      const description = searchParams.get("description");

      if (title) {
        setProject({
          id: projectId,
          name: title,
          description: description || "",
          color: "bg-blue-100",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Function to fetch documents for the project
  const fetchDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `http://localhost:8000/documents/?project=${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setDocuments(data.results);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      // Handle error - show error message to user
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Function to fetch tags from API
  const fetchTags = async () => {
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch("http://localhost:8000/tags", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  // States for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFinancialYear, setSelectedFinancialYear] =
    useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  // Sample financial years
  const financialYears = [
    "AY - 2023-24",
    "AY - 2024-25",
    "AY - 2022-23",
    "AY - 2021-22",
    "AY - 2020-21",
  ];

  // Helper function to process base64 string to data URL
  function getImageUrlFromBase64(base64String: string | undefined): string | null {
    if (!base64String) return null;
    try {
      // Try to determine the type of image from the base64 data
      return `data:image/*;base64,${base64String}`;
    } catch (e) {
      console.error('Error processing base64 image:', e);
      return null;
    }
  }

  // Sample data for tags
  const allTags = [
    "Important",
    "Urgent",
    "Personal",
    "Business",
    "Finance",
    "Legal",
    "Tax",
    "Insurance",
    "design",
    "prototype",
    "wireframe",
    "mockup",
    "final",
    "approved",
    "revision",
    "draft",
  ];

  // Sample correspondents data
  const correspondents = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "Robert Johnson" },
    { id: "4", name: "Emily Davis" },
    { id: "5", name: "Michael Brown" },
  ];

  // Sample document types
  const documentTypes = [
    "Invoice",
    "Contract",
    "Report",
    "Proposal",
    "Receipt",
    "Letter",
    "Memo",
  ];

  // Filter documents based on search term and selected filters
  const filteredDocuments = documents.filter((doc) => {
    // Title search filter
    const matchesSearch =
      searchTerm === "" ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Tag filter - we'd need to fetch tag names to match by name
    // For now, we'll just assume they're empty
    const matchesTags = selectedTags.length === 0;

    // Financial Year filter
    // We'll skip financial year filtering since API documents don't have this field directly
    const matchesFinancialYear = !selectedFinancialYear || true;

    // Document Type filter
    // We'll skip document type filtering since API documents don't have this field directly
    const matchesDocumentType = !selectedDocumentType || true;

    return (
      matchesSearch &&
      matchesTags &&
      matchesFinancialYear &&
      matchesDocumentType
    );
  });

  return (
    <div>
      {/* Project Header */}
      <ProjectHeader project={project} />

      {/* Search and Filter Bar */}
      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedFinancialYear={selectedFinancialYear}
        setSelectedFinancialYear={setSelectedFinancialYear}
        selectedDocumentType={selectedDocumentType}
        setSelectedDocumentType={setSelectedDocumentType}
        onNewDocument={() => setIsNewDocModalOpen(true)}
        allTags={allTags}
        financialYears={financialYears}
        documentTypes={documentTypes}
      />

      {/* Project Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoadingDocuments ? (
          // Loading state for documents
          Array(5)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="relative aspect-square bg-gray-100 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Thumbnail with hover overlay */}
              <div className="relative aspect-square bg-gray-100">
                {doc.thumbnail_str ? (
                  <>
                    <div className="relative w-full h-full">
                      <img
                        src={getImageUrlFromBase64(doc.thumbnail_str) || ''}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load for document:', doc.id);
                          // Try direct display of the fallback instead of DOM manipulation
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Get the fallback element by id
                          const fallbackEl = document.getElementById(`fallback-${doc.id}`);
                          if (fallbackEl) {
                            fallbackEl.style.display = 'flex';
                          }
                        }}
                      />
                      <div 
                        id={`fallback-${doc.id}`} 
                        className="absolute inset-0 w-full h-full items-center justify-center" 
                        style={{ display: 'none' }}
                      >
                        <FileText className="w-16 h-16 text-gray-300" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {doc.tags.map((tagId, index) => {
                      // Find the tag object that matches the ID
                      const tag = tags.find((t) => t.id === tagId);
                      return (
                        <span
                          key={index}
                          className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
                          style={tag?.color ? { backgroundColor: tag.color } : undefined}
                        >
                          {tag ? tag.name : `Tag ${tagId}`}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Document info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                  {doc.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  {doc.created_date && (
                    <span>
                      {new Date(doc.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  {doc.page_count !== null && (
                    <span>
                      {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-700">
              No documents found
            </h3>
            <p className="text-gray-500 mt-1">
              Upload documents to this project to get started
            </p>
          </div>
        )}
      </div>

      {/* New Document Modal */}
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        allTags={allTags}
        correspondents={correspondents}
        documentTypes={documentTypes}
        projectId={projectId} // Pass project ID for API association
      />
    </div>
  );
}
