const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { checkPermission } = require("../middleware/permissions");

const router = express.Router();
const {
  getAllStandards,
  getStandardById,
  createStandard,
  updateStandard,
  deleteStandard,
  getNextIcn,
  getUniqueFieldValues,
} = require("../controllers/standardController");

const { uploadExcel, handleUploadError } = require("../middleware/upload");

const {
  importStandardsExcel,
} = require("../controllers/excelUpload/excelStandardController");

router.use(protect);
router.use(checkPermission("standards"));

router.post(
  "/import-excel",
  uploadExcel,
  handleUploadError,
  importStandardsExcel,
);

router.get("/next-icn", getNextIcn);

router.get("/unique-values/:field", getUniqueFieldValues);

router.route("/").get(getAllStandards).post(createStandard);

router
  .route("/:id")
  .get(getStandardById)
  .put(updateStandard)
  .delete(deleteStandard);

module.exports = router;
