"use client";

import { useState } from "react";
import { Tag, Save, X } from "lucide-react";

export default function AddTagsPage() {
  const [tagName, setTagName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        // Get access token from cookies
        const accessToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        if (!accessToken) {
          throw new Error("Authentication token not found");
        }

        // Call the API to save the tag
        const response = await fetch("http://localhost:8000/tags/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: tagName.trim(),
            color: "#dbeafe", // Default color - you could make this customizable
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save tag: ${response.statusText}`);
        }

        const savedTag = await response.json();
        console.log("Tag saved successfully:", savedTag);

        // Update the UI
        setTags([...tags, tagName.trim()]);
        setTagName("");
      } catch (err) {
        console.error("Error saving tag:", err);
        setError(err instanceof Error ? err.message : "Failed to save tag");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Tags</h1>
        <p className="text-gray-600">Create and manage your tags</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="tagName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tag Name
            </label>
            <div className="flex gap-2">
              <input
                id="tagName"
                type="text"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tag name"
                required
              />

              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {tags.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Saved Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <Tag className="h-4 w-4" />
                  <span>{tag}</span>
                  <button
                    onClick={() => {
                      const newTags = [...tags];
                      newTags.splice(index, 1);
                      setTags(newTags);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
