const express = require("express");
const router = express.Router();
const {
	createJobOrder,
	getAllJobOrders,
	getJobOrderById,
	updateJobOrder,
	deleteJobOrder,
	getTasksForSupervisor,
	updateTaskResponse,
	getTasksForTechnician,
	updateTechnicianTask
} = require("../controllers/jobOrder.controller.js");

// ===== Admin Routes =====
router.post("/", createJobOrder);
router.get("/", getAllJobOrders);
router.get("/:id", getJobOrderById);
router.put("/:id", updateJobOrder);
router.delete("/:id", deleteJobOrder);

// ===== Supervisor Routes =====
router.get("/supervisor/:supervisorId/tasks", getTasksForSupervisor);
router.put("/:jobId/device/:deviceId/task/:taskId/response", updateTaskResponse);

// ===== Technician Routes =====
router.get("/technician/:technicianId/tasks", getTasksForTechnician);
router.put("/:jobId/device/:deviceId/task/:taskId", updateTechnicianTask);

module.exports = router;
