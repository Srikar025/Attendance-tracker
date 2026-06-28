import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

const calcPercentage = (attended: number, held: number): number => {
  if (held === 0) return 0;
  return Math.round((attended / held) * 100 * 10) / 10;
};

const sanitizeUser = (user: InstanceType<typeof User>) => ({
  _id: user._id,
  username: user.username,
  name: user.name,
  totalClassesHeld: user.totalClassesHeld,
  totalClassesAttended: user.totalClassesAttended,
  createdAt: user.createdAt,
});

// PUT /api/user/profile — update name
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      res.status(400).json({ message: 'Name must be at least 2 characters' });
      return;
    }
    if (name.trim().length > 50) {
      res.status(400).json({ message: 'Name cannot exceed 50 characters' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.userId!,
      { name: name.trim() },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/user/totals — manual override
export const updateTotals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { totalClassesHeld, totalClassesAttended } = req.body;

    if (totalClassesHeld === undefined || totalClassesAttended === undefined) {
      res.status(400).json({ message: 'totalClassesHeld and totalClassesAttended are required' });
      return;
    }
    if (!Number.isInteger(totalClassesHeld) || totalClassesHeld < 0) {
      res.status(400).json({ message: 'totalClassesHeld must be a non-negative integer' });
      return;
    }
    if (!Number.isInteger(totalClassesAttended) || totalClassesAttended < 0) {
      res.status(400).json({ message: 'totalClassesAttended must be a non-negative integer' });
      return;
    }
    if (totalClassesAttended > totalClassesHeld) {
      res.status(400).json({ message: 'totalClassesAttended cannot exceed totalClassesHeld' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.userId!,
      { totalClassesHeld, totalClassesAttended },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: sanitizeUser(user),
      percentage: calcPercentage(totalClassesAttended, totalClassesHeld),
    });
  } catch (err) {
    console.error('updateTotals error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
