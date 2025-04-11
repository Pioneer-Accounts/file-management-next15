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
  function getImageUrlFromBase64(
    base64String: string | undefined
  ): string | null {
    if (!base64String) return null;
    try {
      // Try to determine the type of image from the base64 data
      return `data:image/*;base64,${base64String}`;
    } catch (e) {
      console.error("Error processing base64 image:", e);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoadingDocuments ? (
          // Loading state for documents
          Array(5)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[280px]"
              >
                <div className="p-2 flex gap-1">
                  <div className="h-6 w-16 bg-blue-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-20 bg-blue-200 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 flex items-center justify-center h-[180px]">
                  <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
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
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group relative h-[280px] flex flex-col"
            >
              {/* Tags at the top */}
              <div className="p-2 flex flex-wrap gap-1">
                {doc.tags && doc.tags.length > 0 ? (
                  doc.tags.slice(0, 3).map((tagId, index) => {
                    // Find the tag object that matches the ID
                    const tag = tags.find((t) => t.id === tagId);
                    return (
                      <span
                        key={index}
                        className="inline-block text-xs px-3 py-1 rounded-full font-medium"
                        style={
                          tag?.color
                            ? { backgroundColor: tag.color }
                            : { backgroundColor: "#dbeafe" }
                        }
                      >
                        {tag ? tag.name : `Tag ${tagId}`}
                      </span>
                    );
                  })
                ) : (
                  <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                    No tags
                  </span>
                )}
              </div>

              {/* Document icon in center */}
              <div className="flex-1 flex items-center justify-center">
                {doc.thumbnail_str ? (
                  <div className="relative w-16 h-20">
                    <img
                      src={getImageUrlFromBase64(doc.thumbnail_str) || ""}
                      alt={doc.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallbackEl = document.getElementById(
                          `fallback-${doc.id}`
                        );
                        if (fallbackEl) {
                          fallbackEl.style.display = "flex";
                        }
                      }}
                    />
                    <div
                      id={`fallback-${doc.id}`}
                      className="absolute inset-0 w-full h-full items-center justify-center"
                      style={{ display: "none" }}
                    >
                      <FileText className="w-12 h-12 text-gray-300" />
                    </div>
                  </div>
                ) : (
                  <FileText className="w-12 h-12 text-gray-300" />
                )}
              </div>

              {/* Document info at bottom */}
              <div className="p-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                  {doc.title}
                </h3>
                <div className="mt-1 text-xs text-gray-500">
                  {doc.created_date && (
                    <span>
                      {new Date(doc.created_date).toISOString().split("T")[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Dropdown menu (three dots) */}
              <div className="absolute top-2 right-2">
                <div className="relative">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      const dropdown = e.currentTarget.nextElementSibling;
                      if (dropdown) {
                        dropdown.classList.toggle("hidden");
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-1 w-36 bg-white shadow-lg rounded-md border border-gray-200 hidden z-10">
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
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
