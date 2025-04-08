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

export default function Documents() {
  // States for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Define our date range state to match the structure from react-day-picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  // Add the activeDropdown state here inside the component
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  // Add state for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagDropdownOpen(false);
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

  const documents = [
    {
      id: 1,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 2,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 3,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 4,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 5,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 6,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    // Add more documents as needed
  ];

  // Extract all unique tags
  const allTags = Array.from(new Set(documents.flatMap((doc) => doc.tags)));

  // Filter documents based on search term and selected filters
  const filteredDocuments = documents.filter((doc) => {
    // Title search filter
    const matchesSearch =
      searchTerm === "" ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => doc.tags.includes(tag));

    // Date range filter
    const docDate = new Date(doc.date);
    const matchesDate =
      !dateRange ||
      (!dateRange.from && !dateRange.to) || // No date range selected
      (dateRange.from && !dateRange.to && isSameDay(docDate, dateRange.from)) || // Only from date selected and matches
      (dateRange.from &&
        dateRange.to &&
        isWithinInterval(docDate, {
          start: dateRange.from,
          end: dateRange.to,
        })); // Date is within range

    return matchesSearch && matchesTags && matchesDate;
  });

  // Filter tags based on search term in the dropdown
  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
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
    const tagIds = [1, 2, 3];
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
      const response = await fetch("http://localhost:8000/documents/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Note: Don't set Content-Type when using FormData, browser will set it with boundary
        },
        body: formData,
      });

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
        // Here you would refresh your documents list
        // fetchDocuments(); // Uncomment if you have a function to refresh documents
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
                        key={tag}
                        className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                      >
                        <input
                          type="checkbox"
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`tag-${tag}`}
                          className="text-sm cursor-pointer"
                        >
                          {tag}
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

        {/* Date Range Filter with Shadcn Calendar */}
        <div>
          <Popover>
            <div className="relative flex">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[300px] justify-start text-left font-normal ${
                    !dateRange || !dateRange.from ? "text-muted-foreground" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange && dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d, yyyy")} -{" "}
                        {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>

              {/* Clear button outside of the main button */}
              {dateRange && (dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 z-10"
                  onClick={() => setDateRange(undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
                numberOfMonths={2}
                className="bg-white"
                classNames={{
                  day_range_start: "day-range-start !bg-blue-600 !text-white",
                  day_range_end: "day-range-end !bg-blue-600 !text-white",
                  day_selected: "!bg-blue-600 !text-white hover:!bg-blue-600",
                  day_range_middle: "!bg-blue-100 !text-blue-800 rounded-none",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has(.day-range-start)]:rounded-l-md [&:has(.day-range-end)]:rounded-r-md [&:has(.day-selected)]:bg-blue-100",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
          >
            {/* Thumbnail with hover overlay */}
            <div className="relative aspect-square bg-gray-100">
              {doc.thumbnail ? (
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
                {doc.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action menu */}
              <div className="absolute top-3 right-3">
                {/* Action menu */}
                <div className="absolute top-3 right-3">
                  <button
                    className="p-1.5 rounded-full bg-white bg-opacity-80 text-gray-500 hover:text-gray-700 hover:bg-opacity-100 relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(
                        activeDropdown === doc.id ? null : doc.id
                      );
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

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
            </div>

            {/* Document Info */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-800 font-medium line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{doc.date}</p>
                </div>
                {/* Replace the download button with view button */}
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

              {/* Progress bar (optional) */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: "75%" }} // Replace with actual progress
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
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
