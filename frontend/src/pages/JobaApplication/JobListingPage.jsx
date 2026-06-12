import React from 'react';
import { JobDetails } from './JobDetails';
import { ApplicationForm } from './ApplicationForm';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export function JobListingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] font-sans">
      <Header active="Job Openings" role="candidate" />
      <main className="flex-1 py-8 sm:py-12 3xl:py-24 px-4 sm:px-6 lg:px-8 3xl:px-16 mt-16 sm:mt-20">
        <div className="w-full max-w-6xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 2xl:gap-12 3xl:gap-16 items-start">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-7">
              <JobDetails />
            </div>

            {/* Right Column - Application Form */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <ApplicationForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}