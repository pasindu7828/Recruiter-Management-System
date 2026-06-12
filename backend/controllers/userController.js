import mongoose from "mongoose"; 
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

// Register
export const registerUser = async (req, res) => {
  const {name, email,phone, password,dateOfBirth,role } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ name, email,phone, password, dateOfBirth,role });

    // Generate token first
    const token = generateToken(user);

    // Set token as cookie
    res.cookie("access_token", token, {
      httpOnly: true,       // prevents client-side JS from reading it
      secure: false,        // true in production (https)
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({
      message: "Registration successful",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && user.matchPassword(password)) {

      const token = generateToken(user);

      // Set cookie
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: false, // true in production
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.status(200).json({
        message: "Login successful",
        user,
        token // optional to send in response too
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout (frontend just deletes token)
export const logoutUser = async (req, res) => {
  // Clear cookie
  res.clearCookie("access_token");
  res.status(200).json({ message: "Logged out successfully" });
};

// Get logged-in user profile
export const getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//update profile email,phone and date of birth
export const updateUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.phone = req.body.phone || user.phone;
    user.email = req.body.email || user.email;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio; 

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//change password - user must provide current password and new password, and current password must match before allowing change
export const changePassword = async (req, res) => {

  const { currentPassword, newPassword } = req.body;

  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      message: "Password updated successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin-only: Get all candidates 
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await User.find({ role: "candidate" }).select("-password");

    res.status(200).json({
      totalCandidates: candidates.length,
      candidates,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin-only: Get all recruiters
export const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await User.find({ role: "recruiter" }).select("-password");

    res.status(200).json({
      totalRecruiters: recruiters.length,
      recruiters,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete user - admin only
export const deleteUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

// Upload Resume - candidate
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Push new resume into array
    user.resumes.push(req.file.path);

    await user.save();

    res.status(200).json({
      message: "Resume uploaded successfully",
      resumes: user.resumes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all users
export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.status(200).json({
      totalUsers: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Manager-only: Get candidate by ID
export const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid candidate ID format" });
    }

    const candidate = await User.findOne({ 
      _id: id, 
      role: "candidate" 
    }).select("-password");

    if (!candidate) {
      return res.status(404).json({ 
        message: "Candidate not found" 
      });
    }

    res.status(200).json(candidate);

  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

// Download Resume - Public access 
export const downloadResume = async (req, res) => {
  try {
    const { userId, resumeIndex } = req.params;
    const index = parseInt(resumeIndex);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resumes || !user.resumes[index]) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resumePath = user.resumes[index];
    const fullPath = path.join(process.cwd(), resumePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    const fileName = path.basename(fullPath);

    res.download(fullPath, fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error downloading file" });
        }
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};