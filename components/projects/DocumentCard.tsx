import { Eye, Download, Edit, FileText } from "lucide-react";

interface DocumentCardProps {
  document: {
    id: number;
    title: string;
    date: string;
    tags: string[];
    thumbnail: string;
  };
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <div className="bg-blue-100 rounded-lg overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-[4/4] bg-gray-800">
        {document.thumbnail ? (
          <img
            src={document.thumbnail}
            alt={document.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {/* Tags */}
        <div className="absolute top-2 left-2">
          {document.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mr-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Document Info */}
      <div className="p-3">
        <h3 className="text-black text-sm font-medium mb-1">
          {document.title}
        </h3>
        <p className="text-gray-400 text-xs mb-3">{document.date}</p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button className="text-gray-400 hover:text-black">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-black">
            <Edit className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-black">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
