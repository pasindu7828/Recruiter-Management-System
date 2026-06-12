import React from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock,
  Users,
  Briefcase
} from 'lucide-react';

const JobCard = ({ job, onViewDetails }) => {
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
      
      if (min && max) {
        return `${fallbackFormatter.format(min)} – ${fallbackFormatter.format(max)}`;
      } else if (min) {
        return `From ${fallbackFormatter.format(min)}`;
      } else if (max) {
        return `Up to ${fallbackFormatter.format(max)}`;
      }
      return 'Not specified';
    }
  };

  const formatSalaryPeriod = (period) => {
    if (!period) return '';
    return `/ ${period?.toLowerCase() || 'month'}`;
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
      case 'contract':
        return 'bg-yellow-50 text-yellow-600';
      case 'freelance':
        return 'bg-pink-50 text-pink-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const isDeadlinePassed = job.applicationDeadline ? new Date(job.applicationDeadline) < new Date() : false;
  const isClosingSoon = !isDeadlinePassed && job.applicationDeadline && 
    (new Date(job.applicationDeadline) - new Date()) < 3 * 24 * 60 * 60 * 1000;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    try {
      const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    } catch (error) {
      console.error('Error calculating days left:', error);
      return null;
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(job);
    }
  };

  return (
    <div 
      className="group bg-white border border-gray-200 hover:border-[#401A94] transition-all duration-200 cursor-pointer py-5 px-4 rounded-lg"
      onClick={handleViewDetails}
    >
      <div className="flex items-start gap-4">
        {/* Minimal icon */}
        <div className="flex-shrink-0">
          <Briefcase size={18} className="text-gray-400 group-hover:text-[#401A94] transition-colors" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title and badges row */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3 className="text-gray-900 font-semibold text-base group-hover:text-[#401A94] transition-colors">
              {job.jobTitle || 'Untitled Position'}
            </h3>
            {job.workArrangement && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${getWorkBadgeClass(job.workArrangement)}`}>
                {job.workArrangement}
              </span>
            )}
            {job.employmentType && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTypeBadgeClass(job.employmentType)}`}>
                {job.employmentType}
              </span>
            )}
          </div>

          {/* Location and department row */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {job.location || 'Remote'}
            </span>
            <span className="text-gray-300">•</span>
            <span>{job.department || 'General'}</span>
          </div>

          {/* Salary row  */}
          <div className="flex items-center gap-2 text-sm mb-3">
            <DollarSign size={14} className="text-gray-400" />
            <span className="text-gray-700 font-medium">
              {formatSalary(job.minSalary, job.maxSalary, job.currency)}
            </span>
            {job.payPeriod && (
              <span className="text-gray-400 text-xs">
                {formatSalaryPeriod(job.payPeriod)}
              </span>
            )}
          </div>

          {/* Skills  */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.requiredSkills.slice(0, 3).map((skill, index) => (
                <span key={index} className="text-xs text-gray-500">
                  {skill}{index < Math.min(2, job.requiredSkills.length - 1) ? ',' : ''}
                </span>
              ))}
              {job.requiredSkills.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{job.requiredSkills.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer with meta info and button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {job.publishDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(job.publishDate)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={12} />
                {job.openings || 1}
              </span>
              
              {job.applicationDeadline && (
                <>
                  {isClosingSoon && !isDeadlinePassed && (
                    <span className="text-red-500 font-medium">
                      Closing soon
                    </span>
                  )}
                  {!isClosingSoon && !isDeadlinePassed && getDaysLeft(job.applicationDeadline) !== null && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {getDaysLeft(job.applicationDeadline)}d left
                    </span>
                  )}
                  {isDeadlinePassed && (
                    <span className="text-gray-400">
                      Expired
                    </span>
                  )}
                </>
              )}
            </div>

            {/* View Details Button */}
            <button
              onClick={handleViewDetails}
              className="px-4 py-1.5 bg-[#401A94] text-white text-sm font-medium rounded hover:bg-[#321475] transition-colors whitespace-nowrap"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;