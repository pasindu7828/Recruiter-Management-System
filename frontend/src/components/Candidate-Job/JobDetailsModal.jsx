import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Tag, 
  Users, 
  GraduationCap,
  CheckCircle2,
  Send
} from 'lucide-react';

const JobDetailsModal = ({ job, isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return 'Not specified';
    
    let cleanCurrency = currency || 'USD';
    if (cleanCurrency.includes('/')) {
      cleanCurrency = cleanCurrency.split('/')[0].trim();
    }
    
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'NZD', 'SGD', 'HKD'];
    if (!validCurrencies.includes(cleanCurrency)) {
      cleanCurrency = 'USD';
    }

    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: cleanCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      if (min && max) {
        return `${formatter.format(min)} – ${formatter.format(max)}`;
      } else if (min) {
        return `From ${formatter.format(min)}`;
      } else if (max) {
        return `Up to ${formatter.format(max)}`;
      }
      return 'Not specified';
    } catch (error) {
      console.error('Error formatting salary:', error);
      const fallbackFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      if (min && max) return `${fallbackFormatter.format(min)} – ${fallbackFormatter.format(max)}`;
      return 'Not specified';
    }
  };

  const formatSalaryPeriod = (period) => {
    if (!period) return '';
    return `/ ${period?.toLowerCase() || 'month'}`;
  };

  const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not specified';
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Not specified';
    }
  };

  const getWorkBadgeClass = (arrangement) => {
    switch (arrangement?.toLowerCase()) {
      case 'remote':
        return 'bg-blue-50 text-blue-600';
      case 'hybrid':
        return 'bg-teal-50 text-teal-600';
      case 'on-site':
        return 'bg-orange-50 text-orange-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time':
        return 'bg-purple-50 text-purple-600';
      case 'part-time':
        return 'bg-green-50 text-green-600';
      case 'contract':
        return 'bg-yellow-50 text-yellow-600';
      case 'internship':
        return 'bg-pink-50 text-pink-600';
      case 'freelance':
        return 'bg-indigo-50 text-indigo-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const isDeadlinePassed = job.applicationDeadline ? new Date(job.applicationDeadline) < new Date() : false;
  const daysRemaining = !isDeadlinePassed && job.applicationDeadline
    ? Math.max(0, Math.ceil((new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleApplyNow = () => {
    onClose();
    navigate(`/job_application/${job._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop  */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
          {/* Header  */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {job.jobTitle}
                </h2>
                <p className="text-sm text-gray-500">
                  {job.department || 'General Department'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content  */}
          <div className="p-6">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-2">
                  <DollarSign size={14} />
                  <span>Salary Range</span>
                </div>
                <p className="font-medium text-gray-900">
                  {formatSalary(job.minSalary, job.maxSalary, job.currency)}
                  {job.payPeriod && (
                    <span className="text-gray-500 text-sm ml-1">
                      {formatSalaryPeriod(job.payPeriod)}
                    </span>
                  )}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-2">
                  <MapPin size={14} />
                  <span>Location</span>
                </div>
                <p className="font-medium text-gray-900">
                  {job.location || 'Remote / Flexible'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-2">
                  <Users size={14} />
                  <span>Openings</span>
                </div>
                <p className="font-medium text-gray-900">
                  {job.openings || 1} position{job.openings !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-2">
                  <Clock size={14} />
                  <span>Deadline</span>
                </div>
                <p className={`font-medium ${isDeadlinePassed ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {isDeadlinePassed ? 'Expired' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
                </p>
              </div>
            </div>

            {/* Badges  */}
            <div className="flex flex-wrap gap-2 mb-8">
              {job.workArrangement && (
                <span className={`px-3 py-1 rounded text-xs font-medium ${getWorkBadgeClass(job.workArrangement)}`}>
                  {job.workArrangement}
                </span>
              )}
              {job.employmentType && (
                <span className={`px-3 py-1 rounded text-xs font-medium ${getTypeBadgeClass(job.employmentType)}`}>
                  {job.employmentType}
                </span>
              )}
              {job.experienceLevel && (
                <span className="px-3 py-1 rounded text-xs font-medium bg-[#401A94]/5 text-[#401A94]">
                  {job.experienceLevel}
                </span>
              )}
            </div>

            {/* Job Details Sections */}
            <div className="space-y-8">
              {/* Role Overview */}
              {job.roleOverview && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase size={16} className="text-[#401A94]" />
                    Role Overview
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {job.roleOverview}
                  </p>
                </div>
              )}

              {/* Key Responsibilities */}
              {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#401A94]" />
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {job.keyResponsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#401A94] mt-2"></span>
                        <span className="text-gray-600 text-sm">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <GraduationCap size={16} className="text-[#401A94]" />
                    Requirements
                  </h3>
                  <div className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600 text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Skills */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-[#401A94]" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button 
                onClick={handleApplyNow}
                disabled={isDeadlinePassed}
                className={`w-full py-2.5 rounded transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                  isDeadlinePassed
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#401A94] text-white hover:bg-[#321475]'
                }`}
              >
                <Send size={16} />
                {isDeadlinePassed ? 'Application Closed' : 'Apply Now'}
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-center text-xs text-gray-400">
              <p>Posted on {formatDate(job.publishDate, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;