const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/blackList.model.js"); // <-- new


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

        // Create access token
        const accessToken = jwt.sign({
            userId: user._id,
            email: user.email,
            userType: user.userType,
            isAdmin: user.isAdmin
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });

        // Create refresh token with longer expiry
        const refreshToken = jwt.sign({
            userId: user._id,
            tokenVersion: user.tokenVersion || 0
        }, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key', { expiresIn: '7d' });

        // Save refresh token to user document
        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                userType: user.userType,
                isAdmin: user.isAdmin
            },
            accessToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// � Refresh access token
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not found" });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
        
        // Find user and check if refresh token is still valid
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        // Create new access token
        const accessToken = jwt.sign({
            userId: user._id,
            email: user.email,
            userType: user.userType,
            isAdmin: user.isAdmin
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });

        res.json({ accessToken });
    } catch (error) {
        res.status(403).json({ message: "Invalid refresh token" });
    }
};

// 🚪 User logout
exports.userLogout = async (req, res) => {
  try {
    // Accept either:
    // - Authorization: Bearer <token>
    // - Authorization: <token>
    // - OR a refreshToken cookie (if you want to blacklist refresh tokens from cookie)
    let rawHeader = req.headers.authorization || "";
    let token = rawHeader.startsWith("Bearer ") ? rawHeader.split(" ")[1] : rawHeader;

    // If not in header, try cookie (useful if refresh token stored in cookie)
    if (!token && req.cookies && req.cookies.refreshToken) {
      token = req.cookies.refreshToken;
    }

    if (!token) {
      // still clear cookie to be safe
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      });
      return res.status(200).json({ message: "Logged out successfully (no token provided)" });
    }

    // decode to extract exp (do not verify here because the token might be expired)
    const decoded = jwt.decode(token);
    // Fallback expiry: 7 days from now (shouldn't happen if token has exp)
    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (decoded && decoded.exp) {
      expiresAt = new Date(decoded.exp * 1000);
    }

    // Save to blacklist (ignore duplicate errors)
    try {
      await TokenBlacklist.create({ token, expiresAt });
    } catch (err) {
      // duplicate key or other error — ignore duplicate (already blacklisted)
      if (err.code !== 11000) {
        // Log but don't fail logout for DB write error
        console.error("Failed to save blacklisted token:", err);
      }
    }

    // Optional: if you want to null DB-stored refreshToken for the user, try to find user by token payload:
    if (decoded && decoded.userId) {
      try {
        await User.findByIdAndUpdate(decoded.userId, {
          refreshToken: null,
          // increment tokenVersion if you use it
          tokenVersion: (await User.findById(decoded.userId)).tokenVersion ? (await User.findById(decoded.userId)).tokenVersion + 1 : 1
        });
      } catch (err) {
        // non-fatal; still proceed to clear cookie and respond success
        console.error("Failed to clear user refreshToken field:", err);
      }
    }

    // Clear cookie in any case
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: error.message });
  }
};
