import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to check JWT and attach user
export const requiredSignIn = async (req, res, next) => {
  try {

    // Get token from cookie OR Authorization header
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};

// Admin check
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied: Admins only",
    });
  }
  next();
};

// Candidate check
export const isCandidate = (req, res, next) => {
  if (req.user.role !== "candidate") {
    return res.status(403).json({
      message: "Access denied: Candidates only",
    });
  }
  next();
  
};

// Recruiter check
export const isRecruiter = (req, res, next) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({
      message: "Access denied: Recruiter only",
    });
  }
  next();
  
};

// Hiring manager check
export const isManager = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({
      message: "Access denied: Manager only",
    });
  }
  next();
  
};

// Admin OR Recruiter check
export const isAdminOrRecruiter = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "recruiter") {
    return res.status(403).json({
      message: "Access denied: Admin or Recruiter only",
    });
  }
  next();
};
