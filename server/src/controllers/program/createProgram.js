const Program = require("../../models/Program");

const createProgram = async (req, res) => {
  try {
    const { name, intake, quotas } = req.body;

    const totalQuota =
      quotas.KCET + quotas.COMEDK + quotas.MANAGEMENT;

    if (totalQuota !== intake) {
      return res.status(400).json({
        message: "Total quotas must equal intake",
      });
    }

    const program = await Program.create({
      name,
      intake,
      quotas,
    });

    res.status(201).json({
      message: "Program created successfully",
      program,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = createProgram;