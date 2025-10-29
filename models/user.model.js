const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "add username"],
		},
		email: {
			type: String,
			unique: true,
			required: true,
			validate: {
				validator: v => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
				message: props => `${props.value} is not a valid email!`,
			},
		},
		hashedPassword: {
			type: String,
			required: true,
		},
		userType: {
			type: String,
			enum: ["planner", "supervisor", "technician"],
			required: true,
		},

		// 👇 Only relevant for supervisor and technician
		teamType: {
			type: String,
			enum: ["quality", "production", "testing"],
			default: null, // null for planners
			validate: {
				validator: function (value) {
					// Planners should not have teamType
					if (this.userType === "planner" && value) return false;
					// Supervisors and technicians must have teamType
					if (this.userType !== "planner" && !value) return false;
					return true;
				},
				message: function () {
					if (this.userType === "planner")
						return "Planner should not have a team.";
					else
						return `${this.userType} must have a team type.`;
				},
			},
		},

		// 👇 Only relevant for technicians
		supervisor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
			validate: {
				validator: function (value) {
					// technician must have supervisor, others must not
					if (this.userType === "technician" && !value) return false;
					if (this.userType !== "technician" && value) return false;
					return true;
				},
				message: function () {
					if (this.userType === "technician")
						return "Technician must have a supervisor.";
					else
						return `${this.userType} should not have a supervisor.`;
				},
			},
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);