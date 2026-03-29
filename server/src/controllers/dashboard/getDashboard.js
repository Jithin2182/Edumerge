const Applicant = require("../../models/Applicant");
const Program = require("../../models/Program");

const getDashboard = async (req, res) => {
  try {
    const [programs, quotaBreakdown, pendingApplicants] = await Promise.all([
      // 1. Seats graph — per program: intake vs filled per quota
      Program.find().select("name intake quotas filledSeats").lean(),

      // 2. Pie chart — total government (KCET + COMEDK) vs MANAGEMENT allocations
      Applicant.aggregate([
        { $match: { status: { $in: ["ALLOCATED", "CONFIRMED"] } } },
        {
          $group: {
            _id: null,
            kcet: { $sum: { $cond: [{ $eq: ["$quota", "KCET"] }, 1, 0] } },
            comedk: { $sum: { $cond: [{ $eq: ["$quota", "COMEDK"] }, 1, 0] } },
            management: { $sum: { $cond: [{ $eq: ["$quota", "MANAGEMENT"] }, 1, 0] } },
          },
        },
      ]),

      // 3. Pending list — allocated/confirmed applicants with fee or documents still pending
      Applicant.find({
        status: { $in: ["ALLOCATED", "CONFIRMED"] },
        $or: [{ feeStatus: "PENDING" }, { documentsStatus: { $in: ["PENDING", "SUBMITTED"] } }],
      })
        .select("name quota category status documentsStatus feeStatus admissionNumber createdAt")
        .populate("programId", "name")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Shape graph data
    const seatsGraph = programs.map((p) => ({
      program: p.name,
      intake: p.intake,
      filled: {
        KCET: p.filledSeats.KCET,
        COMEDK: p.filledSeats.COMEDK,
        MANAGEMENT: p.filledSeats.MANAGEMENT,
        total: p.filledSeats.KCET + p.filledSeats.COMEDK + p.filledSeats.MANAGEMENT,
      },
      available: {
        KCET: p.quotas.KCET - p.filledSeats.KCET,
        COMEDK: p.quotas.COMEDK - p.filledSeats.COMEDK,
        MANAGEMENT: p.quotas.MANAGEMENT - p.filledSeats.MANAGEMENT,
        total:
          p.intake -
          (p.filledSeats.KCET + p.filledSeats.COMEDK + p.filledSeats.MANAGEMENT),
      },
    }));

    // Shape pie data
    const raw = quotaBreakdown[0] || { kcet: 0, comedk: 0, management: 0 };
    const admissionPie = {
      government: { KCET: raw.kcet, COMEDK: raw.comedk, total: raw.kcet + raw.comedk },
      management: raw.management,
      total: raw.kcet + raw.comedk + raw.management,
    };

    res.json({ seatsGraph, admissionPie, pendingApplicants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getDashboard;
