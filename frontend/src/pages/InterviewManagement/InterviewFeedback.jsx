import React, { useState } from 'react';

const InterviewFeedback = ({ interview, onCancel, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [formData, setFormData] = useState({
    interviewerName: '',
    feedback: '',
    recommendation: ''
  });

  if (!interview) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.interviewerName || !formData.feedback || !formData.recommendation || !rating) {
      return;
    }

    onSubmit({ ...formData, rating, interviewId: interview.id });
  };

  const getRatingText = (val) => {
    switch (val) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'No rating';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Interview Feedback</h1>
        <p className="text-gray-500 text-sm font-medium">Provide your assessment and feedback for the candidate</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-8">Feedback Form</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Candidate Name</label>
            <input 
              type="text" 
              value={interview.name}
              readOnly
              className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-500 font-medium cursor-not-allowed"
            />
          </div>

          {/* Interviewer Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Interviewer Name</label>
            <input 
              type="text" 
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium"
              value={formData.interviewerName}
              onChange={(e) => setFormData({...formData, interviewerName: e.target.value})}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
            <div className="flex items-center gap-2">
              <div className="flex text-gray-300 text-xl gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`${
                      (hover || rating) >= star ? 'fas text-yellow-400' : 'far'
                    } fa-star cursor-pointer transition-colors duration-200`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  ></i>
                ))}
              </div>
              <span className={`text-sm ml-2 font-medium ${rating > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                {getRatingText(hover || rating)}
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Feedback</label>
            <textarea 
              placeholder="Provide detailed feedback about the candidate's performance, skills, and overall impression..."
              className="w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium h-48 resize-none"
              value={formData.feedback}
              onChange={(e) => setFormData({...formData, feedback: e.target.value})}
            ></textarea>
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Recommendation</label>
            <div className="relative">
              <select 
                className="appearance-none w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                value={formData.recommendation}
                onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
              >
                <option value="">Select recommendation</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button type="submit" disabled={!formData.interviewerName || !formData.feedback || !formData.recommendation || !rating} className="bg-[#311c6d] w-full sm:w-auto text-white px-10 py-3.5 rounded-lg font-bold hover:bg-[#201247] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              Submit Feedback
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

export default InterviewFeedback;