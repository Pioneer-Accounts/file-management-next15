"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface NewEntityModalProps {
  title: string;
  fieldLabel: string;
  fieldValue: string;
  onFieldChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function NewEntityModal({
  title,
  fieldLabel,
  fieldValue,
  onFieldChange,
  onSave,
  onClose,
}: NewEntityModalProps) {
  const modalRef = useState<HTMLDivElement | null>(null);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-full mx-4">
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fieldLabel}
          </label>
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => onFieldChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
            autoFocus
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
