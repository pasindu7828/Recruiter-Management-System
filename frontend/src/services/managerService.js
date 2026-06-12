const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const API_URL = `${API_BASE_URL}${API_VERSION}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const parseResponseBody = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const ensureOk = async (response, fallbackMessage, endpointLabel) => {
  const data = await parseResponseBody(response);

  if (!response.ok) {
    const baseMessage = data.message || fallbackMessage;

    if (response.status === 403) {
      throw new Error(
        `${baseMessage}. Backend router permission missing for recruiter on ${endpointLabel}.`,
      );
    }

    throw new Error(baseMessage);
  }

  return data;
};

// Get all jobs posted by the logged-in recruiter/manager
export const getMyJobs = async () => {
  const response = await fetch(`${API_URL}/jobs/recruiter/my-jobs`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  return ensureOk(response, "Failed to fetch jobs", "/jobs/recruiter/my-jobs");
};

// Get all applications for all of the recruiter's job postings
export const getApplicationsForMyJobs = async () => {
  const response = await fetch(
    `${API_URL}/applications/recruiter-applications`,
    {
      headers: getAuthHeaders(),
      credentials: "include",
    },
  );
  return ensureOk(
    response,
    "Failed to fetch applications",
    "/applications/recruiter-applications",
  );
};

// Get all interviews scheduled by the recruiter
export const getMyInterviews = async () => {
  const response = await fetch(`${API_URL}/interviews/recruiter`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  return ensureOk(
    response,
    "Failed to fetch interviews",
    "/interviews/recruiter",
  );
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await fetch(
    `${API_URL}/applications/status/${applicationId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ status }),
    },
  );
  return ensureOk(
    response,
    "Failed to update status",
    `/applications/status/${applicationId}`,
  );
};
