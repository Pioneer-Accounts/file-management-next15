import { FileText } from "lucide-react";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-4 rounded-md ${project.color}`}>
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
      </div>
    </div>
  );
}
