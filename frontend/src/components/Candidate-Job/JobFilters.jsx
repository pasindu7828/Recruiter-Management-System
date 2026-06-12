import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

const JobFilters = ({ filters, updateFilters, resetFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = {
    departments: [
      'Engineering',
      'Design',
      'Marketing',
      'Sales',
      'HR',
      'Finance',
      'Operations',
      'Product',
    ],
    employmentTypes: [
      'Full-time',
      'Part-time',
      'Contract',
      'Internship',
      'Temporary',
      'Freelance',
    ],
    workArrangements: ['Remote', 'On-site', 'Hybrid'],
  };

  const activeCount = Object.values(filters).filter(
    (v) => v && v !== '',
  ).length;

  const updateFilter = (key, value) => {
    updateFilters({ [key]: value === filters[key] ? '' : value });
  };

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Responsive Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Filter size={16} />
        <span className="hidden sm:inline">Filters</span>
        <span className="sm:hidden">Filter</span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 bg-[#401A94] text-white rounded-full text-xs">
            {activeCount}
          </span>
        )}
      </button>

      {/* Responsive Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[90%] sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl shadow-xl z-50">
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                Filters
                {activeCount > 0 && (
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    ({activeCount} active)
                  </span>
                )}
              </h3>
              <div className="flex gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setIsOpen(false);
                    }}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filters Content  */}
            <div className="p-4 sm:p-5 space-y-5 max-h-[calc(100vh-180px)] sm:max-h-[70vh] overflow-y-auto">
              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={filters.department || ''}
                  onChange={(e) => updateFilter('department', e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:border-[#401A94] focus:ring-1 focus:ring-[#401A94] outline-none transition-colors text-sm"
                >
                  <option value="">All Departments</option>
                  {filterOptions.departments.map((dept) => (
                    <option key={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Employment Type  */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filterOptions.employmentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateFilter('employmentType', type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.employmentType === type
                          ? 'bg-[#401A94] text-white shadow-sm'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Arrangement  */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Arrangement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {filterOptions.workArrangements.map((arr) => (
                    <button
                      key={arr}
                      onClick={() => updateFilter('workArrangement', arr)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.workArrangement === arr
                          ? 'bg-[#401A94] text-white shadow-sm'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {arr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Range  */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Salary
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filters.minSalary || ''}
                      onChange={(e) =>
                        updateFilter('minSalary', e.target.value)
                      }
                      placeholder="Min"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#401A94] focus:ring-1 focus:ring-[#401A94] outline-none transition-colors text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filters.maxSalary || ''}
                      onChange={(e) =>
                        updateFilter('maxSalary', e.target.value)
                      }
                      placeholder="Max"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#401A94] focus:ring-1 focus:ring-[#401A94] outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Enter amount in your local currency
                </p>
              </div>
            </div>

            {/* Footer  */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white rounded-b-2xl sm:rounded-b-xl">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-[#401A94] text-white rounded-lg font-medium hover:bg-[#321475] transition-colors text-sm sm:text-base"
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobFilters;
