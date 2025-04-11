"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const domain = process.env.NEXT_PUBLIC_API_URL


interface Tag {
  id: number;
  name: string;
  color: string;
}

interface TagSelectProps {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
}

export function TagSelect({ selectedTags, setSelectedTags }: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6"); // Default blue color

  // Fetch tags from API
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const url = search ? `${domain}/tags/?search=${encodeURIComponent(search)}` : `${domain}/tags/`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(() => {
      fetchTags();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Create a new tag
  const createTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch(`${domain}/tags/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });

      if (!response.ok) throw new Error("Failed to create tag");
      
      const newTag = await response.json();
      setTags((prev) => [...prev, newTag]);
      setSelectedTags((prev) => [...prev, newTag.name]);
      
      // Reset form
      setNewTagName("");
      setNewTagColor("#3B82F6");
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  // Toggle tag selection
  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  // Remove a tag from selection
  const removeTag = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTags.length > 0 ? (
              <span className="text-sm truncate">
                {selectedTags.length} tag{selectedTags.length > 1 ? "s" : ""} selected
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Filter by tags</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-white text-black shadow-md">
          <Command>
            <CommandInput 
              placeholder="Search tags..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <p className="py-2 text-center text-sm">Loading tags...</p>
                ) : (
                  <div className="flex items-center p-2 border-t">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Plus className="mr-1 h-3 w-3" />
                          Create new tag
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Tag</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="tag-name">Tag Name</Label>
                            <Input
                              id="tag-name"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              placeholder="Enter tag name"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Tag Color</Label>
                            <HexColorPicker 
                              color={newTagColor} 
                              onChange={setNewTagColor} 
                              className="w-full" 
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <div 
                                className="w-6 h-6 rounded-full border" 
                                style={{ backgroundColor: newTagColor }}
                              />
                              <Input
                                value={newTagColor}
                                onChange={(e) => setNewTagColor(e.target.value)}
                                className="w-28"
                              />
                            </div>
                          </div>
                          <Button onClick={createTag}>Create Tag</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => toggleTag(tag.name)}
                  >
                    <div className="flex items-center w-full">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedTags.includes(tag.name) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="flex items-center p-2 border-t">
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Plus className="mr-1 h-3 w-3" />
                    Create new tag
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tagName) => {
            const tag = tags.find((t) => t.name === tagName);
            return (
              <Badge 
                key={tagName} 
                style={{ 
                  backgroundColor: tag?.color || "#3B82F6",
                  color: getContrastColor(tag?.color || "#3B82F6")
                }}
                className="px-2 py-1"
              >
                {tagName}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={(e) => removeTag(tagName, e)}
                />
              </Badge>
            );
          })}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setSelectedTags([])}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to determine text color based on background color
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}