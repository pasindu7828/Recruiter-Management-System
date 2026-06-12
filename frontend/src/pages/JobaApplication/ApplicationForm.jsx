//ApplicationForm.jsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CloudUpload, Link as LinkIcon, ArrowRight, FileText, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../api/api';

export function ApplicationForm() {
  const { id } = useParams();
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadOption, setUploadOption] = useState('new'); // 'new' or 'existing'
  const [selectedExistingCvId, setSelectedExistingCvId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    coverLetter: '',
    portfolioLink: '',
  });

  const existingCvs = [
    { id: 'cv-1', name: 'Software_Engineer_Resume_2025.pdf', size: 2.4 * 1024 * 1024, date: 'Oct 24, 2025' },
    { id: 'cv-2', name: 'Frontend_Developer_CV.pdf', size: 1.8 * 1024 * 1024, date: 'Nov 12, 2025' }
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.preventDefault();
    setResumeFile(null);
  };

  const removeExistingCv = (e) => {
    e.preventDefault();
    setSelectedExistingCvId(null);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id === 'phone' ? 'phoneNumber' : id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // The backend expects `resume` to be a string name of a resume in the user's profile.
    // For now we grab the mock name selected, or the new file name.
    const resumeStr = uploadOption === 'existing'
      ? (existingCvs.find(c => c.id === selectedExistingCvId)?.name || '')
      : (resumeFile?.name || '');

    if (!resumeStr) {
      toast.error('Please select or upload a resume');
      return;
    }

    try {
      setIsSubmitting(true);
      if (!id) {
        toast.error('No job ID found. Please go back and try again.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        jobPostId: id,
        resume: resumeStr,
        phoneNumber: formData.phoneNumber,
        coverLetter: formData.coverLetter,
        portfolioLink: formData.portfolioLink,
      };

      const response = await API.post('/applications/apply-job', payload);

      if (response.data.success || response.status === 201 || response.status === 200) {
        toast.success(response.data.message || 'Job applied successfully');
        // Reset form on success
        setFormData({ phoneNumber: '', coverLetter: '', portfolioLink: '' });
        setResumeFile(null);
        setSelectedExistingCvId(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 3xl:p-14 border border-gray-100">
      <h2 className="text-2xl 3xl:text-4xl font-bold text-gray-900 mb-8 3xl:mb-12">
        Apply for this position
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Personal Details Section */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-5 sm:p-6 3xl:p-10 space-y-5 3xl:space-y-8">
          <h3 className="text-[11px] 3xl:text-base font-bold tracking-widest text-indigo-600 uppercase">
            Personal Details
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                defaultValue="John Doe"
                readOnly
                className="block w-full rounded-lg border-gray-200 px-4 py-2.5 text-gray-500 bg-gray-100/50 shadow-sm sm:text-sm border outline-none transition-colors" />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue="john@example.com"
                readOnly
                className="block w-full rounded-lg border-gray-200 px-4 py-2.5 text-gray-500 bg-gray-100/50 shadow-sm sm:text-sm border outline-none transition-colors placeholder:text-gray-400" />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border outline-none transition-colors placeholder:text-gray-400" />
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Resume/CV
            </label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setUploadOption('new')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${uploadOption === 'new'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Upload New
              </button>
              <button
                type="button"
                onClick={() => setUploadOption('existing')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${uploadOption === 'existing'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Select Previous
              </button>
            </div>
          </div>

          {uploadOption === 'new' ? (
            !resumeFile ? (
              <label className="border-2 border-dashed border-indigo-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-indigo-50/50 transition-colors cursor-pointer group block w-full">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 mx-auto">
                  <CloudUpload className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Supported: PDF, DOCX (Max 10MB)
                </p>
              </label>
            ) : (
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
            )
          ) : (
            !selectedExistingCvId ? (
              <div className="space-y-3">
                {existingCvs.map(cv => (
                  <div
                    key={cv.id}
                    onClick={() => setSelectedExistingCvId(cv.id)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{cv.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                          <span>{(cv.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>Uploaded {cv.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 ml-4 group-hover:border-indigo-400">
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              (() => {
                const cv = existingCvs.find(c => c.id === selectedExistingCvId);
                return (
                  <div className="border border-indigo-200 rounded-xl p-4 flex items-center justify-between bg-indigo-50/30">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {cv.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                          <span>{(cv.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>Uploaded {cv.date}</span>
                        </div>
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
                );
              })()
            )
          )}
        </div>

        {/* Cover Letter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium text-gray-700">
              Cover Letter
            </label>
            <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
              Optional
            </span>
          </div>
          <textarea
            id="coverLetter"
            value={formData.coverLetter}
            onChange={handleInputChange}
            rows={4}
            placeholder="Share your story and why you are the perfect fit for Stripe..."
            className="block w-full rounded-lg border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border outline-none transition-colors placeholder:text-gray-400 resize-none" />
        </div>

        {/* Portfolio Link */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="portfolioLink"
              className="block text-sm font-medium text-gray-700">
              Portfolio Link
            </label>
            <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
              Optional
            </span>
          </div>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <LinkIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="url"
              id="portfolioLink"
              value={formData.portfolioLink}
              onChange={handleInputChange}
              placeholder="https://behance.net/johndoe"
              className="block w-full rounded-lg border-gray-200 pl-10 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border outline-none transition-colors placeholder:text-gray-400" />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#4c249f] hover:bg-[#3b1c7a] disabled:bg-[#4c249f]/70 disabled:cursor-not-allowed text-white rounded-full py-3.5 px-4 text-sm font-semibold shadow-lg shadow-indigo-900/20 transition-all hover:shadow-indigo-900/40 active:scale-[0.98]">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Footer Terms */}
        <p className="text-xs text-center text-gray-500 leading-relaxed px-4">
          By applying, you agree to our{' '}
          <a href="#" className="underline hover:text-gray-800">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-gray-800">
            Privacy Policy
          </a>
          . Your data will be processed securely.
        </p>
      </form>
    </div>
  );
}