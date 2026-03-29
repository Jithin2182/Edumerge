const Applicant = require("../../models/Applicant");
const Program = require("../../models/Program");

const generateAdmissionNumber = async (program, quota) => {
  const year = new Date().getFullYear();
  const count = await Applicant.countDocuments({
    programId: program._id,
    quota,
    admissionNumber: { $ne: null },
  });
  const seq = String(count + 1).padStart(4, "0");
  const programName = program.name.replace(/\s+/g, "_").toUpperCase();
  return `INST/${year}/UG/${programName}/${quota}/${seq}`;
};

const updateApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, documentsStatus, status } = req.body;

    const applicant = await Applicant.findById(id);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // documentsStatus cannot be changed once VERIFIED
    if (documentsStatus !== undefined && applicant.documentsStatus === "VERIFIED") {
      return res.status(400).json({ message: "Documents status cannot be changed once verified" });
    }

    // quota and programId cannot change after allocation
    if (applicant.status !== "PENDING" && (req.body.quota !== undefined || req.body.programId !== undefined)) {
      return res.status(400).json({ message: "Quota and program cannot be changed after seat allocation" });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (documentsStatus !== undefined) updateData.documentsStatus = documentsStatus;

    // Handle status transitions
    if (status !== undefined && status !== applicant.status) {
      const currentStatus = applicant.status;

      if (currentStatus === "PENDING" && status === "ALLOCATED") {
        // Only MANAGEMENT quota can be manually allocated
        if (applicant.quota !== "MANAGEMENT") {
          return res.status(400).json({ message: "KCET/COMEDK applicants are auto-allocated on creation" });
        }
        const program = await Program.findById(applicant.programId);
        const available = program.quotas.MANAGEMENT - program.filledSeats.MANAGEMENT;
        if (available <= 0) {
          return res.status(400).json({ message: "No seats available under MANAGEMENT quota" });
        }
        await Program.findByIdAndUpdate(applicant.programId, { $inc: { "filledSeats.MANAGEMENT": 1 } });
        updateData.status = "ALLOCATED";

      } else if (currentStatus === "ALLOCATED" && status === "CONFIRMED") {
        // Documents must be VERIFIED (check incoming value or existing)
        const effectiveDocsStatus = updateData.documentsStatus || applicant.documentsStatus;
        if (effectiveDocsStatus !== "VERIFIED") {
          return res.status(400).json({ message: "Documents must be verified before confirming the applicant" });
        }
        const program = await Program.findById(applicant.programId);
        updateData.admissionNumber = await generateAdmissionNumber(program, applicant.quota);
        updateData.status = "CONFIRMED";

      } else {
        return res.status(400).json({
          message: `Invalid status transition: ${currentStatus} → ${status}`,
        });
      }
    }

    const updated = await Applicant.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("programId", "name");

    res.json({ message: "Applicant updated successfully", applicant: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateApplicant;
