// InterviewDetailsModal.jsx
import React from 'react';
import { X, Calendar, Clock, Video, User, FileText as FileTextIcon } from 'lucide-react';

const InterviewDetailsModal = ({ interview, onClose }) => {
  if (!interview) return null;

  const getStatusStyles = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'bg-[#e8fbf3] text-[#10b981]';
      case 'pending': return 'bg-[#fff7ed] text-[#f59e0b]';
      case 'rejected': return 'bg-[#fef2f2] text-[#ef4444]';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>

        <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          {/* Header with Back button */}
          <div className="flex flex-wrap items-center gap-4 mb-4 sm:mb-8">
            <button
              onClick={onClose}
              className="bg-[#ebedf1] text-gray-900 border border-gray-200 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition shadow-sm text-sm sm:text-base ml-auto"
            >
              <span>←</span> Back
            </button>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-8 sm:mb-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{interview.name}</h2>
                <p className="text-gray-400 text-sm sm:text-base font-medium">{interview.role}</p>
              </div>
              <span className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 border border-transparent ${getStatusStyles(interview.status)}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {interview.status || 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 mb-10">
              {/* Interview Date */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Interview Date</p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">{interview.date}</p>
                </div>
              </div>

              {/* Interview Time */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Interview Time</p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">{interview.time}</p>
                </div>
              </div>

              {/* Interview Type */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <Video size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Interview Type</p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base capitalize">{interview.type || 'Video Call'}</p>
                </div>
              </div>

              {/* Hiring Manager */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Hiring Manager</p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">{interview.manager || 'HR Team'}</p>
                </div>
              </div>

              {/* Meeting Link */}
              <div className="flex items-center gap-4 col-span-full">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <Video size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Meeting Link</p>
                  <a 
                    href="#" 
                    className="text-[#4b27a3] font-bold text-sm sm:text-base hover:underline break-all"
                  >
                    https://meet.company.com/interview-{interview.id}
                  </a>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-[#f9fafc] rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <FileTextIcon size={20} className="text-[#4b27a3]" />
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">Notes</h3>
              </div>
              <p className="text-gray-500 text-sm sm:text-base font-medium leading-relaxed">
                {interview.notes || 'Focus on React and TypeScript experience. Discuss previous projects.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailsModal;