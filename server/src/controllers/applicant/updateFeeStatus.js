const Applicant = require("../../models/Applicant");

const updateFeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { feeStatus } = req.body;

    if (!feeStatus) {
      return res.status(400).json({ message: "feeStatus is required" });
    }

    const applicant = await Applicant.findByIdAndUpdate(
      id,
      { $set: { feeStatus } },
      { new: true, runValidators: true }
    ).populate("programId", "name");

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json({ message: "Fee status updated successfully", applicant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateFeeStatus;
