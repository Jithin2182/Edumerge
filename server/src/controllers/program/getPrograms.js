const Program = require("../../models/Program");

const getProgramsController = async (req, res) => {
  try {
    const programs = await Program.find();

    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getProgramsController;