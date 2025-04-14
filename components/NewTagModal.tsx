"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { HexColorPicker } from "react-colorful";

interface NewTagModalProps {
  initialTagName?: string;
  onClose: () => void;
  onSave: (tagName: string, color: string) => Promise<void>;
}

export function NewTagModal({ initialTagName = "", onClose, onSave }: NewTagModalProps) {
  const [tagName, setTagName] = useState(initialTagName);
  const [tagColor, setTagColor] = useState("#3b82f6"); // Default blue
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!tagName.trim()) {
      setError("Tag name is required");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(tagName, tagColor);
      onClose();
    } catch (error) {
      console.error("Error saving tag:", error);
      setError(error instanceof Error ? error.message : "Failed to create tag");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Tag</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tag Name
          </label>
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tag name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tag Color
          </label>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Color preview */}
            <div className="flex items-center w-full mb-2">
              <div 
                className="w-10 h-10 rounded-md mr-3 border border-gray-300" 
                style={{ backgroundColor: tagColor }}
              ></div>
              <input
                type="text"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* React Colorful color picker */}
            <div className="w-full flex justify-center">
              <HexColorPicker color={tagColor} onChange={setTagColor} />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !tagName.trim()}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-3 w-3 mr-1.5 text-white"
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
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Tag</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}