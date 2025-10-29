const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");

// Set how strong the hashing should be (10 is a good default)
const SALT_ROUNDS = 10;

// 📜 Get all users
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().populate("supervisor", "username userType teamType");
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 🔍 Get single user by ID
exports.getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).populate("supervisor", "username userType teamType");
		if (!user) return res.status(404).json({ message: "User not found" });
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// ➕ Create new user (hash password here)
exports.createUser = async (req, res) => {
	try {
		const { username, email, hashedPassword, userType, teamType, supervisor } = req.body;

		// ✅ Hash the plain password before saving
		const hashed = await bcrypt.hash(hashedPassword, SALT_ROUNDS);

		const newUser = new User({
			username,
			email,
			hashedPassword: hashed,
			userType,
			teamType,
			supervisor: supervisor || null,
		});

		await newUser.save();
		res.status(201).json(newUser);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// ✏️ Update user info (if password is updated, re-hash it)
exports.updateUser = async (req, res) => {
	try {
		const updates = { ...req.body };

		// 🔒 If password is being updated, hash it
		if (updates.hashedPassword) {
			updates.hashedPassword = await bcrypt.hash(updates.hashedPassword, SALT_ROUNDS);
		}

		const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).populate(
			"supervisor",
			"username userType teamType"
		);

		if (!updatedUser) return res.status(404).json({ message: "User not found" });

		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// ❌ Delete user
exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 🔗 Assign a supervisor to a technician
exports.assignSupervisor = async (req, res) => {
	try {
		const technician = await User.findById(req.params.id);
		const supervisor = await User.findById(req.params.supervisorId);

		if (!technician || !supervisor) return res.status(404).json({ message: "User not found" });

		if (technician.userType !== "technician" || supervisor.userType !== "supervisor")
			return res.status(400).json({ message: "Invalid role combination" });

		technician.supervisor = supervisor._id;
		await technician.save();

		res.status(200).json({ message: "Supervisor assigned successfully", technician });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 🧭 Get all users by type
exports.getUsersByType = async (req, res) => {
	try {
		const users = await User.find({ userType: req.params.userType }).populate("supervisor", "username");
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 👷‍♂️ Get all technicians under a supervisor
exports.getTechniciansBySupervisor = async (req, res) => {
	try {
		const technicians = await User.find({ supervisor: req.params.supervisorId })
			.populate("supervisor", "username userType teamType");
		res.status(200).json(technicians);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 🔑 User login
exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist, please sign up instead" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Create session token content
        const content = {
            userId: user._id,
            authorized: user.isAdmin,
            userType: user.userType
        };

        // Here you would typically create a JWT token
        // For example: const token = jwt.sign(content, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                userType: user.userType,
                isAdmin: user.isAdmin
            }
            // token: token  // Uncomment when JWT is implemented
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🚪 User logout
exports.userLogout = async (req, res) => {
    try {
        // If using session-based auth, you would clear the session here
        // If using JWT, you might want to add the token to a blacklist
        // For now, we'll just send a success response
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
