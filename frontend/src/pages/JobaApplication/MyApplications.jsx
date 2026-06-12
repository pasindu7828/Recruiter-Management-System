import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  X,
  Loader2,
  FileText,
  Link as LinkIcon,
  CloudUpload
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../api/api';
import Layout from './../../components/layout/Layout';

export function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedApp, setSelectedApp] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    coverLetter: '',
    portfolioLink: '',
    resume: '' // Keeping track of the string
  });

  const fetchApplications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await API.get(`/applications/getMyAll?page=${pageNum}&limit=10`);
      setApplications(response.data.applications);
      setTotalPages(response.data.pages);
      setPage(response.data.page);
      console.log("applications", response.data.applications);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
      toast.error(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(page);
  }, [page]);

  const openEditModal = (app) => {
    setSelectedApp(app);
    setFormData({
      phoneNumber: app.phoneNumber || '',
      coverLetter: app.coverLetter || '',
      portfolioLink: app.portfolioLink || '',
      resume: app.resume || ''
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedApp(null);
    setResumeFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setResumeFile(file);
      setFormData(prev => ({ ...prev, resume: file.name }));
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    setFormData(prev => ({ ...prev, resume: '' }));
  };

  const removeExistingCv = () => {
    setFormData(prev => ({ ...prev, resume: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setIsUpdating(true);
      const payload = { ...formData };

      const response = await API.put(`/applications/edit/${selectedApp.jobPostId?._id || selectedApp.jobPostId}`, payload);

      if (response.status === 200) {
        toast.success(response.data.message || 'Application updated successfully');
        // Update the application in the local state
        setApplications(apps => apps.map(app =>
          app._id === selectedApp._id
            ? { ...app, ...formData }
            : app
        ));
        closeEditModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (jobPostId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await API.delete(`/applications/delete/${jobPostId}`);
      if (response.status === 200) {
        toast.success('Application deleted successfully');
        // Remove from list
        setApplications(apps => apps.filter(app => (app.jobPostId?._id || app.jobPostId) !== jobPostId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          My Applications
        </h1>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500">When you apply for jobs, they will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={app.jobPostId?.jobTitle}>
                      {app.jobPostId?.jobTitle || 'Unknown Position'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      Applied {formatDate(app.createdAt)}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${app.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                    app.status === 'Interview Scheduled' ? 'bg-green-50 text-green-700 border border-green-100' :
                      app.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                    {app.status || 'Pending'}
                  </span>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {app.jobPostId?.endDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      Deadline: {formatDate(app.jobPostId.endDate)}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    CV: {app.resume || 'Not specified'}
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-50">
                  <button
                    onClick={() => openEditModal(app)}
                    disabled={!app.jobPostId}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!app.jobPostId ? "Cannot edit: Job posting has been removed" : "Edit Application"}
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => app.jobPostId && handleDelete(app.jobPostId?._id || app.jobPostId)}
                    disabled={isDeleting || !app.jobPostId}
                    className="flex items-center justify-center p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!app.jobPostId ? "Cannot delete: Job posting has been removed" : "Delete Application"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination component if needed */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Edit Application
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="edit-app-form" onSubmit={handleUpdate} className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-200 px-4 py-2 border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume / CV
                    </label>
                    {!formData.resume ? (
                      <label className="border-2 border-dashed border-indigo-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-indigo-50/50 transition-colors cursor-pointer group block w-full">
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 mx-auto">
                          <CloudUpload className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          Supported: PDF, DOCX (Max 10MB)
                        </p>
                      </label>
                    ) : resumeFile ? (
                      <div className="border border-indigo-200 rounded-xl p-4 flex items-center justify-between bg-indigo-50/30">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {resumeFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                          title="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="border border-indigo-200 rounded-xl p-4 flex items-center justify-between bg-indigo-50/30">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {formData.resume}
                            </p>
                            <p className="text-xs text-gray-500">
                              Currently Submitted
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeExistingCv}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                          title="Remove selection"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Your CV filename must match an existing file in your profile
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter
                    </label>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      rows={4}
                      className="block w-full rounded-lg border-gray-200 px-4 py-2 border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio Link
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="portfolioLink"
                        value={formData.portfolioLink}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border-gray-200 pl-10 px-4 py-2 border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-app-form"
                  disabled={isUpdating}
                  className="flex justify-center items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-70 gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
