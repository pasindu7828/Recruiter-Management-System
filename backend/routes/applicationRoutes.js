import express from "express";
import { applyJob,
        editApplication,
        deleteApplication,
        getMyApplication,
        getMyApplications,
        updateApplicationStatus,
        getApplicationsForRecruiterJobs,
        getCandidatesForJob,
        getAllApplicationsForRecruiter,
        respondToOffer,
        downloadApplicationResume
} from "../controllers/applicationController.js";
import { requiredSignIn, isCandidate, isRecruiter,isAdminOrRecruiter } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Candidate routes
router.post("/apply-job", requiredSignIn, isCandidate, applyJob);
router.put("/edit/:jobPostId", requiredSignIn, isCandidate, editApplication);
router.delete("/delete/:jobPostId", requiredSignIn, isCandidate, deleteApplication);
router.get("/getMyOne/:jobPostId", requiredSignIn, isCandidate, getMyApplication); 
router.get("/getMyAll", requiredSignIn, isCandidate, getMyApplications); //all applications applied
router.put("/respond-offer/:applicationId", requiredSignIn, isCandidate, respondToOffer); //candidate respond to offer (accept/reject)
router.get("/download-resume/:applicationId", requiredSignIn, downloadApplicationResume);

// Recruiter routes

//update status
router.put("/status/:applicationId", requiredSignIn, isRecruiter, updateApplicationStatus); 
//get all applications for recruiter (all job posts created by specific recruiter)
router.get("/recruiter-applications", requiredSignIn,getApplicationsForRecruiterJobs); 
//get all candidates for a specific job
router.get("/job/:jobPostId/candidates", requiredSignIn, isAdminOrRecruiter, getCandidatesForJob); 
// Get all applications for this recruiter (including deleted jobs)
router.get("/recruiter/applications", requiredSignIn, isAdminOrRecruiter, getAllApplicationsForRecruiter);

export default router;
