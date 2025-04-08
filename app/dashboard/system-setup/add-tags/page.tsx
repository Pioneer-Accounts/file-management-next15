"use client";

import { useState, useEffect } from "react";
import { Tag, Save, X } from "lucide-react";
import Cookies from "js-cookie";

// Define a type for tag objects
interface TagItem {
  id: number;
  name: string;
  color: string;
}

export default function AddTagsPage() {
  const [tagName, setTagName] = useState("");
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tags when component mounts
  useEffect(() => {
    fetchTags();
  }, []);

  // Function to fetch all tags
  const fetchTags = async () => {
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.statusText}`);
      }

      const fetchedTags = await response.json();
      setTags(fetchedTags);
    } catch (err) {
      console.error("Error fetching tags:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tags");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        // Get access token from cookies
        const accessToken = Cookies.get("accessToken");

        if (!accessToken) {
          throw new Error("Authentication token not found");
        }

        // Call the API to save the tag
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tags/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: tagName.trim(),
              color: "#dbeafe", // Default color - you could make this customizable
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to save tag: ${response.statusText}`);
        }

        const savedTag = await response.json();
        console.log("Tag saved successfully:", savedTag);

        // Refresh the tags list
        fetchTags();

        // Clear the input field
        setTagName("");
      } catch (err) {
        console.error("Error saving tag:", err);
        setError(err instanceof Error ? err.message : "Failed to save tag");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to delete a tag
  const handleDeleteTag = async (tagId: number) => {
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }
      // `${process.env.NEXT_PUBLIC_API_URL}
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tags/${tagId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete tag: ${response.statusText}`);
      }

      // Refresh the tags list after deletion
      fetchTags();
    } catch (err) {
      console.error("Error deleting tag:", err);
      setError(err instanceof Error ? err.message : "Failed to delete tag");
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

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {tags.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Saved Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                  // style={{ backgroundColor: `${tag.color}20`, color: tag.color.replace('20', '') }}
                >
                  <Tag className="h-4 w-4" />
                  <span>{tag.name}</span>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="hover:text-red-600"
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
