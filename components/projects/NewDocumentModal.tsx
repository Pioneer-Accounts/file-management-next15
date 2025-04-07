"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Upload, FileText, ChevronDown } from "lucide-react";

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  correspondents: { id: string; name: string }[];
  documentTypes: string[];
}

export function NewDocumentModal({
  isOpen,
  onClose,
  allTags,
  correspondents,
  documentTypes,
}: NewDocumentModalProps) {
  // States for document creation
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocTags, setNewDocTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null);
  const [creationDate, setCreationDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>("");
  const [selectedCorrespondent, setSelectedCorrespondent] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");

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

  // Refs for handling outside clicks
  const modalRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const correspondentDropdownRef = useRef<HTMLDivElement>(null);
  const documentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle saving the document
  const handleSaveDocument = () => {
    // Process the document data
    const documentData = {
      title: newDocTitle,
      tags: newDocTags,
      creationDate,
      correspondent: selectedCorrespondent,
      documentType,
      notes,
      files,
    };
    
    console.log(documentData);
    
    // Reset form and close modal
    resetForm();
    onClose();
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
                        <div className="max-h-60 overflow-y-auto">
                          {allTags
                            .filter((tag) =>
                              tag
                                .toLowerCase()
                                .includes(modalTagSearchTerm.toLowerCase())
                            )
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
                          {allTags.filter((tag) =>
                            tag
                              .toLowerCase()
                              .includes(modalTagSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <div className="p-2 text-gray-500 text-center">
                              No tags found
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
                                .includes(
                                  correspondentSearchTerm.toLowerCase()
                                )
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
                                  setSelectedCorrespondent(
                                    correspondent.id
                                  );
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
                              .includes(
                                correspondentSearchTerm.toLowerCase()
                              )
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
                          {documentType || "Select document type..."}
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
                        {documentTypes.map((type) => (
                          <div
                            key={type}
                            className={`p-2 hover:bg-gray-100 cursor-pointer ${
                              documentType === type ? "bg-blue-50" : ""
                            }`}
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
                                setFiles(
                                  files.filter((_, i) => i !== index)
                                );
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
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDocument}
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

      {/* New Tag Modal */}
      {isNewTagModalOpen && (
        <NewEntityModal
          title="Add New Tag"
          fieldLabel="Tag Name"
          fieldValue={newTagName}
          onFieldChange={setNewTagName}
          onSave={() => {
            if (newTagName.trim()) {
              // Add new tag and select it
              toggleNewDocTag(newTagName.trim());
              setIsNewTagModalOpen(false);
              setNewTagName("");
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

interface NewEntityModalProps {
  title: string;
  fieldLabel: string;
  fieldValue: string;
  onFieldChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

function NewEntityModal({
  title,
  fieldLabel,
  fieldValue,
  onFieldChange,
  onSave,
  onClose,
}: NewEntityModalProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fieldLabel}
          </label>
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => onFieldChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
          />
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!fieldValue.trim()}
            className={`px-4 py-2 rounded-md text-white ${
              !fieldValue.trim()
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Add {fieldLabel.split(" ")[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
