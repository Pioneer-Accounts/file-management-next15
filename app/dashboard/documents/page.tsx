"use client";

import { useState, useEffect, useRef } from "react";
import {
  Eye,
  Download,
  FileText,
  Edit,
  Search,
  X,
  ChevronDown,
  CalendarIcon,
  Upload,
  Plus,
} from "lucide-react";
import { format, isWithinInterval, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import "@/styles/calendar-override.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"; // Add this

// Helper function to process base64 string to data URL
function getImageUrlFromBase64(
  base64String: string | undefined
): string | null {
  if (!base64String) return null;
  try {
    // Try to determine the type of image from the base64 data
    // Since the Python backend is reading any file and encoding it directly,
    // we'll use a generic image type that browsers can usually auto-detect
    return `data:image/*;base64,${base64String}`;
  } catch (e) {
    console.error("Error processing base64 image:", e);
    return null;
  }
}

export default function Documents() {
  // States for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Define our date range state to match the structure from react-day-picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isFinancialYearDropdownOpen, setIsFinancialYearDropdownOpen] =
    useState(false);
  const [isDocumentTypeDropdownOpen, setIsDocumentTypeDropdownOpen] =
    useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [financialYearSearchTerm, setFinancialYearSearchTerm] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] =
    useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const financialYearDropdownRef = useRef<HTMLDivElement>(null);
  const documentTypeDropdownRef = useRef<HTMLDivElement>(null);
  // Add the activeDropdown state here inside the component
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  // Add state for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleViewDocument = (documentId: number) => {
    router.push(`/dashboard/documents/${documentId}`);
  };

  // Add interface for tag type
  interface Tag {
    id: number;
    name: string;
    color: string;
  }

  // Add state for tags
  const [tags, setTags] = useState<Tag[]>([]);

  // Interface for document type
  interface DocumentType {
    id: number;
    name: string;
  }

  // State for document types
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  // Add this interface for document type
  interface Document {
    id: number;
    title: string;
    tags: number[];
    created_date: string;
    page_count: number | null;
    thumbnail?: string; // Optional since API doesn't return this
    thumbnail_str?: string; // Base64 encoded thumbnail string
  }

  // Replace the hardcoded documents array with state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch tags from API
  const fetchTags = async () => {
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags`, {
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/document-type/`,
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
      setDocumentTypes(data);
    } catch (error) {
      console.error("Failed to fetch document types:", error);
    }
  };

  // Helper function to determine financial year from date
  function getFinancialYearFromDate(date: Date): string {
    const month = date.getMonth();
    const year = date.getFullYear();

    // In India, financial year is from April to March
    if (month < 3) {
      // January to March
      return `AY - ${year - 1}-${year.toString().slice(-2)}`;
    } else {
      // April to December
      return `AY - ${year}-${(year + 1).toString().slice(-2)}`;
    }
  }

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

  const financialYears = generateFinancialYears();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagDropdownOpen(false);
      }

      if (
        financialYearDropdownRef.current &&
        !financialYearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFinancialYearDropdownOpen(false);
      }

      if (
        documentTypeDropdownRef.current &&
        !documentTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDocumentTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add this useEffect to close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeDropdown !== null) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Add useEffect to fetch documents and tags when component mounts
  useEffect(() => {
    fetchDocuments();
    fetchTags();
    fetchDocumentTypes();
  }, []);

  // Add useEffect to fetch documents when filters change
  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, selectedTags, selectedFinancialYear, selectedDocumentType]);

  // Function to fetch documents from API
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Build URL with query parameters
      let url = `${process.env.NEXT_PUBLIC_API_URL}/documents/`;
      const queryParams = new URLSearchParams();
      // Add search parameter if search term exists
      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm.trim());
      }

      // Add tag filtering - updated to handle multiple tag parameters
      if (selectedTags.length > 0) {
        // Instead of joining with commas, add each tag as a separate parameter
        selectedTags.forEach((tagId) => {
          queryParams.append("tags", tagId);
        });
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

          queryParams.append("created_min", startDate);
          queryParams.append("created_max", endDate);
        }
      }

      // Add document type filtering if implemented
      if (selectedDocumentType) {
        // Find the document type ID that matches the selected name
        const documentType = documentTypes.find(
          (type) => type.name === selectedDocumentType
        );
        if (documentType) {
          queryParams.append("document_type", documentType.id.toString());
        }
      }

      // Append query parameters to URL if there are any
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
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
      alert("Failed to load documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract all unique tags - update to use tag objects
  const allTags = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));

  // Filter tags based on search term in the dropdown
  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  // Toggle tag selection - update to use tag IDs
  const toggleTag = (tagId: number) => {
    const tagIdStr = tagId.toString();
    setSelectedTags((prev) =>
      prev.includes(tagIdStr)
        ? prev.filter((t) => t !== tagIdStr)
        : [...prev, tagIdStr]
    );
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle document upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      // Show error
      return;
    }

    setIsUploading(true);

    // Create FormData object to send file
    const formData = new FormData();

    // Get filename without extension for title
    const fileName = selectedFile.name.split(".")[0];
    const tagIds = [1];
    // Add required fields to the request
    formData.append("title", fileName);
    formData.append("document", selectedFile);
    formData.append("created", "");
    formData.append("correspondent", "");
    formData.append("document_type", "");
    // Fix: Send empty arrays instead of stringified empty arrays for tags and Project
    formData.append("tags", JSON.stringify(tagIds)); // Send as empty array string
    formData.append("Project", ""); // Send as empty array string

    try {
      // Start progress simulation
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      // Get access token from localStorage
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Make API call
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            // Note: Don't set Content-Type when using FormData, browser will set it with boundary
          },
          body: formData,
        }
      );

      clearInterval(interval);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Complete the progress
      setUploadProgress(100);

      // Reset form after successful upload
      setTimeout(() => {
        setIsUploading(false);
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
        // Refresh documents list
        fetchDocuments();
      }, 500);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      // Handle error - show error message to user
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-md bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
          </div>

          {/* Upload Button */}
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-100 p-4 rounded-lg">
        {/* Search by title */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tag Filter Dropdown */}
        <div className="relative" ref={tagDropdownRef}>
          <button
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-sm truncate">
              {selectedTags.length > 0
                ? `${selectedTags.length} tag${
                    selectedTags.length > 1 ? "s" : ""
                  } selected`
                : "Filter by tags"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {isTagDropdownOpen && (
            <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search tags"
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                      >
                        <input
                          type="checkbox"
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id.toString())}
                          onChange={() => toggleTag(tag.id)}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          ></span>
                          {tag.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      No tags found
                    </div>
                  )}
                </div>

                {selectedTags.length > 0 && (
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {selectedTags.length} selected
                    </span>
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Picker */}
        <Popover>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
            {dateRange && (
              <div className="p-3 border-t border-gray-100 flex justify-end">
                <Button
                  variant="ghost"
                  className="text-xs text-blue-500 hover:text-blue-700 py-1 h-auto"
                  onClick={() => setDateRange(undefined)}
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Financial Year Dropdown */}
        <div className="relative" ref={financialYearDropdownRef}>
          <button
            onClick={() =>
              setIsFinancialYearDropdownOpen(!isFinancialYearDropdownOpen)
            }
            className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-sm truncate">
              {selectedFinancialYear || "Financial Year"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {isFinancialYearDropdownOpen && (
            <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search financial years"
                    value={financialYearSearchTerm}
                    onChange={(e) => setFinancialYearSearchTerm(e.target.value)}
                    className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {financialYears
                    .filter((year) =>
                      year
                        .toLowerCase()
                        .includes(financialYearSearchTerm.toLowerCase())
                    )
                    .map((year) => (
                      <div
                        key={year}
                        className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${
                          selectedFinancialYear === year ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedFinancialYear(
                            year === selectedFinancialYear ? "" : year
                          );
                          setIsFinancialYearDropdownOpen(false);
                        }}
                      >
                        <span className="text-sm">{year}</span>
                      </div>
                    ))}
                </div>

                {selectedFinancialYear && (
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-end px-2 pb-2">
                    <button
                      onClick={() => {
                        setSelectedFinancialYear("");
                        setFinancialYearSearchTerm("");
                        setIsFinancialYearDropdownOpen(false);
                      }}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Document Type Dropdown */}
        <div className="relative" ref={documentTypeDropdownRef}>
          <button
            onClick={() =>
              setIsDocumentTypeDropdownOpen(!isDocumentTypeDropdownOpen)
            }
            className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-sm truncate">
              {selectedDocumentType || "Document Type"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {isDocumentTypeDropdownOpen && (
            <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="max-h-60 overflow-y-auto">
                {documentTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${
                      selectedDocumentType === type.name ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      setSelectedDocumentType(
                        type.name === selectedDocumentType ? "" : type.name
                      );
                      setIsDocumentTypeDropdownOpen(false);
                    }}
                  >
                    <span className="text-sm">{type.name}</span>
                  </div>
                ))}
              </div>

              {selectedDocumentType && (
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-end px-2 pb-2">
                  <button
                    onClick={() => {
                      setSelectedDocumentType("");
                      setIsDocumentTypeDropdownOpen(false);
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading ? (
          // Loading state
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
        ) : documents.length > 0 ? (
          documents
            .filter((doc) => {
              // Filter by search term
              const matchesSearch = doc.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

              // Filter by selected tags
              const matchesTags =
                selectedTags.length === 0 ||
                doc.tags.some((tagId) =>
                  selectedTags.includes(tagId.toString())
                );

              // Filter by date range
              const matchesDate =
                !dateRange?.from ||
                !dateRange?.to ||
                isWithinInterval(new Date(doc.created_date), {
                  start: dateRange.from,
                  end: dateRange.to,
                }) ||
                isSameDay(new Date(doc.created_date), dateRange.from) ||
                isSameDay(new Date(doc.created_date), dateRange.to);

              return matchesSearch && matchesTags && matchesDate;
            })
            .map((doc) => (
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
                            // Try direct display of the fallback instead of DOM manipulation
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            // Get the fallback element by id
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
                  ) : doc.thumbnail ? (
                    <>
                      <img
                        src={doc.thumbnail}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-gray-300" />
                    </div>
                  )}

                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {doc.tags.map((tagId, index) => {
                      // Find the tag object that matches the ID
                      const tag = tags.find((t) => t.id === tagId);
                      return (
                        <span
                          key={index}
                          className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
                          // style={{ backgroundColor: tag?.color || '#dbeafe', color: '#1e40af' }}
                        >
                          {tag ? tag.name : `Tag ${tagId}`}
                        </span>
                      );
                    })}
                  </div>

                  {/* Action menu */}
                  <div className="absolute top-3 right-3">
                    {/* <button
                      className="p-1.5 rounded-full bg-white bg-opacity-80 text-gray-500 hover:text-gray-700 hover:bg-opacity-100 relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(
                          activeDropdown === doc.id ? null : doc.id
                        );
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button> */}

                    {activeDropdown === doc.id && (
                      <div className="absolute right-0 top-8 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit action
                            console.log("Edit document", doc.id);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle download action
                            console.log("Download document", doc.id);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-gray-800 font-medium line-clamp-1">
                        {doc.title.length > 20
                          ? `${doc.title.slice(0, 20)}...`
                          : doc.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {doc.created_date}
                      </p>
                    </div>
                    {/* Replace the download button with view button */}
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title="View"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocument(doc.id);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar (optional) - show only if page_count is available */}
                  {doc.page_count && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: "75%" }} // Replace with actual progress
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div className="col-span-full text-center py-10">
            <div className="flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">
                No documents found
              </h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[60%] h-[60%] mx-4 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Upload Document
                </h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
              <form
                onSubmit={handleUpload}
                className="space-y-6 h-full flex flex-col"
              >
                {/* File Upload */}
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-64 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <FileText className="h-12 w-12 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 truncate max-w-[200px] mx-auto">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-3 rounded-full bg-blue-50 mb-3">
                            <Upload className="h-8 w-8 text-blue-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            Drag and drop your file here
                          </p>
                          <p className="text-xs text-gray-500 mt-1 mb-3">or</p>
                          <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                            Browse Files
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <p className="text-xs text-gray-400 mt-4">
                            Supported formats: PDF, Word, Images
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span className="font-medium">Uploading document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUploadModalOpen(false)}
                      disabled={isUploading}
                      className="px-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <span>Upload Document</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
