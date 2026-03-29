const Applicant = require("../../models/Applicant");

const getApplicantById = async (req, res) => {
  try {
    const { id } = req.params;

    const applicant = await Applicant.findById(id).populate("programId", "name");
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json(applicant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getApplicantById;
