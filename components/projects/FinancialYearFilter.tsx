import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface FinancialYearFilterProps {
  selectedYear: string;
  onYearSelect: (year: string) => void;
}

export default function FinancialYearFilter({
  selectedYear,
  onYearSelect,
}: FinancialYearFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const financialYears = generateFinancialYears();
  
  // Filter financial years based on search term
  const filteredFinancialYears = financialYears.filter((year) =>
    year.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm truncate">
          {selectedYear || "Select Financial Year"}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search years..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchTerm && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
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
                    selectedYear === year ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    onYearSelect(year);
                    setIsDropdownOpen(false);
                  }}
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

          {selectedYear && (
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-end px-2 pb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onYearSelect("");
                  setIsDropdownOpen(false);
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
  );
}