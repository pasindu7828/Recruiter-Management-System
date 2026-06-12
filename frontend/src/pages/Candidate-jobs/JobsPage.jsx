import React, { useState } from 'react';
import useJobs from '../../hooks/useJobs';
import { Link } from 'react-router-dom';
import JobCard from '../../components/Candidate-Job/JobCard';
import JobFilters from '../../components/Candidate-Job/JobFilters';
import JobSearch from '../../components/Candidate-Job/JobSearch';
import Pagination from '../../components/Candidate-Job/Pagination';
import JobDetailsModal from '../../components/Candidate-Job/JobDetailsModal';
import { AlertCircle, Briefcase, Sparkles, Search } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const JobsPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    jobs,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    resetFilters,
  } = useJobs();

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  const handleClearSearch = () => {
    updateFilters({ search: '' });
  };

  const openJobDetails = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  if (error) {
    return (
      <>
        <Header role="candidate" active="Browse Jobs" />
        <div className="min-h-screen bg-white pt-[72px]">
          <div className="container mx-auto px-4 max-w-6xl py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="mx-auto mb-3 text-red-500" size={48} />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Jobs
              </h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header role="candidate" active="Browse Jobs" />

      <div className="min-h-screen bg-white pt-[72px]">
        {/* Minimal Hero Section */}
        <div className="py-16 px-6 border-b border-gray-100">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-gray-900 text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
              Find Your Dream Job
            </h1>
            <p className="text-gray-500 text-base md:text-lg mb-10 max-w-2xl mx-auto">
              Browse premium opportunities tailored for you across design, tech,
              and creative leadership.
            </p>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <JobSearch
                  searchValue={filters.search}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  variant="hero"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
          {/* Filter Bar */}
          <div className="mb-8">
            <JobFilters
              filters={filters}
              updateFilters={updateFilters}
              resetFilters={resetFilters}
            />
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-32 gap-4">
              <div className="w-12 h-12 border-2 border-gray-200 border-t-[#401A94] rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Fetching opportunities...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-lg p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Briefcase size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No matching jobs
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                We couldn't find any jobs matching your current filters. Try
                broadening your search.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-[#401A94] text-white rounded-lg text-sm font-medium hover:bg-[#321475] transition-colors"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-0 divide-y divide-gray-100">
                {jobs.map((job, index) => {
                  const { jsx: _jsx, ...cleanJob } = job;
                  return (
                    <div
                      key={cleanJob._id || index}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <JobCard job={cleanJob} onViewDetails={openJobDetails} />
                    </div>
                  );
                })}
              </div>

              {/* Minimal CTA Section */}
              {jobs.length >= 2 && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Sparkles size={24} className="text-[#401A94]" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Personalized Matches?
                        </h3>
                        <p className="text-sm text-gray-500">
                          Update your profile to get tailored job
                          recommendations
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="px-4 py-2 bg-[#401A94] text-white text-sm font-medium rounded-lg hover:bg-[#321475] transition-colors whitespace-nowrap"
                    >
                      Update Profile
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {!loading && jobs.length > 0 && (
            <div className="mt-8 pt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={changePage}
              />
            </div>
          )}
        </main>
      </div>

      <Footer />

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default JobsPage;
