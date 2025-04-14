"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Plus, Search } from "lucide-react";
import Cookies from "js-cookie";
import { NewTagModal } from "@/components/NewTagModal";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface TagSelectProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  onCreateTag?: (tagName: string, color: string) => Promise<any>;
}

export function TagSelect({ selectedTags, setSelectedTags, onCreateTag }: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewTagModalOpen, setIsNewTagModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        setTags(data);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch tags: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Load tags when component mounts
  useEffect(() => {
    fetchTags();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  // Handle clearing all tags
  const handleClearAll = () => {
    setSelectedTags([]);
  };

  // Handle creating a new tag
  const handleCreateNewTag = async (tagName: string, color: string) => {
    if (!tagName.trim() || !onCreateTag) return;
    
    const newTag = await onCreateTag(tagName.trim(), color);
    if (newTag) {
      // Add the new tag to the tags list
      setTags(prevTags => [...prevTags, newTag]);
      
      // Add the new tag to selected tags
      if (!selectedTags.includes(newTag.name)) {
        setSelectedTags([...selectedTags, newTag.name]);
      }
      
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  // Filter tags based on search term
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected tags display */}
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedTags.length > 0 ? (
            <>
              <span className="text-gray-700">{selectedTags.length} tags selected</span>
            </>
          ) : (
            <span className="text-gray-500">Select tags...</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>

      {/* Selected tags below the input */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => {
            // Find the tag object to get its color
            const tagObj = tags.find(t => t.name === tag);
            return (
              <div
                key={tag}
                className="flex items-center rounded px-2 py-1 text-sm"
                style={{
                  backgroundColor: tagObj ? `${tagObj.color}20` : '#e6f2ff',
                  color: '#000000', // Black text for better visibility
                  border: `1px solid ${tagObj ? tagObj.color : '#3b82f6'}`
                }}
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearAll();
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 flex items-center">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full focus:outline-none text-sm"
              placeholder="Search tags..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Create new tag button */}
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsNewTagModalOpen(true);
              }}
              className="w-full px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center"
            >
              <Plus className="h-3 w-3 mr-1.5" />
              Create New Tag
            </button>
          </div>

          {/* Tags list */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading tags...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
                <button
                  className="block mx-auto mt-2 text-blue-500 hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchTags();
                  }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                      selectedTags.includes(tag.name) ? "bg-blue-50" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedTags.includes(tag.name)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag.name));
                      } else {
                        setSelectedTags([...selectedTags, tag.name]);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <span>{tag.name}</span>
                    </div>
                    {selectedTags.includes(tag.name) && (
                      <span className="text-blue-500">✓</span>
                    )}
                  </div>
                ))}

                {filteredTags.length === 0 && (
                  <div className="p-2 text-gray-500 text-center">
                    {searchTerm ? `No tags matching "${searchTerm}"` : "No tags available"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* New Tag Modal */}
      {isNewTagModalOpen && (
        <NewTagModal
          initialTagName={searchTerm}
          onClose={() => setIsNewTagModalOpen(false)}
          onSave={handleCreateNewTag}
        />
      )}
    </div>
  );
}