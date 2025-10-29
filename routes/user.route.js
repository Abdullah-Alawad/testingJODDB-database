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
	getTechniciansBySupervisor
} = require("../controllers/user.controller.js");

// 🧑‍🤝‍🧑 Get all users
router.get("/", getAllUsers);

// 🔍 Get user by ID
router.get("/:id", getUserById);

// ➕ Create new user
router.post("/", createUser);

// ✏️ Update user
router.put("/:id", updateUser);

// ❌ Delete user
router.delete("/:id", deleteUser);

// 🧭 Get users by role/type (planner, supervisor, technician)
router.get("/type/:userType", getUsersByType);

// 🔗 Assign a supervisor to a technician
router.put("/:id/supervisor/:supervisorId", assignSupervisor);

// 👷‍♂️ Get all technicians under a supervisor
router.get("/supervisor/:supervisorId/technicians", getTechniciansBySupervisor);

module.exports = router;

