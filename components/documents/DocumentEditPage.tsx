"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  X, 
  Download, 
  FileText, 
  ChevronDown, 
  Plus, 
  ArrowLeft,
  Calendar,
  Tag,
  User,
  FileType,
  Edit3,
  Eye
} from "lucide-react";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { NewEntityModal } from "@/components/projects/NewEntityModal";
import { TagSelect } from "@/components/TagSelect";
import { DocumentView } from "@/components/documents/DocumentView";


interface Tag {
  id: number;
  name: string;
  color: string;
}

interface DocumentType {
  id: number;
  name: string;
}

interface Correspondent {
  id: string;
  name: string;
}

interface DocumentDetails {
  id: number;
  title: string;
  correspondent: number | null;
  document_type: number | null;
  created: string;
  tags: number[];
  project: string | null;
  notes: { note: string }[];
  archive_file: string | null;
  original_filename: string | null;
}

interface DocumentEditPageProps {
  documentId: string;
  correspondents: Correspondent[];
  documentTypes: string[];
  allTags: string[];
  onClose?: () => void;
}

interface Note {
    id: number,
    created: string,
    note: string,
    user: number | null,
}

export function DocumentEditPage({
  documentId,
  correspondents,
  documentTypes: propDocumentTypes,
  allTags: propAllTags,
  onClose,
}: DocumentEditPageProps) {
  const router = useRouter();
  
  // Document state
  const [documentData, setDocumentData] = useState<DocumentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isViewMode, setIsViewMode] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [creationDate, setCreationDate] = useState<Date>(new Date());
  const [selectedCorrespondent, setSelectedCorrespondent] = useState<string>("");
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<number | null>(null);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [documentNotes, setDocumentNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // State for dropdowns
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const [isCorrespondentDropdownOpen, setIsCorrespondentDropdownOpen] = useState(false);
  const [isDocTypeDropdownOpen, setIsDocTypeDropdownOpen] = useState(false);
  const [modalTagSearchTerm, setModalTagSearchTerm] = useState("");
  const [correspondentSearchTerm, setCorrespondentSearchTerm] = useState("");

  // State for new entity modals
  const [isNewTagModalOpen, setIsNewTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isNewCorrespondentModalOpen, setIsNewCorrespondentModalOpen] = useState(false);
  const [newCorrespondentName, setNewCorrespondentName] = useState("");
  const [isNewDocTypeModalOpen, setIsNewDocTypeModalOpen] = useState(false);
  const [newDocTypeName, setNewDocTypeName] = useState("");

  // Document types state
  const [documentTypesList, setDocumentTypesList] = useState<DocumentType[]>([]);
  const [isLoadingDocTypes, setIsLoadingDocTypes] = useState(false);
  const [docTypeError, setDocTypeError] = useState<string | null>(null);

  // Refs for handling outside clicks
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const correspondentDropdownRef = useRef<HTMLDivElement>(null);
  const documentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);

  // Fetch document details
  const fetchDocumentDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }
  
      const response = await fetch(`http://localhost:8000/documents/${documentId}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch document: ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      setDocumentData(data);
      
      // Initialize form with document data
      setTitle(data.title || "");
      setCreationDate(data.created ? new Date(data.created) : new Date());
      setSelectedCorrespondent(data.correspondent ? data.correspondent.toString() : "");
      setSelectedDocTypeId(data.document_type);
      setSelectedTags(data.tags || []);
      
      // Set notes from the document - ensure each note has an id
      if (data.notes && data.notes.length > 0) {
        // Make sure each note has an id property
        const notesWithIds = data.notes.map((note, index) => 
          note.id ? note : { ...note, id: `temp-${index}` }
        );
        setDocumentNotes(notesWithIds);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch tags from API
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

      if (response.ok) {
        const data = await response.json();
        setTagList(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch tags:", response.status, errorText);
        
        // Set mock data for testing if the API fails
        const mockTags = [
          { id: 1, name: "mockup", color: "#dbeafe" },
          { id: 2, name: "Business", color: "#dbeafe" },
        ];
        setTagList(mockTags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      
      // Set mock data for testing if there's an exception
      const mockTags = [
        { id: 1, name: "mockup", color: "#dbeafe" },
        { id: 2, name: "Business", color: "#dbeafe" },
      ];
      setTagList(mockTags);
    }
  };

  // Fetch document types from API
  const fetchDocumentTypes = async () => {
    try {
      setIsLoadingDocTypes(true);
      setDocTypeError(null);

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

      if (response.ok) {
        const data = await response.json();
        setDocumentTypesList(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch document types:", response.status, errorText);
        
        // Set mock data for testing if the API fails
        const mockDocTypes = [
          { id: 1, name: "Contract" },
          { id: 3, name: "Invoice" },
        ];
        setDocumentTypesList(mockDocTypes);
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
      
      // Set mock data for testing if there's an exception
      const mockDocTypes = [
        { id: 1, name: "Contract" },
        { id: 3, name: "Invoice" },
      ];
      setDocumentTypesList(mockDocTypes);
    } finally {
      setIsLoadingDocTypes(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchDocumentDetails();
    fetchTags();
    fetchDocumentTypes();
  }, [documentId]);

  // Toggle tag selection
  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCreateTag = async (tagName: string, color: string) => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }
      
      const response = await fetch("http://localhost:8000/tags/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tagName,
          color: color || "#3b82f6" // Use the color from the color picker
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create tag: ${response.status}`);
      }
      
      const newTag = await response.json();
      
      // Add the new tag to the tagList
      setTagList(prev => [...prev, newTag]);
      
      // Add the new tag to selectedTags (by ID)
      setSelectedTags(prev => [...prev, newTag.id]);
      
      // Add the new tag name to selectedTagNames
      setSelectedTagNames(prev => [...prev, newTag.name]);
      
      // Refresh the tag list to include the new tag
      fetchTags();
      
      return newTag;
    } catch (error) {
      console.error("Error creating tag:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to create tag");
      return null;
    }
  };

  

  // Handle saving document changes
  const handleSaveDocument = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Prepare data for update
      const updateData = {
        title,
        created: format(creationDate, "yyyy-MM-dd"),
        correspondent: selectedCorrespondent || null,
        document_type: selectedDocTypeId,
        tags: selectedTags,
      };

      // Send update request
      const response = await fetch(`http://localhost:8000/documents/${documentId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update document: ${response.status} ${errorText}`);
      }

      // Update was successful
      const updatedDocument = await response.json();
      setDocumentData(updatedDocument);
      
      // Switch back to view mode after successful save
      setIsViewMode(true);
      
      // Refresh document details to show updated data
      fetchDocumentDetails();
    } catch (error) {
      console.error("Failed to update document:", error);
      setSaveError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSaving(false);
    }
  };
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setIsAddingNote(true);
      
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }
      
      const response = await fetch("http://localhost:8000/notes/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: newNote,
          document: documentId,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add note: ${response.status} ${errorText}`);
      }
      
      const addedNote = await response.json();
      
      // Ensure we're adding a properly structured note object
      if (typeof addedNote === 'object' && addedNote !== null) {
        // Update the notes list with the new note
        setDocumentNotes(prev => [...prev, addedNote]);
        setNewNote(""); // Clear the input field
        
        // Refresh document details to ensure we have the latest data
        fetchDocumentDetails();
      } else {
        throw new Error("Invalid note data received from server");
      }
      
    } catch (error) {
      console.error("Error adding note:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle downloading the original document
  const handleDownloadOriginal = () => {
    if (!documentId) return;
    
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      console.error("Authentication token not found");
      return;
    }
    
    // Open the download URL in a new tab
    window.open(
      `http://localhost:8000/documents/${documentId}/download-original/`,
      "_blank"
    );
  };

  // Handle downloading the archive document
  const handleDownloadArchive = () => {
    if (!documentId) return;
    
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      console.error("Authentication token not found");
      return;
    }
    
    // Open the download URL in a new tab
    window.open(
      `http://localhost:8000/documents/${documentId}/download-archive/`,
      "_blank"
    );
  };

  useEffect(() => {
    if (tagList.length > 0) {
      if (selectedTagNames.length > 0) {
        // Convert tag names to tag IDs
        const tagIds = selectedTagNames.map(name => {
          const tag = tagList.find(t => t.name === name);
          return tag ? tag.id : null;
        }).filter(id => id !== null) as number[];
        
        setSelectedTags(tagIds);
      } else if (selectedTagNames.length === 0) {
        setSelectedTags([]);
      }
    }
  }, [selectedTagNames, tagList]);

  // Update selectedTagNames when document data is loaded
  useEffect(() => {
    if (documentData && tagList.length > 0) {
      const tagNames = documentData.tags
        .map(tagId => {
          const tag = tagList.find(t => t.id === tagId);
          return tag ? tag.name : null;
        })
        .filter(name => name !== null) as string[];
      
      setSelectedTagNames(tagNames);
    }
  }, [documentData, tagList]);

  // Close modal and dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
  }, [isCorrespondentDropdownOpen, isDocTypeDropdownOpen, isTagsDropdownOpen]);

  // Handle back navigation
  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <X className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Error Loading Document</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {isViewMode ? "Document Details" : "Edit Document"}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Download buttons moved to header */}
              <button
                onClick={handleDownloadOriginal}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-1 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Original</span>
              </button>
              {documentData?.archive_file && (
                <button
                  onClick={handleDownloadArchive}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center space-x-1 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF/A</span>
                </button>
              )}
              
              {isViewMode ? (
                <button
                  onClick={() => setIsViewMode(false)}
                  className="px-4 py-2 flex items-center space-x-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsViewMode(true)}
                    className="px-4 py-2 flex items-center space-x-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveDocument}
                    disabled={isSaving}
                    className="px-4 py-2 flex items-center space-x-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Document Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Document Information</h2>
                
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900 py-2 border-b border-gray-200">
                      {documentData?.title || "No title"}
                    </p>
                  ) : (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter document title"
                    />
                  )}
                </div>
                
                {/* Creation Date */}
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">
                      Creation Date
                    </label>
                  </div>
                  {isViewMode ? (
                    <p className="text-gray-900 py-2 border-b border-gray-200">
                      {documentData?.created 
                        ? format(new Date(documentData.created), "MMMM d, yyyy") 
                        : "No date"}
                    </p>
                  ) : (
                    <input
                      type="date"
                      value={creationDate.toISOString().split("T")[0]}
                      onChange={(e) => {
                        const newDate = e.target.value
                          ? new Date(e.target.value)
                          : new Date();
                        setCreationDate(newDate);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
                
                {/* Correspondent */}
                {/* <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">
                      Correspondent
                    </label>
                  </div>
                  {isViewMode ? (
                    <p className="text-gray-900 py-2 border-b border-gray-200">
                      {correspondents.find(c => c.id === selectedCorrespondent)?.name || "None"}
                    </p>
                  ) : (
                    <div className="relative" ref={correspondentDropdownRef}>
                      <div className="flex">
                        <div
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md flex justify-between items-center cursor-pointer"
                          onClick={() => setIsCorrespondentDropdownOpen(!isCorrespondentDropdownOpen)}
                        >
                          <span>
                            {selectedCorrespondent
                              ? correspondents.find((c) => c.id === selectedCorrespondent)?.name
                              : "Select correspondent..."}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                        <button
                          className="px-2 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsNewCorrespondentModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
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
                              .filter((c) => c.name.toLowerCase().includes(correspondentSearchTerm.toLowerCase()))
                              .map((correspondent) => (
                                <div
                                  key={correspondent.id}
                                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                                    selectedCorrespondent === correspondent.id ? "bg-blue-50" : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedCorrespondent(correspondent.id);
                                    setIsCorrespondentDropdownOpen(false);
                                    setCorrespondentSearchTerm("");
                                  }}
                                >
                                  {correspondent.name}
                                </div>
                              ))}
                            {correspondents.filter((c) => 
                              c.name.toLowerCase().includes(correspondentSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <div className="p-2 text-gray-500 text-center">
                                No correspondent found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div> */}
                
                {/* Document Type */}
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <FileType className="h-4 w-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">
                      Document Type
                    </label>
                  </div>
                  {isViewMode ? (
                    <p className="text-gray-900 py-2 border-b border-gray-200">
                      {documentTypesList.find(dt => dt.id === selectedDocTypeId)?.name || "None"}
                    </p>
                  ) : (
                    <div className="relative" ref={documentTypeDropdownRef}>
                      <div className="flex">
                        <div
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md flex justify-between items-center cursor-pointer"
                          onClick={() => setIsDocTypeDropdownOpen(!isDocTypeDropdownOpen)}
                        >
                          <span>
                            {selectedDocTypeId
                              ? documentTypesList.find((dt) => dt.id === selectedDocTypeId)?.name
                              : "Select document type..."}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                        <button
                          className="px-2 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsNewDocTypeModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {isDocTypeDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {isLoadingDocTypes ? (
                            <div className="p-4 text-center">
                              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                              <p className="mt-2 text-sm text-gray-500">
                                Loading document types...
                              </p>
                            </div>
                          ) : docTypeError ? (
                            <div className="p-4 text-center text-red-500">
                              {docTypeError}
                              <button
                                className="block mx-auto mt-2 text-blue-500 hover:text-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fetchDocumentTypes();
                                }}
                              >
                                Retry
                              </button>
                            </div>
                          ) : (
                            documentTypesList.map((docType) => (
                              <div
                                key={docType.id}
                                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                                  selectedDocTypeId === docType.id ? "bg-blue-50" : ""
                                }`}
                                onClick={() => {
                                  setSelectedDocTypeId(docType.id);
                                  setIsDocTypeDropdownOpen(false);
                                }}
                              >
                                {docType.name}
                              </div>
                            ))
                          )}

                          {!isLoadingDocTypes && !docTypeError && documentTypesList.length === 0 && (
                            <div className="p-2 text-gray-500 text-center">
                              No document types available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <Tag className="h-4 w-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">
                      Tags
                    </label>
                  </div>
                  {isViewMode ? (
                    <div className="flex flex-wrap gap-2 py-2 border-b border-gray-200">
                      {selectedTags.length > 0 ? (
                        selectedTags.map((tagId) => {
                          const tag = tagList.find((t) => t.id === tagId);
                          return tag ? (
                            <span
                              key={tag.id}
                              className="text-xs px-2 py-1 rounded font-medium"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                                border: `1px solid ${tag.color}`
                              }}
                            >
                              {tag.name}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-gray-500">No tags</span>
                      )}
                    </div>
                  ) : (
                    <TagSelect 
                      selectedTags={selectedTagNames}
                      setSelectedTags={setSelectedTagNames}
                      onCreateTag={handleCreateTag}
                    />
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <div className="border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
                  {/* Existing notes */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {documentNotes && documentNotes.length > 0 ? (
                      documentNotes.map((note, index) => (
                        <div key={note.id || `note-${index}`} className="p-3 border-b border-gray-200">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-gray-500">
                              {note.created ? new Date(note.created).toLocaleString() : "Unknown date"}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{typeof note.note === 'string' ? note.note : 'No content'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-400 text-center">No notes</div>
                    )}
                  </div>
                  
                  {/* Add new note */}
                  <div className="p-3 bg-white border-t border-gray-200">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-vertical mb-2"
                      placeholder="Add a new note..."
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={isAddingNote || !newNote.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isAddingNote ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          <span>Add Note</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Document Preview */}
          <div className="lg:col-span-2">
            <DocumentView 
              documentId={documentId}
            />
          </div>
  
        </div>
      </main>

      {/* New Correspondent Modal */}
      {isNewCorrespondentModalOpen && (
        <NewEntityModal
          title="Add New Correspondent"
          fieldLabel="Correspondent Name"
          fieldValue={newCorrespondentName}
          onFieldChange={setNewCorrespondentName}
          onSave={async () => {
            if (newCorrespondentName.trim()) {
              try {
                const accessToken = Cookies.get("accessToken");
                if (!accessToken) {
                  throw new Error("Authentication token not found");
                }
                
                const response = await fetch("http://localhost:8000/correspondents/", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: newCorrespondentName
                  }),
                });
                
                if (!response.ok) {
                  throw new Error(`Failed to create correspondent: ${response.status}`);
                }
                
                const newCorrespondent = await response.json();
                // Add the new correspondent to the list
                correspondents.push({
                  id: newCorrespondent.id.toString(),
                  name: newCorrespondent.name
                });
                
                // Select the newly created correspondent
                setSelectedCorrespondent(newCorrespondent.id.toString());
                
                setIsNewCorrespondentModalOpen(false);
                setNewCorrespondentName("");
              } catch (error) {
                console.error("Error creating correspondent:", error);
                setSaveError(error instanceof Error ? error.message : "Failed to create correspondent");
              }
            }
          }}
          onClose={() => setIsNewCorrespondentModalOpen(false)}
        />
      )}

      {/* New Document Type Modal */}
      {isNewDocTypeModalOpen && (
        <NewEntityModal
          title="Add New Document Type"
          fieldLabel="Document Type Name"
          fieldValue={newDocTypeName}
          onFieldChange={setNewDocTypeName}
          onSave={async () => {
            if (newDocTypeName.trim()) {
              try {
                const accessToken = Cookies.get("accessToken");
                if (!accessToken) {
                  throw new Error("Authentication token not found");
                }
                
                const response = await fetch("http://localhost:8000/document-type/", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: newDocTypeName
                  }),
                });
                
                if (!response.ok) {
                  throw new Error(`Failed to create document type: ${response.status}`);
                }
                
                const newDocType = await response.json();
                
                // After creating a document type, refresh the list
                fetchDocumentTypes();
                
                // Select the newly created document type
                setSelectedDocTypeId(newDocType.id);
                
                setIsNewDocTypeModalOpen(false);
                setNewDocTypeName("");
              } catch (error) {
                console.error("Error creating document type:", error);
                setSaveError(error instanceof Error ? error.message : "Failed to create document type");
              }
            }
          }}
          onClose={() => setIsNewDocTypeModalOpen(false)}
        />
      )}

      {/* Error notification */}
      {saveError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Error saving document</p>
              <p className="text-sm mt-1">{saveError}</p>
            </div>
            <button 
              className="ml-auto pl-3" 
              onClick={() => setSaveError(null)}
            >
              <X className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
                                        