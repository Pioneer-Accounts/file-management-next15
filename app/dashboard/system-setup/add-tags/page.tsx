"use client";

import { useState } from "react";
import { Tag, Save, X } from "lucide-react";

export default function AddTagsPage() {
  const [tagName, setTagName] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      setTags([...tags, tagName.trim()]);
      setTagName("");
      // Here you would typically call an API to save the tag
      console.log("Saving tag:", tagName.trim());
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
            <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>

        {tags.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Saved Tags</h2>
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