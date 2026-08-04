const express = require("express");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

const {
    getUsers,
    updatePermissions
} = require("../controllers/userController");

router.use(protect);
router.use(authorize("ADMIN"));

router.get("/", getUsers);

router.put("/:id/permissions", updatePermissions);

module.exports = router;