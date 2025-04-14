import { useState, useRef, useEffect } from "react";
import { X, CalendarIcon } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: {
    title: string;
    description: string;
    start_date: string | null;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    start_date: string | null;
  };
  mode?: "create" | "edit";
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = { title: "", description: "", start_date: null },
  mode = "create",
}: CreateProjectModalProps) {
  // Initialize state with empty values
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  //   // Reset form when modal opens with new data
  //   useEffect(() => {
  //     if (isOpen) {
  //       setTitle(initialData.title || "");
  //       setDescription(initialData.description || "");
  //       setStartDate(initialData.start_date || null);

  //       console.log("Modal opened with data:", initialData);
  //     }
  //   }, [isOpen, initialData]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) return;

    // Log data before submission
    console.log("Submitting project data:", {
      title,
      description,
      start_date: startDate,
    });

    // Submit form data
    onSubmit({
      title,
      description,
      start_date: startDate,
    });

    // Close modal after submission
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "create" ? "Create New Job" : "Edit Job"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="jobName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                id="jobName"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter job name"
                required
              />
            </div>

            {/* Project Creation Date */}
            <div>
              <label
                htmlFor="projectCreationDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Creation Dateeee
              </label>
              <div className="relative">
                <input
                  id="projectCreationDate"
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => setStartDate(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="jobDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter job description"
                rows={4}
              />
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={!title.trim()}
            >
              {mode === "create" ? "Create Job" : "Update Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
