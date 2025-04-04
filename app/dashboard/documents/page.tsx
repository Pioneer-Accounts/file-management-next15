"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, Download, FileText, Edit, Search, X, ChevronDown, CalendarIcon } from "lucide-react";
import { format, isWithinInterval, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import "@/styles/calendar-override.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Documents() {
  // States for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Define our date range state to match the structure from react-day-picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const documents = [
    {
      id: 1,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 2,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 3,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 4,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 5,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    {
      id: 6,
      title: "testpic7",
      date: "Apr 3, 2025",
      tags: ["demo tag"],
      thumbnail: "/signup.jpg",
    },
    // Add more documents as needed
  ];

  // Extract all unique tags
  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)));

  // Filter documents based on search term and selected filters
  const filteredDocuments = documents.filter(doc => {
    // Title search filter
    const matchesSearch = searchTerm === "" || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tag filter
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => doc.tags.includes(tag));
    
    // Date range filter
    const docDate = new Date(doc.date);
    const matchesDate = 
      !dateRange || (!dateRange.from && !dateRange.to) || // No date range selected
      (dateRange.from && !dateRange.to && isSameDay(docDate, dateRange.from)) || // Only from date selected and matches
      (dateRange.from && dateRange.to && isWithinInterval(docDate, { start: dateRange.from, end: dateRange.to })); // Date is within range
    
    return matchesSearch && matchesTags && matchesDate;
  });

  // Filter tags based on search term in the dropdown
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Documents</h1>
      
      {/* Search and Filter Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-100 p-4 rounded-lg">
        {/* Search by title */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Tag Filter Dropdown */}
        <div className="relative" ref={tagDropdownRef}>
          <button
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-sm truncate">
              {selectedTags.length > 0 
                ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected` 
                : 'Filter by tags'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          
          {isTagDropdownOpen && (
            <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search tags"
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <div key={tag} className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                        <input
                          type="checkbox"
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="mr-2"
                        />
                        <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No tags found</div>
                  )}
                </div>
                
                {selectedTags.length > 0 && (
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{selectedTags.length} selected</span>
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Date Range Filter with Shadcn Calendar */}
        <div>
          <Popover>
            <div className="relative flex">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[300px] justify-start text-left font-normal ${!dateRange || !dateRange.from ? "text-muted-foreground" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange && dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              
              {/* Clear button outside of the main button */}
              {dateRange && (dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 z-10"
                  onClick={() => setDateRange(undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
                numberOfMonths={2}
                className="bg-white"
                classNames={{
                  day_range_start: "day-range-start !bg-blue-600 !text-white",
                  day_range_end: "day-range-end !bg-blue-600 !text-white",
                  day_selected: "!bg-blue-600 !text-white hover:!bg-blue-600",
                  day_range_middle: "!bg-blue-100 !text-blue-800 rounded-none",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has(.day-range-start)]:rounded-l-md [&:has(.day-range-end)]:rounded-r-md [&:has(.day-selected)]:bg-blue-100"
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            {/* Thumbnail */}
            <div className="relative aspect-[4/4] bg-gray-800">
              {doc.thumbnail ? (
                <img
                  src={doc.thumbnail}
                  alt={doc.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {/* Tags */}
              <div className="absolute top-2 left-2">
                {doc.tags.map((tag, index) => (
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
              <h3 className="text-white text-sm font-medium mb-1">
                {doc.title}
              </h3>
              <p className="text-gray-400 text-xs mb-3">{doc.date}</p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-white">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
