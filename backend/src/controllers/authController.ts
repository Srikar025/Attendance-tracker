import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendOtpEmail } from '../services/emailService';

const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '30d' }
  );
};

const sanitizeUser = (user: InstanceType<typeof User>) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  name: user.name,
  totalClassesHeld: user.totalClassesHeld,
  totalClassesAttended: user.totalClassesAttended,
  createdAt: user.createdAt,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, name } = req.body;

    // Validation
    if (!username || !email || !password || !name) {
      res.status(400).json({ message: 'All fields (Name, Email, Username, Password) are required' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      res.status(400).json({ message: 'Please enter a valid email address' });
      return;
    }

    if (username.length < 3 || username.length > 20) {
      res.status(400).json({ message: 'Username must be 3-20 characters' });
      return;
    }
    if (!/^[a-z0-9_]+$/i.test(username)) {
      res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }
    if (name.trim().length < 2) {
      res.status(400).json({ message: 'Name must be at least 2 characters' });
      return;
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      res.status(409).json({ message: 'Email address already registered' });
      return;
    }

    // Create user
    const user = new User({
      username: username.toLowerCase(),
      email: trimmedEmail,
      password,
      name: name.trim(),
    });
    await user.save();

    const token = generateToken(String(user._id));
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username/Email and password are required' });
      return;
    }

    const query = username.includes('@')
      ? { email: username.toLowerCase().trim() }
      : { username: username.toLowerCase().trim() };

    const user = await User.findOne(query);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(String(user._id));
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body; // Can be email or username
    if (!identifier) {
      res.status(400).json({ message: 'Email address or username is required' });
      return;
    }

    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase().trim() }
      : { username: identifier.toLowerCase().trim() };

    const user = await User.findOne(query);
    if (!user) {
      // Return 200/generic message to prevent user enumeration attacks
      res.status(200).json({ message: 'If an account exists with that email/username, an OTP has been sent.' });
      return;
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetOtp = otp;
    user.resetOtpExpires = expiresAt;
    await user.save();

    await sendOtpEmail({
      toEmail: user.email,
      toName: user.name,
      otp,
    });

    res.status(200).json({
      message: 'OTP has been sent to your registered email address.',
      email: user.email, // Return email for UI confirmation
    });
  } catch (err) {
    console.error('Forgot Password error:', err);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP code are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      res.status(400).json({ message: 'Invalid or expired OTP request' });
      return;
    }

    if (user.resetOtp !== otp.trim()) {
      res.status(400).json({ message: 'Incorrect OTP code' });
      return;
    }

    if (new Date() > user.resetOtpExpires) {
      res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
      return;
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: 'Email, OTP, and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      res.status(400).json({ message: 'Invalid or expired OTP request' });
      return;
    }

    if (user.resetOtp !== otp.trim()) {
      res.status(400).json({ message: 'Incorrect OTP code' });
      return;
    }

    if (new Date() > user.resetOtpExpires) {
      res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
      return;
    }

    // Update password and clear reset OTP fields
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset Password error:', err);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

// GET /api/auth/me
export const getMe = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .select('username email name totalClassesHeld totalClassesAttended createdAt')
      .lean();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
