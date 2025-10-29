const express = require("express");
const router = express.Router();
const {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	assignSupervisor,
	getUsersByType,
	getTechniciansBySupervisor,
	userLogin,
	userLogout,
    refreshToken
} = require("../controllers/user.controller.js");
const { verifyToken, verifyRole } = require("../middleware/auth.middleware.js");

router.get("/", getAllUsers);

router.get("/:id", getUserById);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

router.get("/type/:userType", getUsersByType);

router.put("/:id/supervisor/:supervisorId", assignSupervisor);

router.get("/supervisor/:supervisorId/technicians", getTechniciansBySupervisor);

router.post("/login", userLogin);

router.post("/logout", verifyToken, userLogout);

module.exports = router;

