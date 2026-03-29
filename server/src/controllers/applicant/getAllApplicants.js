const Applicant = require("../../models/Applicant");

const getAllApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find().populate("programId", "name");
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getAllApplicants;
