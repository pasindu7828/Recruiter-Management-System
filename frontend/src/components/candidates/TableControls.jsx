import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, ChevronDown, Check } from 'lucide-react';

const statusOptions = ['All Status', 'Applied', 'Screening', 'Interview Scheduled', 'Interviewed', 'Offered', 'Hired', 'Rejected'];

const TableControls = ({ searchQuery, setSearchQuery, selectedStatus, setSelectedStatus }) => {
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex gap-3 mb-6 relative">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by name, email or position..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-sans text-sm" 
        />
      </div>
      
      {/* Status Dropdown */}
      <div className="relative min-w-[240px]" ref={dropdownRef}>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border rounded-xl transition-all shadow-sm ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2">
            <Filter size={18} className={isOpen ? 'text-indigo-500' : 'text-slate-400'} />
            <span className="font-semibold text-sm">Status: <span className="text-slate-900">{selectedStatus}</span></span>
          </div>
          <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="py-2 max-h-[300px] overflow-y-auto">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(status);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${selectedStatus === status ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {status}
                  {selectedStatus === status && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                       <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableControls;