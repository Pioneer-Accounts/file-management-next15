"use client";

import { useState, useRef, useEffect } from "react";
import {
  FolderOpen,
  Search,
  Plus,
  MoreHorizontal,
  Info,
  Share2,
  Copy,
  MoveRight,
  Download,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedFinancialYear, setSelectedFinancialYear] =
    useState<string>("");
  const [isFinancialYearDropdownOpen, setIsFinancialYearDropdownOpen] =
    useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const financialYearDropdownRef = useRef<HTMLDivElement>(null);

  // Sample financial years
  const financialYears = [
    "AY - 2023-24",
    "AY - 2024-25",
    "AY - 2022-23",
    "AY - 2021-22",
    "AY - 2020-21",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
      if (
        financialYearDropdownRef.current &&
        !financialYearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFinancialYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sample project data
  const projects = [
    {
      id: 1,
      name: "UI Design",
      description: "User interface design projects",
      color: "bg-blue-100",
    },
    {
      id: 2,
      name: "DashLite Resource",
      description: "Dashboard resources and components",
      color: "bg-blue-100",
    },
    {
      id: 3,
      name: "Projects",
      description: "Client project files and assets",
      color: "bg-blue-100",
    },
    {
      id: 4,
      name: "Marketing",
      description: "Marketing materials and campaigns",
      color: "bg-green-100",
    },
    {
      id: 5,
      name: "Development",
      description: "Software development projects",
      color: "bg-purple-100",
    },
    {
      id: 6,
      name: "Research",
      description: "Research documents and findings",
      color: "bg-yellow-100",
    },
  ];

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Jobs</h1>
        <p className="text-gray-600">Manage your job folders</p>
      </div>

      {/* Search and Add Project Row */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                      onClick={() => {
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
        </div>

        <button className="ml-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>New Jobs</span>
        </button>
      </div>

      {/* Quick Access Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="relative">
              <Link href={`/dashboard/projects/${project.id}`}>
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-md ${project.color}`}>
                        <FolderOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu === project.id ? null : project.id
                          );
                        }}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-800">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Options Menu Dropdown */}
              {activeMenu === project.id && (
                <div
                  ref={menuRef}
                  className="absolute right-2 top-12 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-20 w-44"
                >
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Edit2 className="h-4 w-4 text-gray-500" />
                    <span>Edit</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
