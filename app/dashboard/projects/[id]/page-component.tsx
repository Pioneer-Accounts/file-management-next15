"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { SearchFilterBar } from "@/components/projects/SearchFilterBar";
import { DocumentCard } from "@/components/projects/DocumentCard";
import { NewDocumentModal } from "@/components/projects/NewDocumentModal";
import { Download, Edit, Eye, FileText, MoreVertical } from "lucide-react";
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

// Define interfaces
interface Tag {
  id: number;
  name: string;
  color: string;
}

interface DocumentType {
  id: number;
  name: string;
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");

  // Fetch project data from API
  useEffect(() => {
    fetchProject();
    fetchDocuments();
    fetchTags();
    fetchDocumentTypes();
  }, [projectId]);

  // Fetch documents when search term changes
  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, selectedTags, selectedFinancialYear, selectedDocumentType]);

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

      // Build URL with query parameters
      let url = `http://localhost:8000/documents/?project=${projectId}`;
      
      // Add search parameter if search term exists
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      
      // Add tag filtering if implemented
      if (selectedTags.length > 0) {
        url += `&tags=${encodeURIComponent(selectedTags.join(','))}`;
      }

      // Add financial year filtering if selected
      if (selectedFinancialYear) {
        // Parse financial year in format "AY - 2023-24"
        const match = selectedFinancialYear.match(/AY - (\d{4})-(\d{2})/);
        if (match) {
          const startYear = parseInt(match[1]);
          const endYear = parseInt(`20${match[2]}`); // Convert "24" to 2024
          
          // In India, financial year starts from April 1st and ends on March 31st
          const startDate = `${startYear}-04-01`;
          const endDate = `${endYear}-03-31`;
          
          url += `&created_min=${encodeURIComponent(startDate)}&created_max=${encodeURIComponent(endDate)}`;
        }
      }

      // Add document type filtering if implemented
      if (selectedDocumentType) {
        // Find the document type ID that matches the selected name
        const documentType = documentTypes.find(type => type.name === selectedDocumentType);
        if (documentType) {
          url += `&document_type=${encodeURIComponent(documentType.id.toString())}`;
        }
      }

      const response = await fetch(url, {
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
      setDocuments(data.results);
      console.log("Fetched documents with filters:", url, data.results);
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

  // Function to fetch document types from API
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
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setDocumentTypes(data);
    } catch (error) {
      console.error("Failed to fetch document types:", error);
    }
  };

  // State for new document modal
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  // Generate financial years from 1900 to current year
  const generateFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    // Start from current year and go back to 1900
    for (let year = currentYear; year >= 1900; year--) {
      years.push(`AY - ${year}-${(year + 1).toString().slice(-2)}`);
    }

    return years;
  };

  // Replace hardcoded financial years with dynamically generated ones
  const financialYears = generateFinancialYears();

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

  // Convert tags from API to format needed for dropdown
  const tagOptions = tags.map((tag) => tag.name);

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

  // State for document types
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  // Convert document types from API to format needed for dropdown - include both name and id
  const documentTypeOptions = documentTypes.map((type) => ({
    id: type.id.toString(),
    name: type.name
  }));

  // Filter documents based on search term and selected filters
  const filteredDocuments = documents.filter((doc) => {
    // Title search filter
    const matchesSearch =
      searchTerm === "" ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Tag filter - check if document has any of the selected tags
    const matchesTags =
      selectedTags.length === 0 ||
      (doc.tags &&
        doc.tags.some((tagId) => {
          const tag = tags.find((t) => t.id === tagId);
          return tag && selectedTags.includes(tag.name);
        }));

    // Financial Year filter
    // We'll skip financial year filtering since API documents don't have this field directly
    const matchesFinancialYear = !selectedFinancialYear || true;

    // Document Type filter is handled by the API
    // Local filtering is not needed as the API returns the filtered results
    const matchesDocumentType = true;

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
        allTags={tagOptions}
        financialYears={financialYears}
        documentTypes={documentTypeOptions.map(type => type.name)}
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
                        src={getImageUrlFromBase64(doc.thumbnail_str) || ""}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(
                            "Image failed to load for document:",
                            doc.id
                          );
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
                        <FileText className="w-16 h-16 text-gray-300" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {doc.tags && doc.tags.length > 0 ? (
                    doc.tags.slice(0, 3).map((tagId, index) => {
                      // Find the tag object that matches the ID
                      const tag = tags.find((t) => t.id === tagId);
                      return (
                        <span
                          key={index}
                          className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
                        >
                          {tag ? tag.name : `Tag ${tagId}`}
                        </span>
                      );
                    })
                  ) : (
                    <span className="inline-block bg-gray-500 bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                      No tags
                    </span>
                  )}
                </div>

                {/* Action menu */}
                <div className="absolute top-3 right-3">
                  <button
                    className="p-1.5 rounded-full bg-white bg-opacity-80 text-gray-500 hover:text-gray-700 hover:bg-opacity-100 relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      const dropdown = e.currentTarget.nextElementSibling;
                      if (dropdown) {
                        dropdown.classList.toggle("hidden");
                      }
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <div className="absolute right-0 top-8 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1 hidden">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-800 font-medium line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {doc.created_date && (
                        <span>
                          {
                            new Date(doc.created_date)
                              .toISOString()
                              .split("T")[0]
                          }
                        </span>
                      )}
                    </p>
                  </div>
                  {/* View button */}
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      title="View"
                      onClick={() => {
                        // Handle view action
                        console.log("View document", doc.id);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
        documentTypes={documentTypeOptions.map(type => type.name)}
        projectId={projectId} // Pass project ID for API association
      />
    </div>
  );
}
