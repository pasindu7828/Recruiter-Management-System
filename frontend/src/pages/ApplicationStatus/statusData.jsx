export const STEPS = ["Applied", "Screening", "Interview Scheduled", "Interviewed", "Offered", "Hired", "Rejected"];

export const STATUS_DETAILS = {
  "Applied": {
    header: "Application Received",
    subHeader: "Your profile is in the initial review stage.",
    badgeColor: "bg-blue-100 text-blue-800",
    nextStepTitle: "Resume Screening",
    nextStepDesc: "Our recruitment team is currently evaluating your qualifications.",
    activity: "Application submitted successfully"
  },
  "Screening": {
    header: "Profile Screening",
    subHeader: "A recruiter is taking a closer look at your experience.",
    badgeColor: "bg-purple-100 text-purple-800",
    nextStepTitle: "Technical Review",
    nextStepDesc: "If you meet the requirements, we'll contact you for an interview.",
    activity: "Profile moved to screening stage"
  },
  "Interview Scheduled": {
    header: "Interview Time!",
    subHeader: "Prepare to meet the team. Your interview is confirmed.",
    badgeColor: "bg-amber-100 text-amber-800",
    nextStepTitle: "Technical Interview",
    nextStepDesc: "Check the meeting link and prepare your portfolio.",
    activity: "Interview scheduled by recruiter"
  },
  "Interviewed": {
    header: "Interview Complete",
    subHeader: "Thank you for meeting with us. We are reviewing the feedback.",
    badgeColor: "bg-indigo-100 text-indigo-800",
    nextStepTitle: "Final Decision",
    nextStepDesc: "Hiring managers are discussing the next steps.",
    activity: "Interview feedback is being processed"
  },
  "Offered": {
    header: "Job Offer!",
    subHeader: "Congratulations! We'd love to have you on the team.",
    badgeColor: "bg-green-100 text-green-800",
    nextStepTitle: "Acceptance",
    nextStepDesc: "Review your offer letter and sign to begin onboarding.",
    activity: "Official offer letter sent"
  },
  "Hired": {
    header: "Welcome Aboard!",
    subHeader: "You've successfully completed the recruitment process.",
    badgeColor: "bg-emerald-500 text-white",
    nextStepTitle: "Onboarding",
    nextStepDesc: "Check your email for the first-day details.",
    activity: "Candidate successfully hired"
  },
  "Rejected": {
    header: "Application Closed",
    subHeader: "Thank you for your interest in HireHub.",
    badgeColor: "bg-red-100 text-red-800",
    nextStepTitle: "Keep Exploring",
    nextStepDesc: "We wish you the best in your job search. Feel free to apply for other roles!",
    activity: "Application process ended"
  }
};