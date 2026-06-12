import React from 'react';
import API from '../../api/api';

const EditInterview = ({ interview, onCancel, onSubmit }) => {
  const buildInitialState = React.useCallback((sourceInterview) => ({
    ...sourceInterview,
    jobPostId: sourceInterview?.jobPostId || '',
    type: sourceInterview?.type || 'online',
    link: sourceInterview?.link || sourceInterview?.meetingLink || '',
    notes: sourceInterview?.notes || '',
    manager: sourceInterview?.manager || '',
    date: sourceInterview?.date || '',
    time: sourceInterview?.time || ''
  }), []);

  const [jobs, setJobs] = React.useState([]);
  const [loadingJobs, setLoadingJobs] = React.useState(false);
  const [formData, setFormData] = React.useState(buildInitialState(interview));

  if (!interview) return null;

  React.useEffect(() => {
    setFormData(buildInitialState(interview));
  }, [interview, buildInitialState]);

  React.useEffect(() => {
    const fetchRecruiterJobs = async () => {
      try {
        setLoadingJobs(true);
        const { data } = await API.get('/jobs/recruiter/my-jobs?limit=100');
        setJobs(data.jobs || []);
      } catch (error) {
        console.error('Error fetching recruiter jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchRecruiterJobs();
  }, []);

  const selectedJobTitle = React.useMemo(() => {
    const selectedJob = jobs.find((job) => job._id === formData.jobPostId);
    return selectedJob?.jobTitle || selectedJob?.topic || selectedJob?.position || formData.role || '';
  }, [jobs, formData.jobPostId, formData.role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      role: selectedJobTitle
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Interview</h1>
        <p className="text-gray-500 text-sm font-medium">Update interview details</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-8">Interview Details</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Candidate Name</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Job Position */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Job Position</label>
            <div className="relative">
              <select
                className="appearance-none w-full px-4 py-3 pr-10 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                value={formData.jobPostId || ''}
                onChange={(e) => {
                  const selectedJob = jobs.find((job) => job._id === e.target.value);
                  setFormData({
                    ...formData,
                    jobPostId: e.target.value,
                    role: selectedJob?.jobTitle || selectedJob?.topic || selectedJob?.position || formData.role
                  });
                }}
                disabled={loadingJobs}
              >
                <option value="">{loadingJobs ? 'Loading jobs...' : 'Select a job'}</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.jobTitle || job.topic || job.position || 'Untitled Job'}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Interview Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Interview Time</label>
              <input 
                type="time" 
                className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Interview Type</label>
            <div className="relative">
              <select 
                className="appearance-none w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="online">Online</option>
                <option value="physical">Physical</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
            </div>
          </div>

          {/* Hiring Manager */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hiring Manager</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium"
                value={formData.manager}
                onChange={(e) => setFormData({...formData, manager: e.target.value})}
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Link</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium"
              value={formData.link || 'https://meet.company.com/interview-001'}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
            <textarea 
              className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium h-32 resize-none"
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button type="submit" className="bg-[#311c6d] w-full sm:w-auto text-white px-10 py-3.5 rounded-lg font-bold hover:bg-[#201247] transition shadow-md">
              Update Interview
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-[#ebedf1] w-full sm:w-auto text-gray-900 px-14 py-3.5 rounded-lg font-bold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInterview;
