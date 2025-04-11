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
  X,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedFinancialYear, setSelectedFinancialYear] =
    useState<string>("");
  const [isFinancialYearDropdownOpen, setIsFinancialYearDropdownOpen] =
    useState(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newJobName, setNewJobName] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");
  const [projectStartDate, setProjectStartDate] = useState<Date | null>(null);

  // Define Project interface based on API response
  interface Project {
    id: number;
    title: string;
    description: string;
    status: string;
    status_display: string;
    start_date: string | null;
  }

  // Replace hardcoded projects with state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);
  const financialYearDropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Generate financial years from 1900 to current year
  const generateFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    // Start from current year and go back to 1900
    for (let year = currentYear; year >= 1900; year--) {
      years.push(`AY - ${year}-${(year + 1).toString().slice(-2)}`);
    }

    return years;
  };
  const [financialYearSearchTerm, setFinancialYearSearchTerm] = useState("");
  // Replace hardcoded financial years with dynamically generated ones
  const financialYears = generateFinancialYears();
  // Filter financial years based on search term
  const filteredFinancialYears = financialYears.filter((year) =>
    year.toLowerCase().includes(financialYearSearchTerm.toLowerCase())
  );

  // Function to fetch projects from API
  const fetchProjects = async (dateFilters?: {
    min?: string;
    max?: string;
  }) => {
    setIsLoading(true);
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Build URL with query parameters for date filtering
      let url = "http://localhost:8000/projects/";
      if (dateFilters) {
        const params = new URLSearchParams();
        if (dateFilters.min) params.append("start_date_min", dateFilters.min);
        if (dateFilters.max) params.append("start_date_max", dateFilters.max);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data.results);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      alert("Failed to load projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  // Convert financial year to date range
  const getDateRangeFromFinancialYear = (financialYear: string) => {
    // Extract the year from format "AY - YYYY-YY"
    const match = financialYear.match(/AY - (\d{4})-\d{2}/);
    if (!match) return null;

    const startYear = parseInt(match[1]);

    // Financial year typically runs from April 1 to March 31
    return {
      min: `${startYear}-04-01`,
      max: `${startYear + 1}-03-31`,
    };
  };

  // Handle financial year selection
  const handleFinancialYearSelect = (year: string) => {
    if (year === selectedFinancialYear) {
      // Clear selection
      setSelectedFinancialYear("");
      fetchProjects(); // Reset to fetch all projects
    } else {
      setSelectedFinancialYear(year);

      // Get date range from financial year
      const dateRange = getDateRangeFromFinancialYear(year);
      if (dateRange) {
        fetchProjects(dateRange);
      }
    }
    setIsFinancialYearDropdownOpen(false);
  };

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
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isNewJobModalOpen
      ) {
        setIsNewJobModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNewJobModalOpen]);

  // Handle job creation
  const handleCreateJob = async () => {
    if (!newJobName.trim()) {
      return;
    }

    try {
      // Get access token from cookies
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Prepare the request data
      const projectData = {
        title: newJobName,
        description: newJobDescription,
        status: "unknown",
        start_date: projectStartDate
          ? projectStartDate.toISOString().split("T")[0]
          : null,
      };

      // Make API call to create project
      const response = await fetch("http://localhost:8000/projects/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Project created successfully:", data);

      // Reset form and close modal
      setNewJobName("");
      setNewJobDescription("");
      setProjectStartDate(null);
      setIsNewJobModalOpen(false);

      // Refresh projects list
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.description.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search years..."
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={financialYearSearchTerm}
                      onChange={(e) =>
                        setFinancialYearSearchTerm(e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {financialYearSearchTerm && (
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFinancialYearSearchTerm("");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredFinancialYears.length > 0 ? (
                    filteredFinancialYears.map((year) => (
                      <div
                        key={year}
                        className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${
                          selectedFinancialYear === year ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleFinancialYearSelect(year)}
                      >
                        <span className="text-sm">{year}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No matching years found
                    </div>
                  )}
                </div>

                {selectedFinancialYear && (
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-end px-2 pb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFinancialYear("");
                        setIsFinancialYearDropdownOpen(false);
                        fetchProjects(); // Reset to fetch all projects
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

        <button
          className="ml-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => setIsNewJobModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>New Jobs</span>
        </button>
      </div>

      {/* New Job Modal */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Create New Job
              </h2>
              <button
                onClick={() => setIsNewJobModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

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
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter job name"
                />
              </div>

              {/* Project Creation Date */}
              <div>
                <label
                  htmlFor="projectCreationDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Project Creation Date
                </label>
                <div className="relative">
                  <input
                    id="projectCreationDate"
                    type="date"
                    value={
                      projectStartDate
                        ? projectStartDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setProjectStartDate(date);
                    }}
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
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter job description"
                  rows={4}
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => setIsNewJobModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={!newJobName.trim()}
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {isLoading ? (
            // Loading state
            Array(5)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-md bg-gray-200 w-12 h-12"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/4 mt-2"></div>
                  </div>
                </div>
              ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="relative">
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
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
              <FolderOpen className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">
                No jobs found
              </h3>
              <p className="text-gray-500 mt-1">
                Create a new job to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
