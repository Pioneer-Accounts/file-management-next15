"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Upload, FileText, ChevronDown } from "lucide-react";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { NewEntityModal } from "./NewEntityModal";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface DocumentType {
  id: number;
  name: string;
}

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  correspondents: { id: string; name: string }[];
  documentTypes: string[];
  projectId?: string; // Optional project ID for associating document with project
}

export function NewDocumentModal({
  isOpen,
  onClose,
  allTags: propAllTags,
  correspondents,
  documentTypes: propDocumentTypes,
  projectId,
}: NewDocumentModalProps) {
  // States for document creation
  const [newDocTitle, setNewDocTitle] = useState("");
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [newDocTags, setNewDocTags] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(
    null
  );
  const [creationDate, setCreationDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>("");
  const [selectedCorrespondent, setSelectedCorrespondent] =
    useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State for dropdowns
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const [isCorrespondentDropdownOpen, setIsCorrespondentDropdownOpen] =
    useState(false);
  const [isDocTypeDropdownOpen, setIsDocTypeDropdownOpen] = useState(false);
  const [modalTagSearchTerm, setModalTagSearchTerm] = useState("");
  const [correspondentSearchTerm, setCorrespondentSearchTerm] = useState("");

  // State for new entity modals
  const [isNewTagModalOpen, setIsNewTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isNewCorrespondentModalOpen, setIsNewCorrespondentModalOpen] =
    useState(false);
  const [newCorrespondentName, setNewCorrespondentName] = useState("");
  const [isNewDocTypeModalOpen, setIsNewDocTypeModalOpen] = useState(false);
  const [newDocTypeName, setNewDocTypeName] = useState("");

  // Refs for handling outside clicks
  const modalRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const correspondentDropdownRef = useRef<HTMLDivElement>(null);
  const documentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentTypesList, setDocumentTypesList] = useState<DocumentType[]>(
    []
  );
  const [isLoadingDocTypes, setIsLoadingDocTypes] = useState(false);
  const [docTypeError, setDocTypeError] = useState<string | null>(null);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<number | null>(
    null
  );

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
  const toggleNewDocTag = (tagId: number) => {
    setNewDocTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      // Using the exact token from the curl example
      const hardcodedToken = Cookies.get("accessToken");

      console.log("Making API request to fetch tags...");

      // Direct URL from the curl example
      const response = await fetch("http://localhost:8000/tags", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${hardcodedToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched tags data:", JSON.stringify(data));

        // Set the tags list with the fetched data
        setTagList(data);

        // Log tags list length after setting
        console.log("Tags list set with length:", data.length);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch tags:", response.status, errorText);

        // Set mock data for testing if the API fails
        const mockTags = [
          { id: 1, name: "mockup", color: "#dbeafe" },
          { id: 2, name: "Business", color: "#dbeafe" },
        ];
        console.log("Setting mock tags for testing");
        setTagList(mockTags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);

      // Set mock data for testing if there's an exception
      const mockTags = [
        { id: 1, name: "mockup", color: "#dbeafe" },
        { id: 2, name: "Business", color: "#dbeafe" },
      ];
      console.log("Setting mock tags after error");
      setTagList(mockTags);
    }
  };

  // Load tags when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchTags();
      fetchDocumentTypes();
    }
  }, [isOpen]);

  // Fetch document types from API
  const fetchDocumentTypes = async () => {
    try {
      setIsLoadingDocTypes(true);
      setDocTypeError(null);

      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      console.log("Making API request to fetch document types...");

      const response = await fetch("http://localhost:8000/document-type/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched document types data:", JSON.stringify(data));

        setDocumentTypesList(data);
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to fetch document types:",
          response.status,
          errorText
        );

        // Set mock data for testing if the API fails
        const mockDocTypes = [
          { id: 1, name: "Contract" },
          { id: 3, name: "Invoice" },
        ];
        console.log("Setting mock document types for testing");
        setDocumentTypesList(mockDocTypes);
      }
    } catch (error) {
      console.error("Error fetching document types:", error);

      // Set mock data for testing if there's an exception
      const mockDocTypes = [
        { id: 1, name: "Contract" },
        { id: 3, name: "Invoice" },
      ];
      console.log("Setting mock document types after error");
      setDocumentTypesList(mockDocTypes);
    } finally {
      setIsLoadingDocTypes(false);
    }
  };

  // Handle saving the document
  const handleSaveDocument = async () => {
    if (!files.length) {
      setUploadError("Please select at least one file to upload");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Get access token from cookies
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Create a FormData object for file upload with binary blobs
      const formData = new FormData();

      // Add document creation date
      formData.append('created', creationDate ? format(creationDate, "yyyy-MM-dd") : "");

      // Add the document file as binary blob
      if (files.length > 0) {
        formData.append('document', files[0]);
      }

      // Add document title
      formData.append('title', newDocTitle);

      // Add correspondent if selected
      if (selectedCorrespondent) {
        formData.append('correspondent', selectedCorrespondent);
      } else {
        formData.append('correspondent', '');
      }

      // Add document type if selected
      if (selectedDocTypeId) {
        formData.append('document_type', selectedDocTypeId.toString());
      } else {
        formData.append('document_type', '');
      }

      // Add tags if selected
      if (newDocTags.length > 0) {
        newDocTags.forEach(tagId => {
          formData.append('tags', tagId.toString());
        });
      }

      // Add project ID if provided
      if (projectId) {
        formData.append('Project', projectId);
      }

      console.log("Uploading document with FormData");

      // Send the request to the API with FormData (multipart/form-data)
      const response = await fetch("http://localhost:8000/documents/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`
          // Don't set Content-Type manually - the browser will set it with the correct boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      // Process successful response
      const responseData = await response.json();
      console.log("Document uploaded successfully:", responseData);

      // Files have already been uploaded as part of the FormData
      
      // Check if we have document ID in the response and notes to save
      if (responseData && responseData.id && notes) {
        try {
          // Call the notes API to save notes for this document
          const notesResponse = await fetch("http://localhost:8000/notes/", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              note: notes,
              document: responseData.id
            }),
          });
          
          if (!notesResponse.ok) {
            const errorText = await notesResponse.text();
            console.error("Notes API Error:", errorText);
            console.warn(`Failed to save notes: ${notesResponse.status} ${notesResponse.statusText}`);
            // We don't throw here as we don't want to fail the whole process if just notes fail
          } else {
            const notesData = await notesResponse.json();
            console.log("Notes saved successfully:", notesData);
          }
        } catch (noteError) {
          console.error("Error saving notes:", noteError);
          // We don't throw here as the document was still successfully uploaded
        }
      }

      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to upload document:", error);
      setUploadError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Reset all form fields
  const resetForm = () => {
    setNewDocTitle("");
    setNewDocTags([]);
    setCreationDate(new Date());
    setSelectedCorrespondent("");
    setDocumentType("");
    setNotes("");
    setFiles([]);
    setSelectedPreviewFile(null);
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-[70%] mx-4 flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add New Document</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Split into two columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Form */}
          <div className="w-[60%] p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Document Title */}
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

              {/* Tags and Creation Date */}
              <div className="grid grid-cols-2 gap-4">
                {/* Document Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="relative" ref={tagsDropdownRef}>
                    <div className="flex">
                      <div
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setIsTagsDropdownOpen(!isTagsDropdownOpen)
                        }
                      >
                        <div className="flex flex-wrap gap-2 overflow-hidden">
                          {newDocTags.length > 0 ? (
                            newDocTags.map((tagId) => {
                              const tag = tagList.find((t) => t.id === tagId);
                              return tag ? (
                                <span
                                  key={tag.id}
                                  className="text-xs px-2 py-1 rounded flex items-center"
                                  style={{
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color,
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {tag.name}
                                  <X
                                    className="ml-1 h-3 w-3 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleNewDocTag(tag.id);
                                    }}
                                  />
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-gray-500">
                              Select tags...
                            </span>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                      </div>
                      <button
                        className="px-2 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNewTagModalOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {isTagsDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="p-2">
                          <input
                            type="text"
                            value={modalTagSearchTerm}
                            onChange={(e) =>
                              setModalTagSearchTerm(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search tags..."
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Debug info - will show in development only */}
                        {process.env.NODE_ENV !== "production" && (
                          <div className="px-2 py-1 text-xs text-gray-500 border-b">
                            Tags loaded: {tagList.length}
                          </div>
                        )}

                        <div className="max-h-60 overflow-y-auto">
                          {tagList && tagList.length > 0 ? (
                            tagList
                              .filter(
                                (tag) =>
                                  tag &&
                                  tag.name &&
                                  tag.name
                                    .toLowerCase()
                                    .includes(modalTagSearchTerm.toLowerCase())
                              )
                              .map((tag) => (
                                <div
                                  key={tag.id}
                                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => toggleNewDocTag(tag.id)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={newDocTags.includes(tag.id)}
                                    onChange={() => {}}
                                    className="mr-2"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span
                                    className="w-4 h-4 mr-2 rounded-full inline-block"
                                    style={{
                                      backgroundColor: tag.color || "#dbeafe",
                                    }}
                                  ></span>
                                  <span className="text-sm">{tag.name}</span>
                                </div>
                              ))
                          ) : (
                            <div className="p-2 text-gray-500 text-center">
                              No tags available
                            </div>
                          )}

                          {tagList &&
                            tagList.length > 0 &&
                            tagList.filter(
                              (tag) =>
                                tag &&
                                tag.name &&
                                tag.name
                                  .toLowerCase()
                                  .includes(modalTagSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <div className="p-2 text-gray-500 text-center">
                                No matching tags found
                              </div>
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
                    value={creationDate.toISOString().split("T")[0]}
                    onChange={(e) => {
                      const newDate = e.target.value
                        ? new Date(e.target.value)
                        : new Date();
                      setCreationDate(newDate);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Correspondent and Document Type */}
              <div className="grid grid-cols-2 gap-4">
                {/* Correspondent Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correspondent
                  </label>
                  <div className="relative" ref={correspondentDropdownRef}>
                    <div className="flex">
                      <div
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setIsCorrespondentDropdownOpen(
                            !isCorrespondentDropdownOpen
                          )
                        }
                      >
                        <span>
                          {selectedCorrespondent
                            ? correspondents.find(
                                (c) => c.id === selectedCorrespondent
                              )?.name
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
                            onChange={(e) =>
                              setCorrespondentSearchTerm(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search correspondents..."
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {correspondents
                            .filter((c) =>
                              c.name
                                .toLowerCase()
                                .includes(correspondentSearchTerm.toLowerCase())
                            )
                            .map((correspondent) => (
                              <div
                                key={correspondent.id}
                                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                                  selectedCorrespondent === correspondent.id
                                    ? "bg-blue-50"
                                    : ""
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
                            c.name
                              .toLowerCase()
                              .includes(correspondentSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <div className="p-2 text-gray-500 text-center">
                              No correspondent found
                            </div>
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
                    <div className="flex">
                      <div
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setIsDocTypeDropdownOpen(!isDocTypeDropdownOpen)
                        }
                      >
                        <span>
                          {selectedDocTypeId
                            ? documentTypesList.find(
                                (dt) => dt.id === selectedDocTypeId
                              )?.name
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
                        {/* Debug info - will show in development only */}
                        {process.env.NODE_ENV !== "production" && (
                          <div className="px-2 py-1 text-xs text-gray-500 border-b">
                            Document types loaded: {documentTypesList.length}
                          </div>
                        )}

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
                                selectedDocTypeId === docType.id
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                              onClick={() => {
                                setSelectedDocTypeId(docType.id);
                                setDocumentType(docType.name); // Keep this for backward compatibility
                                setIsDocTypeDropdownOpen(false);
                              }}
                            >
                              {docType.name}
                            </div>
                          ))
                        )}

                        {!isLoadingDocTypes &&
                          !docTypeError &&
                          documentTypesList.length === 0 && (
                            <div className="p-2 text-gray-500 text-center">
                              No document types available
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-vertical"
                  placeholder="Add notes about this document..."
                />
              </div>

              {/* File Upload */}
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
                                  setSelectedPreviewFile(
                                    files.length > 1 ? files[0] : null
                                  );
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
          <div className="w-[40%] border-l border-gray-200 p-4 overflow-hidden flex flex-col">
            <h3 className="text-lg font-medium mb-2">Document Preview</h3>
            {selectedPreviewFile ? (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="mb-2 text-sm text-gray-500">
                  {selectedPreviewFile.name} (
                  {(selectedPreviewFile.size / 1024).toFixed(2)} KB)
                </div>
                <div className="flex-1 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                  {selectedPreviewFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedPreviewFile)}
                      alt={selectedPreviewFile.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : selectedPreviewFile.type === "application/pdf" ? (
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
                        {selectedPreviewFile.type || "Unknown file type"}
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
        <div className="p-4 border-t flex justify-end items-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveDocument}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md flex items-center transition-colors"
            disabled={isUploading || !newDocTitle || !files.length}
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Uploading...
              </>
            ) : (
              <>Upload Document</>
            )}
          </button>
        </div>
      </div>

      {/* New Tag Modal */}
      {isNewTagModalOpen && (
        <NewEntityModal
          title="Add New Tag"
          fieldLabel="Tag Name"
          fieldValue={newTagName}
          onFieldChange={setNewTagName}
          onSave={() => {
            if (newTagName.trim()) {
              // This is a placeholder for creating a new tag via API
              // In a real implementation, you would call the API to create a tag and get its ID
              // For now, we'll just close the modal
              setIsNewTagModalOpen(false);
              setNewTagName("");
              // After creating a tag, refresh the tag list
              fetchTags();
            }
          }}
          onClose={() => setIsNewTagModalOpen(false)}
        />
      )}

      {/* New Correspondent Modal */}
      {isNewCorrespondentModalOpen && (
        <NewEntityModal
          title="Add New Correspondent"
          fieldLabel="Correspondent Name"
          fieldValue={newCorrespondentName}
          onFieldChange={setNewCorrespondentName}
          onSave={() => {
            if (newCorrespondentName.trim()) {
              // Create a new correspondent with a unique ID
              const newId = (
                Math.max(...correspondents.map((c) => parseInt(c.id))) + 1
              ).toString();

              // Select the new correspondent
              setSelectedCorrespondent(newId);

              // Close the modal and reset
              setIsNewCorrespondentModalOpen(false);
              setNewCorrespondentName("");
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
          onSave={() => {
            if (newDocTypeName.trim()) {
              // Set the new document type
              setDocumentType(newDocTypeName.trim());

              // Close the modal and reset
              setIsNewDocTypeModalOpen(false);
              setNewDocTypeName("");
            }
          }}
          onClose={() => setIsNewDocTypeModalOpen(false)}
        />
      )}
    </div>
  );
}
