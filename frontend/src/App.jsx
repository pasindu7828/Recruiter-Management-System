import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import InterviewManagement from "./pages/InterviewManagement/InterviewManagement";
import NotificationPage from "./pages/Notification";
import { SignInPage } from "./pages/login/signinPage";
import { SignUpPage } from "./pages/login/signUpPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import RecruiterManagerDashboard from "./pages/dashboards/RecruiterManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement/UserManagement";
import JobDashboard from "./pages/JobManagement/JobDashbard";
import JobDetail from "./pages/JobManagement/JobDetail";
import PostJob from "./pages/JobManagement/JobPost";
import RecruiterDashboard from "./pages/RecruiterDashboard/RecruiterDashboard";
import InterviewFeedback from "./pages/InterviewFeedback";
import CandidateDashboard from "./pages/dashboards/CandidateDashboard";
import { JobListingPage } from './pages/JobaApplication/JobListingPage';
import { MyApplications } from './pages/JobaApplication/MyApplications';
import ApplicationStatus from "./pages/ApplicationStatus/index.jsx"; 
import CandidateListPage from "./pages/candidate/CandidateListPage";
import JobsPage from "./pages/Candidate-jobs/JobsPage";
import CVRanking from "./pages/cv score/CVRanking";

import "./App.css";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Router>
        <Routes>
          {/* Default Route: Redirect to Login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Auth Routes */}
          <Route path="/login" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Common Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationPage />} />

          {/* Dashboards */}
          <Route path="/manager/dashboard" element={<RecruiterManagerDashboard />} />
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Job & Application Management */}
          <Route path="/jobs" element={<JobDashboard />} />
          <Route path="/job_post" element={<PostJob />} />
          <Route path="/job_details/:id" element={<JobDetail />} />
          <Route path="/job_application" element={<JobListingPage />} />
          <Route path="/job_application/:id" element={<JobListingPage />} /> 
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/application-status/:jobPostId" element={<ApplicationStatus />} />
          <Route path="/browse-jobs" element={<JobsPage />} /> 

         

          {/* Interview & Feedback */}
          <Route path="/interviews" element={<InterviewManagement />} />
          <Route path="/feedback" element={<InterviewFeedback />} />
          <Route path="/users" element={<UserManagement />} />

          {/* Candidate Management List */}
          <Route path="/candidates" element={<CandidateListPage />} />
          
          {/* CV Scoring & Analytics */}
          <Route path="/cv-scoring" element={<CVRanking />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
