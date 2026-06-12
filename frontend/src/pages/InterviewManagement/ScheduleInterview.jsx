import React from 'react';
import API from '../../api/api';

const ScheduleInterview = ({ onCancel, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    candidateId: '',
    jobPostId: '',
    date: '',
    time: '',
    type: 'online',
    link: 'https://meet.company.com/interview',
    notes: ''
  });

  const [jobs, setJobs] = React.useState([]);
  const [candidates, setCandidates] = React.useState([]);
  const [loadingJobs, setLoadingJobs] = React.useState(false);
  const [loadingCandidates, setLoadingCandidates] = React.useState(false);

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

  React.useEffect(() => {
    const fetchCandidatesForJob = async () => {
      if (!formData.jobPostId) {
        setCandidates([]);
        return;
      }

      try {
        setLoadingCandidates(true);
        const { data } = await API.get(`/applications/job/${formData.jobPostId}/candidates`);

        const uniqueCandidates = Array.from(
          new Map(
            (data.applications || [])
              .filter((application) => application?.userId?._id)
              .map((application) => [application.userId._id, application.userId])
          ).values()
        );

        setCandidates(uniqueCandidates);
      } catch (error) {
        console.error('Error fetching candidates for selected job:', error);
        setCandidates([]);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidatesForJob();
  }, [formData.jobPostId]);

  const handleJobChange = (e) => {
    const selectedJobId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      jobPostId: selectedJobId,
      candidateId: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.candidateId || !formData.jobPostId) {
      alert('Please select a job and a candidate');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Schedule Interview</h1>
        <p className="text-gray-500 text-sm font-medium">Create a new interview schedule</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-8">Interview Details</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job and Candidate Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Job</label>
              <div className="relative">
                <select
                  className="appearance-none w-full px-4 py-3 pr-10 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                  value={formData.jobPostId}
                  onChange={handleJobChange}
                  disabled={loadingJobs}
                >
                  <option value="">{loadingJobs ? 'Loading jobs...' : 'Select a job'}</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.jobTitle || job.topic || 'Untitled Job'}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Candidate</label>
              <div className="relative">
                <select
                  className="appearance-none w-full px-4 py-3 pr-10 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  value={formData.candidateId}
                  onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                  disabled={!formData.jobPostId || loadingCandidates}
                >
                  <option value="">
                    {!formData.jobPostId
                      ? 'Select a job first'
                      : loadingCandidates
                        ? 'Loading candidates...'
                        : 'Select a candidate'}
                  </option>
                  {candidates.map((candidate) => (
                    <option key={candidate._id} value={candidate._id}>
                      {candidate.name || candidate.email || 'Unknown Candidate'}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
              </div>
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

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Link</label>
            <input 
              type="text" 
              placeholder="https://meet.company.com/interview"
              className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium disabled:opacity-70"
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              disabled={formData.type !== 'online'}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
            <textarea 
              placeholder="Add any additional notes or instructions..."
              className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium h-32 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button type="submit" className="bg-[#311c6d] w-full sm:w-auto text-white px-10 py-3.5 rounded-lg font-bold hover:bg-[#201247] transition shadow-md">
              Schedule Interview
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

export default ScheduleInterview;