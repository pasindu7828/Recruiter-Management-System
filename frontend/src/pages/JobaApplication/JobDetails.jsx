//JobDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Bookmark,
  Briefcase,
  Globe,
  DollarSign,
  CheckCircle,
  Loader
} from 'lucide-react';
import API from '../../api/api';

export function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        // Temporary fallback to specific ID if user directly visits a path without an ID
        // Note: this uses the specific ID requested by user
        if (!id) {
          setError('No job ID provided.');
          setLoading(false);
          return;
        }
        const response = await API.get(`/jobs/${id}`);
        if (response.data.success) {
          setJob(response.data.job);
        } else {
          setError(response.data.message || 'Job not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 font-medium text-lg">{error || 'Job not found'}</p>
      </div>
    );
  }

  const requirements = job.requirements || [];
  const responsibilities = job.keyResponsibilities || job.responsibilities || [];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 3xl:p-14 border border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.jobTitle} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">
                  {(job.department && job.department.charAt(0)) || (job.jobTitle && job.jobTitle.charAt(0)) || 'J'}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl 3xl:text-5xl font-bold text-gray-900 tracking-tight">
                {job.jobTitle}
              </h1>
              <p className="text-gray-500 mt-1.5 3xl:mt-3 font-medium 3xl:text-2xl">
                {job.department || 'General Department'} · {job.location || 'Remote / Flexible'}
              </p>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-indigo-600 transition-colors p-2 -mt-2 -mr-2 rounded-full hover:bg-indigo-50"
            aria-label="Save job">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          {job.employmentType && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-gray-900 text-white shadow-sm">
              <Briefcase className="w-4 h-4" /> {job.employmentType}
            </span>
          )}
          {job.workArrangement && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-green-500 text-white shadow-sm">
              <Globe className="w-4 h-4" /> {job.workArrangement}
            </span>
          )}
          {(job.minSalary || job.maxSalary) && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border border-indigo-200 bg-indigo-50 text-indigo-700">
              <DollarSign className="w-4 h-4" />
              {job.minSalary && job.maxSalary ? `${job.minSalary} – ${job.maxSalary}` : job.minSalary || job.maxSalary} {job.currency || ''}
            </span>
          )}
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 3xl:p-14 border border-gray-100">
        <h2 className="text-xl 3xl:text-3xl font-bold text-gray-900 mb-4 3xl:mb-8">
          Job Description
        </h2>
        <p className="text-gray-600 leading-relaxed mb-8 3xl:mb-12 3xl:text-2xl 3xl:leading-loose whitespace-pre-line">
          {job.roleOverview || job.description || 'No description provided.'}
        </p>

        <h2 className="text-xl 3xl:text-3xl font-bold text-gray-900 mb-5 3xl:mb-8">Requirements</h2>
        <ul className="space-y-4 mb-8">
          {Array.isArray(requirements) ? requirements.map((item, i) =>
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-white fill-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 leading-relaxed 3xl:text-2xl 3xl:leading-loose">{item}</span>
            </li>
          ) : (
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-white fill-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 leading-relaxed 3xl:text-2xl 3xl:leading-loose">{requirements}</span>
            </li>
          )}
        </ul>

        <h2 className="text-xl 3xl:text-3xl font-bold text-gray-900 mb-5 3xl:mb-8">
          Responsibilities
        </h2>
        <ul className="space-y-4">
          {Array.isArray(responsibilities) ? responsibilities.map((item, i) =>
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-white fill-indigo-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 leading-relaxed 3xl:text-2xl 3xl:leading-loose">{item}</span>
            </li>
          ) : (
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-white fill-indigo-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 leading-relaxed 3xl:text-2xl 3xl:leading-loose">{responsibilities}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}