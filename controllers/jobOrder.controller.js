const JobOrder = require("../models/jobOrder.model.js");
const User = require("../models/user.model.js");

// ==================== ADMIN CONTROLLERS ====================

// ➕ Create a new JobOrder (with devices and tasks)
exports.createJobOrder = async (req, res) => {
	try {
		const jobOrder = new JobOrder(req.body);
		await jobOrder.save();
		res.status(201).json(jobOrder);
	} catch (error) {
		res.status(400).json({ message: "Failed to create JobOrder", error: error.message });
	}
};

// 📜 Get all JobOrders
exports.getAllJobOrders = async (req, res) => {
	try {
		const jobOrders = await JobOrder.find()
			.populate("devices.tasks.technicians", "username userType teamType supervisor")
			.exec();
		res.status(200).json(jobOrders);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch JobOrders", error: error.message });
	}
};

// 🔍 Get single JobOrder by ID
exports.getJobOrderById = async (req, res) => {
	try {
		const jobOrder = await JobOrder.findById(req.params.id)
			.populate("devices.tasks.technicians", "username userType teamType supervisor")
			.exec();
		if (!jobOrder) return res.status(404).json({ message: "JobOrder not found" });
		res.status(200).json(jobOrder);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch JobOrder", error: error.message });
	}
};

// ✏️ Update JobOrder (admin can update devices/tasks)
exports.updateJobOrder = async (req, res) => {
	try {
		const updatedJobOrder = await JobOrder.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})
			.populate("devices.tasks.technicians", "username userType teamType supervisor")
			.exec();
		if (!updatedJobOrder) return res.status(404).json({ message: "JobOrder not found" });
		res.status(200).json(updatedJobOrder);
	} catch (error) {
		res.status(400).json({ message: "Failed to update JobOrder", error: error.message });
	}
};

// ❌ Delete JobOrder
exports.deleteJobOrder = async (req, res) => {
	try {
		const deleted = await JobOrder.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ message: "JobOrder not found" });
		res.status(200).json({ message: "JobOrder deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete JobOrder", error: error.message });
	}
};

// ==================== SUPERVISOR CONTROLLERS ====================

// 📜 Get all tasks assigned to supervisor's technicians
exports.getTasksForSupervisor = async (req, res) => {
	try {
		const supervisorId = req.params.supervisorId;

		// Get all JobOrders
		const jobOrders = await JobOrder.find().populate(
			"devices.tasks.technicians",
			"username userType teamType supervisor"
		);

		// Filter tasks belonging to supervisor's technicians
		const tasks = [];

		jobOrders.forEach(job => {
			job.devices.forEach(device => {
				device.tasks.forEach(task => {
					task.technicians.forEach(tech => {
						if (tech.supervisor && tech.supervisor.toString() === supervisorId) {
							tasks.push({
								jobId: job._id,
								jobOrderName: job.jobOrderName,
								deviceId: device._id,
								deviceName: device.deviceName,
								taskId: task._id,
								...task.toObject()
							});
						}
					});
				});
			});
		});

		res.status(200).json(tasks);
	} catch (error) {
		res.status(500).json({ message: "Failed to get tasks for supervisor", error: error.message });
	}
};

// ✏️ Supervisor accepts or denies a task
exports.updateTaskResponse = async (req, res) => {
	try {
		const { jobId, deviceId, taskId } = req.params;
		const { taskResponse } = req.body; // "accepted" or "denied"

		if (!["accepted", "denied"].includes(taskResponse))
			return res.status(400).json({ message: "Invalid taskResponse value" });

		const job = await JobOrder.findById(jobId);
		if (!job) return res.status(404).json({ message: "JobOrder not found" });

		const device = job.devices.id(deviceId);
		if (!device) return res.status(404).json({ message: "Device not found" });

		const task = device.tasks.id(taskId);
		if (!task) return res.status(404).json({ message: "Task not found" });

		task.taskResponse = taskResponse;
		task.taskResponseTime = new Date();

		await job.save();

		res.status(200).json({ message: "Task response updated", task });
	} catch (error) {
		res.status(500).json({ message: "Failed to update task response", error: error.message });
	}
};

// ==================== TECHNICIAN CONTROLLERS ====================

// 📜 Get all tasks assigned to a technician
exports.getTasksForTechnician = async (req, res) => {
	try {
		const techId = req.params.technicianId;

		const jobOrders = await JobOrder.find().populate(
			"devices.tasks.technicians",
			"username userType teamType supervisor"
		);

		const tasks = [];

		jobOrders.forEach(job => {
			job.devices.forEach(device => {
				device.tasks.forEach(task => {
					if (task.technicians.some(t => t._id.toString() === techId)) {
						tasks.push({
							jobId: job._id,
							jobOrderName: job.jobOrderName,
							deviceId: device._id,
							deviceName: device.deviceName,
							taskId: task._id,
							...task.toObject()
						});
					}
				});
			});
		});

		res.status(200).json(tasks);
	} catch (error) {
		res.status(500).json({ message: "Failed to get technician tasks", error: error.message });
	}
};

// ✏️ Technician updates their task (only allowed fields)
exports.updateTechnicianTask = async (req, res) => {
	try {
		const { jobId, deviceId, taskId } = req.params;
		const { actualOutput, startTime, endTime, status } = req.body;

		const job = await JobOrder.findById(jobId);
		if (!job) return res.status(404).json({ message: "JobOrder not found" });

		const device = job.devices.id(deviceId);
		if (!device) return res.status(404).json({ message: "Device not found" });

		const task = device.tasks.id(taskId);
		if (!task) return res.status(404).json({ message: "Task not found" });

		if (actualOutput !== undefined) task.actualOutput = actualOutput;
		if (startTime !== undefined) task.startTime = startTime;
		if (endTime !== undefined) task.endTime = endTime;
		if (status !== undefined && ["done", "undone"].includes(status)) task.status = status;

		await job.save();

		res.status(200).json({ message: "Task updated successfully", task });
	} catch (error) {
		res.status(500).json({ message: "Failed to update task", error: error.message });
	}
};
