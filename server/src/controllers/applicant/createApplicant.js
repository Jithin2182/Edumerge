const Applicant = require("../../models/Applicant");
const Program = require("../../models/Program");

const createApplicant = async (req, res) => {
  try {
    const { name, category, quota, programId } = req.body;

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    let status = "PENDING";

    if (quota === "KCET" || quota === "COMEDK") {
      const available = program.quotas[quota] - program.filledSeats[quota];
      if (available <= 0) {
        return res.status(400).json({ message: `No seats available under ${quota} quota` });
      }
      await Program.findByIdAndUpdate(programId, { $inc: { [`filledSeats.${quota}`]: 1 } });
      status = "ALLOCATED";
    }

    const applicant = await Applicant.create({ name, category, quota, programId, status });

    res.status(201).json({ message: "Applicant created successfully", applicant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = createApplicant;
