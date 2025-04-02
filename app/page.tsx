"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, Check, ChevronDown, Filter, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  
  // Mock data for documents
  const documents = [
    { id: 1, title: "Newest Correspondent", type: "HY_Newdoc_Updated", date: "Aug 9, 2023", ref: "#1999", tags: ["Inbox", "Another Sample Tag"] },
    { id: 2, title: "Test Correspondent 1", type: "[Important] test post owner", date: "May 30, 2023", ref: "Invoice Test", tags: ["Inbox", "Tag 2"] },
    { id: 3, title: "taborates2", type: "", date: "Dec 11, 2022", ref: "Test User", tags: ["Inbox", "TagWithPartial"] },
    { id: 4, title: "Correspondent 9: Testing", type: "New Title Updated 2", date: "Oct 2, 2022", ref: "", tags: ["Inbox", "Tag 2"] },
    { id: 5, title: "Newest Correspondent", type: "Sample103.csv", date: "Oct 2, 2022", ref: "#15124123126", tags: ["Inbox", "Another Sample Tag"] },
    { id: 6, title: "Test Correspondent 1", type: "JAN_PPBK_ch_r29", date: "Oct 1, 2022", ref: "Invoice Test", tags: ["Inbox", "Test Tag"] },
    { id: 7, title: "InDesign 2022 Scripting", type: "Repl 1", date: "Jun 27, 2022", ref: "Invoice Test", tags: ["Just another tag", "Tag 1", "Tag 2", "Tag 3"] },
    { id: 8, title: "2sample-pdf-with-images", type: "", date: "Mar 27, 2022", ref: "Another Type", tags: ["Just another tag", "TagWithPartial"] },
  ];

  const toggleDocumentSelection = (id: number) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter(docId => docId !== id));
    } else {
      setSelectedDocuments([...selectedDocuments, id]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-14 md:w-64 bg-green-800 text-white flex flex-col">
        <div className="p-4 flex items-center justify-center md:justify-start">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Check className="h-5 w-5 text-green-800" />
          </div>
          <span className="ml-2 text-xl font-bold hidden md:block">Documents</span>
        </div>
        
        <nav className="flex-1 mt-6">
          <ul>
            <li className="px-4 py-2 hover:bg-green-700 cursor-pointer flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden md:block">Home</span>
            </li>
            <li className="px-4 py-2 hover:bg-green-700 cursor-pointer flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden md:block">Documents</span>
            </li>
            <li className="px-4 py-2 hover:bg-green-700 cursor-pointer flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden md:block">Calendar</span>
            </li>
            <li className="px-4 py-2 hover:bg-green-700 cursor-pointer flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4757 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.0409 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden md:block">Settings</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center w-full max-w-xl">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  type="search" 
                  placeholder="Search documents" 
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-500">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Document List */}
        <main className="flex-1 overflow-y-auto bg-white p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Documents</h1>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-sm">
                <span className="mr-2">Select</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-sm">
                <span className="mr-2">Views</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-sm">
                <span className="mr-2">Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-sm flex items-center">
                <span className="mr-2">Title & content</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="text-sm flex items-center">
                <span className="mr-2">Tags</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="text-sm flex items-center">
                <span className="mr-2">Correspondent</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="text-sm flex items-center">
                <span className="mr-2">Document type</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="text-sm flex items-center">
                <span className="mr-2">Storage path</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="text-sm flex items-center">
                <span className="mr-2">Created</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="text-sm flex items-center">
                <span className="mr-2">Added</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="text-sm flex items-center">
                <span className="mr-2">Permissions</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="text-sm text-blue-500">
              Reset filters
            </Button>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            64 documents
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  {/* Document Tags */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {doc.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className={`text-xs px-2 py-1 rounded-md ${
                          tag === 'Inbox' ? 'bg-blue-100 text-blue-800' : 
                          tag.includes('TagWithPartial') ? 'bg-purple-100 text-purple-800' :
                          tag === 'Another Sample Tag' ? 'bg-orange-100 text-orange-800' :
                          tag === 'Test Tag' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Document Preview */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  {/* Document Selection */}
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => toggleDocumentSelection(doc.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedDocuments.includes(doc.id) ? 'bg-green-500 text-white' : 'bg-white border border-gray-300'
                      }`}
                    >
                      {selectedDocuments.includes(doc.id) && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Document Info */}
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{doc.type}</p>
                  
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{doc.date}</span>
                    {doc.ref && <span>{doc.ref}</span>}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-3 flex justify-between">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}