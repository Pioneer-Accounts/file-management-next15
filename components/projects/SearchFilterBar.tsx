"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";

interface SearchFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  selectedFinancialYear: string;
  setSelectedFinancialYear: (year: string) => void;
  selectedDocumentType: string;
  setSelectedDocumentType: (type: string) => void;
  onNewDocument: () => void;
  allTags: string[];
  financialYears: string[];
  documentTypes: string[];
}

export function SearchFilterBar({
  searchTerm,
  setSearchTerm,
  selectedTags,
  setSelectedTags,
  selectedFinancialYear,
  setSelectedFinancialYear,
  selectedDocumentType,
  setSelectedDocumentType,
  onNewDocument,
  allTags,
  financialYears,
  documentTypes,
}: SearchFilterBarProps) {
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isFinancialYearDropdownOpen, setIsFinancialYearDropdownOpen] = useState(false);
  const [isDocumentTypeDropdownOpen, setIsDocumentTypeDropdownOpen] = useState(false);
  const [filterTagSearchTerm, setFilterTagSearchTerm] = useState("");
  
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const financialYearDropdownRef = useRef<HTMLDivElement>(null);
  const documentTypeDropdownRef = useRef<HTMLDivElement>(null);

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

  // Filter tags based on search term
  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(filterTagSearchTerm.toLowerCase())
  );

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
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

      {/* Financial Year Dropdown */}
      <div className="relative" ref={financialYearDropdownRef}>
        <button
          onClick={() =>
            setIsFinancialYearDropdownOpen(!isFinancialYearDropdownOpen)
          }
          className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-sm truncate">
            {selectedFinancialYear || "Select Financial Year"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {isFinancialYearDropdownOpen && (
          <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="max-h-60 overflow-y-auto">
              {financialYears.map((year) => (
                <div
                  key={year}
                  className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedFinancialYear === year ? "bg-blue-50" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFinancialYear("");
                    setIsFinancialYearDropdownOpen(false);
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

      {/* Document Type Dropdown */}
      <div className="relative" ref={documentTypeDropdownRef}>
        <button
          onClick={() =>
            setIsDocumentTypeDropdownOpen(!isDocumentTypeDropdownOpen)
          }
          className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-sm truncate">
            {selectedDocumentType || "Select Document Type"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {isDocumentTypeDropdownOpen && (
          <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="max-h-60 overflow-y-auto">
              {documentTypes.map((type) => (
                <div
                  key={type}
                  className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedDocumentType === type ? "bg-blue-50" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDocumentType(
                      type === selectedDocumentType ? "" : type
                    );
                    setIsDocumentTypeDropdownOpen(false);
                  }}
                >
                  <span className="text-sm">{type}</span>
                </div>
              ))}
            </div>

            {selectedDocumentType && (
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-end px-2 pb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
      
      {/* New Document Button - Opens modal */}
      <button
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ml-auto"
        onClick={onNewDocument}
      >
        <Plus className="h-4 w-4" />
        <span>New Document</span>
      </button>
    </div>
  );
}
