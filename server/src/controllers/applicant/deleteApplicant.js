const Applicant = require("../../models/Applicant");

const deleteApplicant = async (req, res) => {
  try {
    const { id } = req.params;

    const applicant = await Applicant.findByIdAndDelete(id);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json({ message: "Applicant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = deleteApplicant;
