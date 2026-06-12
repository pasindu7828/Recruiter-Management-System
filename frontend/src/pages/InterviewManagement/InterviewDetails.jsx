import React from 'react';

const InterviewDetails = ({ interview, onBack, onEdit, onAddFeedback, onDelete, role }) => {
  if (!interview) return null;

  const isCandidate = role === 'candidate';

  const getStatusStyles = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-[#e8fbf3] text-[#10b981]';
      case 'Pending': return 'bg-[#fff7ed] text-[#f59e0b]';
      case 'Rejected': return 'bg-[#fef2f2] text-[#ef4444]';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 px-4 sm:px-6 lg:px-8 py-8">
    
      <div className="flex flex-wrap items-center gap-4 mb-4 sm:mb-8">
        <button
          onClick={onBack}
          className="bg-[#ebedf1] text-gray-900 border border-gray-200 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition shadow-sm text-sm ml-auto"
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
      </div>
      {/* Details Card */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 sm:p-10 mb-8 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{interview.name}</h2>
            <p className="text-gray-400 text-lg font-medium">{interview.role}</p>
          </div>
          <span className={`px-5 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 border border-transparent ${getStatusStyles(interview.status)}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {interview.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 mb-10">
          {/* Interview Date */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
              <i className="far fa-calendar-alt text-xl"></i>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Interview Date</p>
              <p className="text-gray-900 font-bold text-lg">{interview.date}</p>
            </div>
          </div>

          {/* Interview Time */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
              <i className="far fa-clock text-xl"></i>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Interview Time</p>
              <p className="text-gray-900 font-bold text-lg">{interview.time}</p>
            </div>
          </div>

          {/* Interview Type */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
              <i className="fas fa-video text-xl"></i>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Interview Type</p>
              <p className="text-gray-900 font-bold text-lg">{interview.type}</p>
            </div>
          </div>

          {/* Hiring Manager */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
              <i className="far fa-user text-xl"></i>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Hiring Manager</p>
              <p className="text-gray-900 font-bold text-lg">{interview.manager}</p>
            </div>
          </div>

          {/* Meeting Link */}
          <div className="flex items-center gap-4 col-span-full">
            <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
              <i className="fas fa-video text-xl"></i>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Meeting Link</p>
              <a href="#" className="text-[#4b27a3] font-bold text-lg underline decoration-2 underline-offset-4 decoration-[#4b27a3]/30 hover:decoration-[#4b27a3]">
                https://meet.company.com/interview-001
              </a>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-[#f9fafc] rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <i className="far fa-file-alt text-[#4b27a3] text-xl"></i>
            <h3 className="font-bold text-gray-900">Notes</h3>
          </div>
          <p className="text-gray-500 font-medium leading-relaxed">
            Focus on React and TypeScript experience. Discuss previous projects.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {!isCandidate && (
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
          <button
            onClick={onEdit}
            className="bg-[#ebedf1] w-full sm:w-auto text-gray-900 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition shadow-sm text-sm"
          >
            <i className="far fa-edit"></i> Edit Interview
          </button>
          {/* <button
            onClick={onAddFeedback}
            className="bg-[#311c6d] w-full sm:w-auto text-white px-10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#201247] transition shadow-lg text-sm"
          >
            <i className="fas fa-briefcase"></i> Add Feedback
          </button> */}
          <button
            onClick={onDelete}
            className="bg-white w-full sm:w-auto text-red-500 border border-red-100 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition shadow-sm text-sm sm:ml-auto"
          >
            <i className="far fa-trash-alt"></i> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewDetails;
