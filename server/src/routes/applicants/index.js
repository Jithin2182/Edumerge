const express = require("express");
const router = express.Router();

const { protect, authorize } = require("./../../middleware/authMiddleware");

const createApplicant = require("./../../controllers/applicant/createApplicant");
const updateApplicant = require("./../../controllers/applicant/updateApplicant");
const deleteApplicant = require("./../../controllers/applicant/deleteApplicant");
const getAllApplicants = require("./../../controllers/applicant/getAllApplicants");
const getApplicantById = require("./../../controllers/applicant/getApplicantById");
const updateFeeStatus = require("./../../controllers/applicant/updateFeeStatus");

router.post("/", protect, authorize("ADMIN", "ADMISSION_OFFICER"), createApplicant);
router.get("/", protect, getAllApplicants);
router.get("/:id", protect, getApplicantById);
router.put("/:id", protect, authorize("ADMIN", "ADMISSION_OFFICER"), updateApplicant);
router.patch("/:id/fee-status", protect, authorize("ADMIN", "ADMISSION_OFFICER"), updateFeeStatus);
router.delete("/:id", protect, authorize("ADMIN"), deleteApplicant);

module.exports = router;
