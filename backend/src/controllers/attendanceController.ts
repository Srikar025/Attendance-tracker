import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import DailyRecord from '../models/DailyRecord';

const calcPercentage = (attended: number, held: number): number => {
  if (held === 0) return 0;
  return Math.round((attended / held) * 100 * 10) / 10;
};

// POST /api/attendance/daily
export const createDailyRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, classesHeld, classesAttended } = req.body;
    const userId = req.userId!;

    // Validation
    if (!date || classesHeld === undefined || classesAttended === undefined) {
      res.status(400).json({ message: 'date, classesHeld, and classesAttended are required' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      res.status(400).json({ message: 'Cannot log attendance for a future date' });
      return;
    }
    if (!Number.isInteger(classesHeld) || classesHeld < 0 || classesHeld > 20) {
      res.status(400).json({ message: 'classesHeld must be an integer between 0 and 20' });
      return;
    }
    if (!Number.isInteger(classesAttended) || classesAttended < 0 || classesAttended > classesHeld) {
      res.status(400).json({ message: 'classesAttended must be between 0 and classesHeld' });
      return;
    }

    // Check if record already exists for this date
    const existing = await DailyRecord.findOne({ userId, date });
    if (existing) {
      res.status(409).json({ message: 'Already updated for this date', record: existing });
      return;
    }

    // Create daily record
    const dailyRecord = new DailyRecord({ userId, date, classesHeld, classesAttended });
    await dailyRecord.save();

    // Update user totals
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          totalClassesHeld: classesHeld,
          totalClassesAttended: classesAttended,
        },
      },
      { new: true }
    );

    res.status(201).json({
      dailyRecord,
      updatedUser: {
        totalClassesHeld: updatedUser!.totalClassesHeld,
        totalClassesAttended: updatedUser!.totalClassesAttended,
        percentage: calcPercentage(updatedUser!.totalClassesAttended, updatedUser!.totalClassesHeld),
      },
    });
  } catch (err) {
    console.error('createDailyRecord error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/daily?date=YYYY-MM-DD
export const getDailyRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query as { date: string };
    const userId = req.userId!;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ message: 'Valid date query param required (YYYY-MM-DD)' });
      return;
    }

    const record = await DailyRecord.findOne({ userId, date });
    if (!record) {
      res.status(404).json({ message: 'No record found for this date' });
      return;
    }

    res.json({ record });
  } catch (err) {
    console.error('getDailyRecord error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/attendance/daily/:id
export const updateDailyRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { classesHeld, classesAttended } = req.body;
    const userId = req.userId!;

    if (classesHeld === undefined || classesAttended === undefined) {
      res.status(400).json({ message: 'classesHeld and classesAttended are required' });
      return;
    }
    if (!Number.isInteger(classesHeld) || classesHeld < 0 || classesHeld > 20) {
      res.status(400).json({ message: 'classesHeld must be an integer between 0 and 20' });
      return;
    }
    if (!Number.isInteger(classesAttended) || classesAttended < 0 || classesAttended > classesHeld) {
      res.status(400).json({ message: 'classesAttended must be between 0 and classesHeld' });
      return;
    }

    const existingRecord = await DailyRecord.findOne({ _id: id, userId });
    if (!existingRecord) {
      res.status(404).json({ message: 'Record not found' });
      return;
    }

    // Calculate difference for totals adjustment
    const heldDiff = classesHeld - existingRecord.classesHeld;
    const attendedDiff = classesAttended - existingRecord.classesAttended;

    // Update the record
    existingRecord.classesHeld = classesHeld;
    existingRecord.classesAttended = classesAttended;
    await existingRecord.save();

    // Adjust user totals by difference
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          totalClassesHeld: heldDiff,
          totalClassesAttended: attendedDiff,
        },
      },
      { new: true }
    );

    res.json({
      dailyRecord: existingRecord,
      updatedUser: {
        totalClassesHeld: updatedUser!.totalClassesHeld,
        totalClassesAttended: updatedUser!.totalClassesAttended,
        percentage: calcPercentage(updatedUser!.totalClassesAttended, updatedUser!.totalClassesHeld),
      },
    });
  } catch (err) {
    console.error('updateDailyRecord error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/history
export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await DailyRecord.find({ userId: req.userId! })
      .sort({ date: -1 })
      .lean();

    res.json({ records });
  } catch (err) {
    console.error('getHistory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/stats
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId!).select('totalClassesHeld totalClassesAttended');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Calculate streak: only fetch the 'date' field for efficiency.
    // Capping at 365 is more than enough for any real-world streak.
    const records = await DailyRecord.find({ userId: req.userId! })
      .sort({ date: -1 })
      .select('date -_id')
      .limit(365)
      .lean();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < records.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      if (records[i].date === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    res.json({
      totalHeld: user.totalClassesHeld,
      totalAttended: user.totalClassesAttended,
      percentage: calcPercentage(user.totalClassesAttended, user.totalClassesHeld),
      streak,
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
