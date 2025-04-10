"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { SearchFilterBar } from "@/components/projects/SearchFilterBar";
import { DocumentCard } from "@/components/projects/DocumentCard";
import { NewDocumentModal } from "@/components/projects/NewDocumentModal";
import Cookies from "js-cookie";

// Helper function to determine financial year from date
function getFinancialYearFromDate(date: Date): string {
  const month = date.getMonth();
  const year = date.getFullYear();

  // In India, financial year is from April to March
  // If month is January to March, financial year is previous year to current year
  // If month is April to December, financial year is current year to next year
  if (month < 3) {
    // January to March
    return `AY - ${year - 1}-${year.toString().slice(-2)}`;
  } else {
    // April to December
    return `AY - ${year}-${(year + 1).toString().slice(-2)}`;
  }
}

// Define Project interface based on API response
interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  status_display: string;
  start_date: string | null;
}

export default function ProjectDetailPage() {
  // Get the project ID from the URL
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  // State for project data
  const [project, setProject] = useState<{
    id: string;
    name: string;
    description: string;
    color: string;
  }>({
    id: projectId,
    name: "Loading...",
    description: "Loading project details...",
    color: "bg-blue-100",
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch project data from API
  useEffect(() => {
    async function fetchProject() {
      try {
        const accessToken = Cookies.get("accessToken");

        if (!accessToken) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          `http://localhost:8000/projects/${projectId}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          // If API call fails, try to use query params as fallback
          const title = searchParams.get("title");
          const description = searchParams.get("description");

          if (title) {
            setProject({
              id: projectId,
              name: title,
              description: description || "",
              color: "bg-blue-100",
            });
            return;
          }

          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        // Map API response to project format
        setProject({
          id: data.id.toString(),
          name: data.title,
          description: data.description,
          color: "bg-blue-100", // Static color as requested
        });
      } catch (error) {
        console.error("Failed to fetch project:", error);
        // If there's an error, check if we have query params to use
        const title = searchParams.get("title");
        const description = searchParams.get("description");

        if (title) {
          setProject({
            id: projectId,
            name: title,
            description: description || "",
            color: "bg-blue-100",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [projectId, searchParams]);

  // States for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFinancialYear, setSelectedFinancialYear] =
    useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  // Sample financial years
  const financialYears = [
    "AY - 2023-24",
    "AY - 2024-25",
    "AY - 2022-23",
    "AY - 2021-22",
    "AY - 2020-21",
  ];

  // Sample project documents
  const documents = [
    {
      id: 1,
      title: `${project.name} Doc 1`,
      date: "Apr 3, 2025",
      tags: ["design", "prototype"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 2,
      title: `${project.name} Doc 2`,
      date: "Apr 2, 2025",
      tags: ["wireframe", "mockup"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 3,
      title: `${project.name} Doc 3`,
      date: "Apr 1, 2025",
      tags: ["final", "approved"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 4,
      title: `${project.name} Doc 4`,
      date: "Mar 30, 2025",
      tags: ["revision", "draft"],
      thumbnail: "/signup.jpg",
    },
  ];

  // Sample data for tags
  const allTags = [
    "Important",
    "Urgent",
    "Personal",
    "Business",
    "Finance",
    "Legal",
    "Tax",
    "Insurance",
    "design",
    "prototype",
    "wireframe",
    "mockup",
    "final",
    "approved",
    "revision",
    "draft",
  ];

  // Sample correspondents data
  const correspondents = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "Robert Johnson" },
    { id: "4", name: "Emily Davis" },
    { id: "5", name: "Michael Brown" },
  ];

  // Sample document types
  const documentTypes = [
    "Invoice",
    "Contract",
    "Report",
    "Proposal",
    "Receipt",
    "Letter",
    "Memo",
  ];

  // Filter documents based on search term and selected filters
  const filteredDocuments = documents.filter((doc) => {
    // Title search filter
    const matchesSearch =
      searchTerm === "" ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => doc.tags.includes(tag));

    // Financial Year filter
    // For demonstration, we'll assume the document date can be used to determine the financial year
    // In a real application, you would have a specific financial year field
    const docDate = new Date(doc.date);
    const docFinancialYear = getFinancialYearFromDate(docDate);
    const matchesFinancialYear =
      !selectedFinancialYear || docFinancialYear === selectedFinancialYear;

    // Document Type filter
    // For demonstration, we'll assume each document has a type property
    // In a real application, you would have this data
    const docType = doc.id % 2 === 0 ? "Invoice" : "Contract"; // Mock document type based on ID
    const matchesDocumentType =
      !selectedDocumentType || docType === selectedDocumentType;

    return (
      matchesSearch &&
      matchesTags &&
      matchesFinancialYear &&
      matchesDocumentType
    );
  });

  return (
    <div>
      {/* Project Header */}
      <ProjectHeader project={project} />

      {/* Search and Filter Bar */}
      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedFinancialYear={selectedFinancialYear}
        setSelectedFinancialYear={setSelectedFinancialYear}
        selectedDocumentType={selectedDocumentType}
        setSelectedDocumentType={setSelectedDocumentType}
        onNewDocument={() => setIsNewDocModalOpen(true)}
        allTags={allTags}
        financialYears={financialYears}
        documentTypes={documentTypes}
      />

      {/* Project Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {filteredDocuments.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>

      {/* New Document Modal */}
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        allTags={allTags}
        correspondents={correspondents}
        documentTypes={documentTypes}
        projectId={projectId} // Pass project ID for API association
      />
    </div>
  );
}
