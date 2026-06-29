import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

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
  name: user.name,
  totalClassesHeld: user.totalClassesHeld,
  totalClassesAttended: user.totalClassesAttended,
  createdAt: user.createdAt,
});

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name } = req.body;

    // Validation
    if (!username || !password || !name) {
      res.status(400).json({ message: 'All fields are required' });
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
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }

    // Create user
    const user = new User({
      username: username.toLowerCase(),
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
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const token = generateToken(String(user._id));
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/me
export const getMe = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .select('username name totalClassesHeld totalClassesAttended createdAt')
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
