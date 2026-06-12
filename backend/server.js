import express from 'express';
import dotenv from 'dotenv';
import 'colors';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import routes
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import interviewRoutes from "./routes/interviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cvAnalysisRoutes from "./routes/cvAnalysisRoutes.js";

const app = express();

// Configure environment
dotenv.config();

// Database config
connectDB();

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 
app.use(cors({ origin: true, credentials: true })); 

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/feedbacks", feedbackRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/cv-analysis", cvAnalysisRoutes);

app.get("/", (req, res) => {
  res.send({
    message: "Welcome to Recruitment Management System",
  });
});

const PORT = process.env.PORT || 8085;

app.listen(PORT, () => {
  console.log(`Server Running on ${process.env.DEV_MODE} mode`.bgCyan.white);
  console.log(`Server is running on port ${PORT}`.bgCyan.white);
});