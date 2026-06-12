import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const JobSearch = ({ searchValue, onSearch, onClear, variant = 'default' }) => {
  const [localValue, setLocalValue] = useState(searchValue || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onClear();
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder="Search by job title, skills, or company..."
            className="w-full pl-12 pr-32 py-4 text-base text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#401A94] focus:ring-1 focus:ring-[#401A94] transition-colors placeholder:text-gray-400"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {localValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-[#401A94] text-white text-sm font-medium rounded-md hover:bg-[#321475] transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative group/mini">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Search jobs..."
          className="w-full pl-9 pr-20 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md outline-none focus:border-[#401A94] focus:ring-1 focus:ring-[#401A94] transition-colors placeholder:text-gray-400"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1 bg-[#401A94] text-white text-xs font-medium rounded hover:bg-[#321475] transition-colors"
          >
            Go
          </button>
        </div>
      </div>
    </form>
  );
};

export default JobSearch;