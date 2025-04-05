"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Eye,
  Download,
  FileText,
  Edit,
  Search,
  X,
  ChevronDown,
  CalendarIcon,
  Plus,
  Upload,
} from "lucide-react";
import { format, isWithinInterval, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "@/styles/calendar-override.css";

export default function ProjectDetail() {
  // Get the project ID from the URL
  const params = useParams();
  const projectId = params.id;

  // Find the project by ID
  const projects = [
    {
      id: "1",
      name: "UI Design",
      description: "User interface design projects",
      color: "bg-blue-100",
    },
    {
      id: "2",
      name: "DashLite Resource",
      description: "Dashboard resources and components",
      color: "bg-blue-100",
    },
    {
      id: "3",
      name: "Projects",
      description: "Client project files and assets",
      color: "bg-blue-100",
    },
    {
      id: "4",
      name: "Marketing",
      description: "Marketing materials and campaigns",
      color: "bg-green-100",
    },
    {
      id: "5",
      name: "Development",
      description: "Software development projects",
      color: "bg-purple-100",
    },
    {
      id: "6",
      name: "Research",
      description: "Research documents and findings",
      color: "bg-yellow-100",
    },
  ];

  const project = projects.find((p) => p.id === projectId) || {
    id: "-1",
    name: "Unknown Project",
    description: "Project not found",
    color: "bg-gray-100",
  };

  // States for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [filterTagSearchTerm, setFilterTagSearchTerm] = useState("");
  const tagDropdownRef = useRef<HTMLDivElement>(null);

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

  // Sample project documents
  const documents = [
    {
      id: 1,
      title: `${project.name} Doc 1`,
      date: "Apr 3, 2025",
      tags: ["design", "prototype"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 2,
      title: `${project.name} Doc 2`,
      date: "Apr 2, 2025",
      tags: ["wireframe", "mockup"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 3,
      title: `${project.name} Doc 3`,
      date: "Apr 1, 2025",
      tags: ["final", "approved"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 4,
      title: `${project.name} Doc 4`,
      date: "Mar 30, 2025",
      tags: ["revision", "draft"],
      thumbnail: "/signup.jpg",
    },
  ];

  // Extract all unique tags
  const allTags = Array.from(new Set(documents.flatMap((doc) => doc.tags)));

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
    tag.toLowerCase().includes(filterTagSearchTerm.toLowerCase())
  );

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Add state for modal
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocTags, setNewDocTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null);
  const [creationDate, setCreationDate] = useState<Date>(new Date());
  const [selectedCorrespondent, setSelectedCorrespondent] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [isCorrespondentDropdownOpen, setIsCorrespondentDropdownOpen] = useState(false);
  const [correspondentSearchTerm, setCorrespondentSearchTerm] = useState("");
  const [isDocTypeDropdownOpen, setIsDocTypeDropdownOpen] = useState(false);
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const [modalTagSearchTerm, setModalTagSearchTerm] = useState("");
  const correspondentDropdownRef = useRef<HTMLDivElement>(null);
  const documentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles = [...files, ...droppedFiles];
      setFiles(newFiles);
      
      // Select the first file for preview if no file is currently selected
      if (!selectedPreviewFile && droppedFiles.length > 0) {
        setSelectedPreviewFile(droppedFiles[0]);
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      
      // Select the first file for preview if no file is currently selected
      if (!selectedPreviewFile && selectedFiles.length > 0) {
        setSelectedPreviewFile(selectedFiles[0]);
      }
    }
  };

  // Toggle tag selection for new document
  const toggleNewDocTag = (tag: string) => {
    setNewDocTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Close modal and dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close modal when clicking outside
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isNewDocModalOpen
      ) {
        setIsNewDocModalOpen(false);
      }
      
      // Close correspondent dropdown when clicking outside
      if (
        correspondentDropdownRef.current &&
        !correspondentDropdownRef.current.contains(event.target as Node) &&
        isCorrespondentDropdownOpen
      ) {
        setIsCorrespondentDropdownOpen(false);
      }
      
      // Close document type dropdown when clicking outside
      if (
        documentTypeDropdownRef.current &&
        !documentTypeDropdownRef.current.contains(event.target as Node) &&
        isDocTypeDropdownOpen
      ) {
        setIsDocTypeDropdownOpen(false);
      }

      // Close tags dropdown when clicking outside
      if (
        tagsDropdownRef.current &&
        !tagsDropdownRef.current.contains(event.target as Node) &&
        isTagsDropdownOpen
      ) {
        setIsTagsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNewDocModalOpen, isCorrespondentDropdownOpen, isDocTypeDropdownOpen, isTagsDropdownOpen]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-4 rounded-md ${project.color}`}>
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
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
                    value={filterTagSearchTerm}
                    onChange={(e) => setFilterTagSearchTerm(e.target.value)}
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
        {/* New Document Button - Opens modal */}
        <button
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ml-auto"
          onClick={() => setIsNewDocModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Project Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {filteredDocuments.map((doc) => (
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

      {/* New Document Modal */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-5xl mx-4 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Add New Document</h2>
                <button
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Split into two columns */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Column - Form */}
              <div className="w-1/2 p-4 overflow-y-auto">
                <div className="space-y-6">
                  {/* Row 1: Document Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter document title"
                    />
                  </div>

                  {/* Row 2: Tags and Creation Date */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Document Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <div className="relative" ref={tagsDropdownRef}>
                        <div 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer"
                          onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                        >
                          <div className="flex flex-wrap gap-2 overflow-hidden">
                            {newDocTags.length > 0 ? (
                              newDocTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {tag}
                                  <X
                                    className="ml-1 h-3 w-3 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleNewDocTag(tag);
                                    }}
                                  />
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">Select tags...</span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                        </div>
                        
                        {isTagsDropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                            <div className="p-2">
                              <input
                                type="text"
                                value={modalTagSearchTerm}
                                onChange={(e) => setModalTagSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search tags..."
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {allTags
                                .filter(tag => tag.toLowerCase().includes(modalTagSearchTerm.toLowerCase()))
                                .map((tag) => (
                                  <div
                                    key={tag}
                                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => toggleNewDocTag(tag)}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={newDocTags.includes(tag)}
                                      onChange={() => {}}
                                      className="mr-2"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-sm">{tag}</span>
                                  </div>
                                ))}
                              {allTags.filter(tag => tag.toLowerCase().includes(modalTagSearchTerm.toLowerCase())).length === 0 && (
                                <div className="p-2 text-gray-500 text-center">No tags found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Creation Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Creation Date
                      </label>
                      <input
                        type="date"
                        value={creationDate.toISOString().split('T')[0]}
                        onChange={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : new Date();
                          setCreationDate(newDate);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Correspondent and Document Type */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Correspondent Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correspondent
                      </label>
                      <div className="relative" ref={correspondentDropdownRef}>
                        <div 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer"
                          onClick={() => setIsCorrespondentDropdownOpen(!isCorrespondentDropdownOpen)}
                        >
                          <span>
                            {selectedCorrespondent
                              ? correspondents.find((c) => c.id === selectedCorrespondent)?.name
                              : "Select correspondent..."}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                        
                        {isCorrespondentDropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                            <div className="p-2">
                              <input
                                type="text"
                                value={correspondentSearchTerm}
                                onChange={(e) => setCorrespondentSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search correspondents..."
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {correspondents
                                .filter(c => c.name.toLowerCase().includes(correspondentSearchTerm.toLowerCase()))
                                .map((correspondent) => (
                                  <div
                                    key={correspondent.id}
                                    className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedCorrespondent === correspondent.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => {
                                      setSelectedCorrespondent(correspondent.id);
                                      setIsCorrespondentDropdownOpen(false);
                                      setCorrespondentSearchTerm("");
                                    }}
                                  >
                                    {correspondent.name}
                                  </div>
                                ))}
                                {correspondents.filter(c => c.name.toLowerCase().includes(correspondentSearchTerm.toLowerCase())).length === 0 && (
                                  <div className="p-2 text-gray-500 text-center">No correspondent found</div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Type Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Type
                      </label>
                      <div className="relative" ref={documentTypeDropdownRef}>
                        <div 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer"
                          onClick={() => setIsDocTypeDropdownOpen(!isDocTypeDropdownOpen)}
                        >
                          <span>
                            {documentType || "Select document type..."}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                        
                        {isDocTypeDropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {documentTypes.map((type) => (
                              <div
                                key={type}
                                className={`p-2 hover:bg-gray-100 cursor-pointer ${documentType === type ? 'bg-blue-50' : ''}`}
                                onClick={() => {
                                  setDocumentType(type);
                                  setIsDocTypeDropdownOpen(false);
                                }}
                              >
                                {type}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Files
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        multiple
                      />
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Drag and drop files here, or click to select files
                      </p>
                      {files.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Selected files:</p>
                          <ul className="mt-2 text-sm text-gray-500 text-left">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="flex justify-between items-center"
                              >
                                <span 
                                  className="truncate max-w-[200px] cursor-pointer hover:text-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPreviewFile(file);
                                  }}
                                >
                                  {file.name}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFiles(files.filter((_, i) => i !== index));
                                    if (selectedPreviewFile === file) {
                                      setSelectedPreviewFile(files.length > 1 ? files[0] : null);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Document Preview */}
              <div className="w-1/2 border-l border-gray-200 p-4 overflow-hidden flex flex-col">
                <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                {selectedPreviewFile ? (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="mb-2 text-sm text-gray-500">
                      {selectedPreviewFile.name} ({(selectedPreviewFile.size / 1024).toFixed(2)} KB)
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      {selectedPreviewFile.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(selectedPreviewFile)}
                          alt={selectedPreviewFile.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : selectedPreviewFile.type === 'application/pdf' ? (
                        <iframe
                          src={URL.createObjectURL(selectedPreviewFile)}
                          className="w-full h-full"
                          title="PDF Preview"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p>Preview not available for this file type</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {selectedPreviewFile.type || 'Unknown file type'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-md">
                    <div className="text-center p-4">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        {files.length > 0
                          ? "Select a file to preview"
                          : "No files uploaded yet"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setIsNewDocModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log({
                    title: newDocTitle,
                    tags: newDocTags,
                    creationDate,
                    correspondent: selectedCorrespondent,
                    documentType,
                    files,
                  });
                  setIsNewDocModalOpen(false);
                  setNewDocTitle("");
                  setNewDocTags([]);
                  setCreationDate(new Date());
                  setSelectedCorrespondent("");
                  setDocumentType("");
                  setFiles([]);
                  setSelectedPreviewFile(null);
                }}
                disabled={!newDocTitle || files.length === 0}
                className={`px-4 py-2 rounded-md text-white ${
                  !newDocTitle || files.length === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Add Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
