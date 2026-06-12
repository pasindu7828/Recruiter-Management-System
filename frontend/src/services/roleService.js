export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return {};
    const parsedUser = JSON.parse(rawUser);
    return parsedUser && typeof parsedUser === "object" ? parsedUser : {};
  } catch {
    return {};
  }
};

export const getCurrentUserRole = () => {
  const user = getStoredUser();
  return String(user.role || "recruiter").toLowerCase();
};
