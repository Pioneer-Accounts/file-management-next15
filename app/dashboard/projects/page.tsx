"use client";

import { useState, useEffect } from "react";
import { Search, Plus, FolderOpen } from "lucide-react";
import Cookies from "js-cookie";
import ProjectCard from "@/components/projects/ProjectCard";
import NewProjectModal from "@/components/projects/NewProjectModal";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import FinancialYearFilter from "@/components/projects/FinancialYearFilter";

// Define Project interface based on API response
interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  status_display: string;
  start_date: string | null;
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] =
    useState<string>("");
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Replace hardcoded projects with state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch projects from API
  const fetchProjects = async (filters?: {
    min?: string;
    max?: string;
    search?: string;
  }) => {
    setIsLoading(true);
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Build URL with query parameters for filtering
      let url = `${process.env.NEXT_PUBLIC_API_URL}/projects/`;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.min) params.append("start_date_min", filters.min);
        if (filters.max) params.append("start_date_max", filters.max);
        if (filters.search) params.append("search", filters.search);
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
    setSelectedFinancialYear(year);

    if (!year) {
      // If year is cleared
      if (searchTerm) {
        fetchProjects({ search: searchTerm });
      } else {
        fetchProjects(); // Reset to fetch all projects
      }
      return;
    }

    // Get date range from financial year
    const dateRange = getDateRangeFromFinancialYear(year);
    if (dateRange) {
      // Include search term if present
      if (searchTerm) {
        fetchProjects({
          min: dateRange.min,
          max: dateRange.max,
          search: searchTerm,
        });
      } else {
        fetchProjects({
          min: dateRange.min,
          max: dateRange.max,
        });
      }
    }
  };

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        // If there's a selected financial year, maintain that filter
        if (selectedFinancialYear) {
          const dateRange = getDateRangeFromFinancialYear(
            selectedFinancialYear
          );
          if (dateRange) {
            fetchProjects({
              min: dateRange.min,
              max: dateRange.max,
              search: searchTerm,
            });
          }
        } else {
          // Just search without date filters
          fetchProjects({ search: searchTerm });
        }
      } else if (selectedFinancialYear) {
        // If search is cleared but financial year is selected
        const dateRange = getDateRangeFromFinancialYear(selectedFinancialYear);
        if (dateRange) {
          fetchProjects({
            min: dateRange.min,
            max: dateRange.max,
          });
        }
      } else {
        // No filters, fetch all projects
        fetchProjects();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle job creation
  const handleCreateJob = async (projectData: {
    title: string;
    description: string;
    start_date: string | null;
  }) => {
    try {
      // Get access token from cookies
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Prepare the request data
      const requestData = {
        ...projectData,
        status: "unknown",
      };

      // Make API call to create project
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Close modal
      setIsNewJobModalOpen(false);

      // Refresh projects list
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  // Handle project update
  const handleUpdateProject = async (projectData: {
    title: string;
    description: string;
    start_date: string | null;
  }) => {
    if (!editingProject) return;

    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Prepare the request data
      const requestData = {
        ...projectData,
        status: editingProject.status,
      };

      // Make API call to update project
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${editingProject.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Close modal
      setIsEditModalOpen(false);
      setEditingProject(null);

      // Refresh projects list
      fetchProjects();
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      // Make API call to delete project
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Refresh projects list
      fetchProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

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
          <FinancialYearFilter
            selectedYear={selectedFinancialYear}
            onYearSelect={handleFinancialYearSelect}
          />
        </div>

        <button
          className="ml-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => setIsNewJobModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>New Jobs</span>
        </button>
      </div>
      <div>
        {/* New Job Modal - Using CreateProjectModal */}
        <CreateProjectModal
          isOpen={isNewJobModalOpen}
          onClose={() => setIsNewJobModalOpen(false)}
          onSubmit={handleCreateJob}
          mode="create"
        />

        {/* Edit Job Modal - Using NewProjectModal */}
        {editingProject && (
          <NewProjectModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingProject(null);
            }}
            onSubmit={handleUpdateProject}
            initialData={{
              title: editingProject.title,
              description: editingProject.description || "",
              start_date: editingProject.start_date,
            }}
            mode="edit"
          />
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
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(project) => {
                    setEditingProject(project);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={handleDeleteProject}
                />
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
    </div>
  );
}
