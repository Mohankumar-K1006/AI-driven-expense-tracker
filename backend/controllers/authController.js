const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: "User Registered Successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "No user found with that email address" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const frontendUrl = req.headers.origin || "http://127.0.0.1:5500";
        const resetUrl = `${frontendUrl}/frontend/reset-password.html?token=${resetToken}`;

        try {
            let transporter;
            let isTestAccount = false;

            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                transporter = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });
            } else {
                // Generate a fake SMTP service account for testing if real one is absent
                isTestAccount = true;
                const testAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, 
                    auth: {
                        user: testAccount.user, 
                        pass: testAccount.pass  
                    }
                });
            }

            const mailOptions = {
                to: user.email,
                from: process.env.EMAIL_USER || "expense-tracker@demo.com",
                subject: "ExpenseTracker Password Reset Request",
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                      `${resetUrl}\n\n` +
                      `If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            const info = await transporter.sendMail(mailOptions);
            
            let previewUrl = null;
            if (isTestAccount) {
                previewUrl = nodemailer.getTestMessageUrl(info);
                console.log("Ethereal Email Preview URL: %s", previewUrl);
            }

            res.status(200).json({ 
                message: "Password reset email sent successfully.",
                previewUrl: previewUrl
            });
        } catch (emailError) {
            console.error("Error sending email:", emailError.message);
            res.status(500).json({ message: "Error sending email. Please try again later." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired." });
        }

        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been successfully updated." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
