const Program = require("../../models/Program");

const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    let program;

    // 🔍 Check if it's MongoDB ObjectId
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    if (isObjectId) {
      program = await Program.findById(id);
    } else {
      program = await Program.findOne({
        name: { $regex: new RegExp(`^${id}$`, "i") }, // case-insensitive
      });
    }

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getProgramById;