// ApplicationDetailsModal.jsx
import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  Briefcase,
  FileText,
  Mail,
  Phone,
  Globe,
  Download,
  Loader,
  ExternalLink,
} from 'lucide-react';
import { cvService } from '../../services/recruiterDashboardService';
import toast from 'react-hot-toast';

const ApplicationDetailsModal = ({ application, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);

  if (!application) return null;

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-700';
      case 'Screening':
        return 'bg-purple-100 text-purple-700';
      case 'Interview Scheduled':
        return 'bg-green-100 text-green-700';
      case 'Interviewed':
        return 'bg-yellow-100 text-yellow-700';
      case 'Offered':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
// In ApplicationDetailsModal.jsx
const handleDownloadResume = async () => {
  if (!application.id) {
    toast.error('No application ID found');
    return;
  }

  setDownloading(true);
  try {
    await cvService.downloadResume(
      application.id,  // Pass application ID instead of resume path
      application.candidateName,
      application.jobTitle,
    );
  } catch (error) {
    console.error('Download error:', error);
  } finally {
    setDownloading(false);
  }
};

const handleViewResume = () => {
  if (!application.id) {
    toast.error('No application ID available');
    return;
  }
  
  setViewing(true);
  cvService.viewResume(application.id);
  setTimeout(() => setViewing(false), 1000);
};

  const hasResume = !!application.resume;

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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Application Details
              </h2>
              <p className="text-gray-400 text-sm">
                Review candidate information and application
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-[#ebedf1] text-gray-900 border border-gray-200 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition shadow-sm text-sm sm:text-base"
            >
              <span>←</span> Back
            </button>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 sm:p-10">
            {/* Header with Name and Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-8 sm:mb-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {application.candidateName}
                </h2>
                <p className="text-gray-400 text-sm sm:text-base font-medium">
                  {application.jobTitle}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 border border-transparent ${getStatusStyles(application.status)}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {application.status}
                </span>
              </div>
            </div>

            {/* Application Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 mb-10">
              {/* Candidate Name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    Candidate Name
                  </p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">
                    {application.candidateName}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    Email Address
                  </p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base break-all">
                    {application.candidateEmail}
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              {application.phoneNumber && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium">
                      Phone Number
                    </p>
                    <p className="text-gray-900 font-bold text-sm sm:text-base">
                      {application.phoneNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* Applied Date */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    Applied Date
                  </p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">
                    {formatDate(application.appliedDate)}
                  </p>
                </div>
              </div>

              {/* Job Position */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    Position Applied
                  </p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">
                    {application.jobTitle}
                  </p>
                </div>
              </div>

              {/* Portfolio Link */}
              {application.portfolioLink && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium">
                      Portfolio
                    </p>
                    <a
                      href={
                        application.portfolioLink.startsWith('http')
                          ? application.portfolioLink
                          : `https://${application.portfolioLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4b27a3] font-bold text-sm sm:text-base hover:underline break-all flex items-center gap-1"
                    >
                      {application.portfolioLink}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}

              {/* Resume/CV */}
              <div className="flex items-center gap-4 md:col-span-2">
                <div className="w-12 h-12 bg-[#f0effb] rounded-xl flex items-center justify-center text-[#4b27a3]">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    Resume / CV
                  </p>
                  {hasResume ? (
                    <div className="flex flex-wrap gap-3 mt-1">
                      <button
                        onClick={handleDownloadResume}
                        disabled={downloading}
                        className="text-[#4b27a3] font-bold text-sm sm:text-base hover:underline flex items-center gap-2 bg-[#f0effb] px-4 py-2 rounded-lg transition-colors hover:bg-[#e5e2fa] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Download Resume
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleViewResume}
                        disabled={viewing}
                        className="text-gray-600 font-bold text-sm sm:text-base hover:text-[#4b27a3] flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50"
                      >
                        {viewing ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Opening...
                          </>
                        ) : (
                          <>
                            <ExternalLink size={16} />
                            View Resume
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base font-medium">
                      No resume uploaded
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Letter Section */}
            {application.coverLetter && (
              <div className="bg-[#f9fafc] rounded-2xl p-6 border border-gray-100 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText size={20} className="text-[#4b27a3]" />
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                    Cover Letter
                  </h3>
                </div>
                <div className="text-gray-500 text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {application.coverLetter}
                </div>
              </div>
            )}

            {/* Interview Details */}
            {application.interview && (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base sm:text-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Interview Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">
                      Date
                    </p>
                    <p className="text-gray-900 font-bold text-sm sm:text-base">
                      {application.interview.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">
                      Time
                    </p>
                    <p className="text-gray-900 font-bold text-sm sm:text-base">
                      {application.interview.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">
                      Type
                    </p>
                    <p className="text-gray-900 font-bold text-sm sm:text-base capitalize">
                      {application.interview.type}
                    </p>
                  </div>
                  {application.interview.meetingLink && (
                    <div className="col-span-full">
                      <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">
                        Meeting Link
                      </p>
                      <a
                        href={application.interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4b27a3] font-bold text-sm sm:text-base hover:underline break-all flex items-center gap-1"
                      >
                        {application.interview.meetingLink}
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;