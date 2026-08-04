const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { checkPermission } = require("../middleware/permissions");
const router = express.Router();
const {
  getAllAbstracts,
  getAbstractById,
  createAbstract,
  updateAbstract,
  deleteAbstract,
  getAbstractsByIds,
  getPublishedAAList,
} = require("../controllers/abstractController");

const { uploadExcel, handleUploadError } = require("../middleware/upload");
const {
  importAbstractsExcel,
} = require("../controllers/excelUpload/excelAbstractController");

router.use(protect);
router.use(checkPermission("abstracts"));

router.post("/export-data", getAbstractsByIds);
router.get("/published-aa-list", getPublishedAAList);

router.post(
  "/import-excel",
  uploadExcel,
  handleUploadError,
  importAbstractsExcel,
);

router.route("/").get(getAllAbstracts).post(createAbstract);

router
  .route("/:id")
  .get(getAbstractById)
  .put(updateAbstract)
  .delete(deleteAbstract);

module.exports = router;
