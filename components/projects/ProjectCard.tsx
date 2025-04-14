import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    status: string;
    status_display: string;
    start_date: string | null;
  };
  onEdit: (project: any) => void;
  onDelete: (projectId: number) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [activeMenu, setActiveMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <Link href={`/dashboard/projects/${project.id}`}>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-md bg-blue-100`}>
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveMenu(!activeMenu);
                }}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-800">
                {project.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {project.description}
              </p>
              {project.status_display && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {project.status_display}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Options Menu Dropdown */}
      {activeMenu && (
        <div
          ref={menuRef}
          className="absolute right-2 top-12 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-20 w-44"
        >
          <button 
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(project);
              setActiveMenu(false);
            }}
          >
            <Edit2 className="h-4 w-4 text-gray-500" />
            <span>Edit</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 hover:text-red-700"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(project.id);
              setActiveMenu(false);
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}