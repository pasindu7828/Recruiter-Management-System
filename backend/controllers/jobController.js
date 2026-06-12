import Job from "../models/Job.js";

const normalizeDateValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  // Accept YYYY-MM-DD and ISO strings directly.
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  // Support dd/mm/yyyy or mm/dd/yyyy strings as a fallback.
  if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    const [part1, part2, year] = value.split("/").map(Number);
    const month = part1 > 12 ? part2 : part1;
    const day = part1 > 12 ? part1 : part2;
    const fallbackDate = new Date(year, month - 1, day);
    if (!Number.isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
  }

  return value;
};

const toStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeJobPayload = (payload = {}) => {
  const normalized = { ...payload };

  const intent = String(
    normalized.action ?? normalized.intent ?? normalized.submitType ?? ""
  ).toLowerCase();

  // If status is not sent explicitly, infer from common frontend submit flags.
  if (!normalized.status) {
    if (
      intent === "publish" ||
      intent === "published" ||
      normalized.publish === true ||
      normalized.isDraft === false
    ) {
      normalized.status = "Published";
    } else if (
      intent === "draft" ||
      intent === "save-draft" ||
      intent === "save_as_draft" ||
      normalized.isDraft === true
    ) {
      normalized.status = "Draft";
    }
  }

  // Remove transport-only flags so they are not persisted.
  delete normalized.action;
  delete normalized.intent;
  delete normalized.submitType;
  delete normalized.publish;
  delete normalized.isDraft;

  if (Object.prototype.hasOwnProperty.call(normalized, "publishDate")) {
    normalized.publishDate = normalizeDateValue(normalized.publishDate);
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "applicationDeadline")) {
    normalized.applicationDeadline = normalizeDateValue(normalized.applicationDeadline);
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "hiringManager")) {
    if (normalized.hiringManager === "" || normalized.hiringManager === null) {
      normalized.hiringManager = undefined;
    } else {
      normalized.hiringManager = String(normalized.hiringManager).trim();
    }
  }

  // Convert string arrays
  if (normalized.keyResponsibilities !== undefined) {
    normalized.keyResponsibilities = toStringArray(normalized.keyResponsibilities);
  }

  if (normalized.requirements !== undefined) {
    normalized.requirements = toStringArray(normalized.requirements);
  }

  if (normalized.requiredSkills !== undefined) {
    normalized.requiredSkills = toStringArray(normalized.requiredSkills);
  }

  // Convert salary to numbers
  if (normalized.minSalary !== undefined) {
    normalized.minSalary = Number(normalized.minSalary);
  }

  if (normalized.maxSalary !== undefined) {
    normalized.maxSalary = Number(normalized.maxSalary);
  }

  return normalized;
};

const ensureRecruiterOwnsJobOrAdmin = (job, user) => {
  return (
    job.postedBy.toString() === user._id.toString() ||
    user.role === "admin"
  );
};

const createJobWithStatus = async (req, res, forcedStatus, successMessage) => {
  const payload = normalizeJobPayload(req.body);

  if (forcedStatus) {
    payload.status = forcedStatus;
  }

  const job = await Job.create({
    ...payload,
    postedBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: successMessage,
    job,
  });
};

// Create a new job post (Recruiter/Admin only)
export const createJob = async (req, res) => {
  try {
    return await createJobWithStatus(
      req,
      res,
      "Published",
      "Job post created successfully"
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Save new job as draft (Recruiter/Admin only)
export const saveDraftJob = async (req, res) => {
  try {
    return await createJobWithStatus(
      req,
      res,
      "Draft",
      "Job draft saved successfully"
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Publish an existing draft job
export const publishDraftJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!ensureRecruiterOwnsJobOrAdmin(job, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to publish this job",
      });
    }

    if (job.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft jobs can be published from this endpoint",
      });
    }

    const payload = normalizeJobPayload(req.body || {});

    // Optional draft updates can be provided in the same publish request.
    Object.assign(job, payload);
    job.status = "Published";

    await job.validate();
    const updatedJob = await job.save();

    res.status(200).json({
      success: true,
      message: "Job published successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all jobs (Public - with pagination)
export const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      employmentType,
      workArrangement,
      experienceLevel,
      status,
      skills,
      minSalary,
      maxSalary,
    } = req.query;

    const query = {};
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    const isAdminOrRecruiter =
      req.user && (req.user.role === "admin" || req.user.role === "recruiter");

    // Search by title/skills/department text
    if (search) {
      query.$or = [
        { jobTitle: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { requiredSkills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (department) query.department = department;
    if (employmentType) query.employmentType = employmentType;
    if (workArrangement) query.workArrangement = workArrangement;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    if (skills) {
      const skillList = String(skills)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .map((skill) => new RegExp(`^${skill}$`, "i"));

      if (skillList.length > 0) {
        query.requiredSkills = { $in: skillList };
      }
    }

    if (minSalary || maxSalary) {
      query.$and = query.$and || [];

      if (minSalary) {
        query.$and.push({
          $or: [{ maxSalary: { $exists: false } }, { maxSalary: { $gte: Number(minSalary) } }],
        });
      }

      if (maxSalary) {
        query.$and.push({
          $or: [{ minSalary: { $exists: false } }, { minSalary: { $lte: Number(maxSalary) } }],
        });
      }
    }

    // Public users only see published, open jobs
    if (!isAdminOrRecruiter) {
      query.status = "Published";
      query.applicationDeadline = { $gte: new Date() };
    } else if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .sort({ publishDate: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single job by ID (Public)
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name email"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update job (Recruiter who posted / Admin)
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the owner or admin
    if (!ensureRecruiterOwnsJobOrAdmin(job, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    const payload = normalizeJobPayload(req.body);

    job = await Job.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete job (Recruiter who posted / Admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the owner or admin
    if (!ensureRecruiterOwnsJobOrAdmin(job, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get jobs posted by logged-in recruiter
export const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    const query = { postedBy: req.user._id };

    const jobs = await Job.find(query)
      .sort({ publishDate: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all jobs for admin
export const getAllJobsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, recruiter } = req.query;
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    const query = {};

    if (recruiter) {
      query.postedBy = recruiter;
    }

    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .sort({ publishDate: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
