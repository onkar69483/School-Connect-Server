const express = require("express");
const { register, login } = require("../controllers/authController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Example of protected route
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        username: req.user.username,
        phone: req.user.phone,
        emergencyContact: req.user.emergencyContact,
        address: req.user.address,
        avatar: req.user.avatar,
        batch: req.user.batch,

        // Add any other user details you want to send
    });
});

module.exports = router;
