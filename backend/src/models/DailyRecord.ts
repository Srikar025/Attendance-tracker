import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyRecord extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  classesHeld: number;
  classesAttended: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyRecordSchema = new Schema<IDailyRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    classesHeld: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
    },
    classesAttended: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index: one record per user per date
DailyRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

// Validate classesAttended <= classesHeld
DailyRecordSchema.pre('save', function (next) {
  if (this.classesAttended > this.classesHeld) {
    return next(
      new Error('classesAttended cannot exceed classesHeld')
    );
  }
  next();
});

export default mongoose.model<IDailyRecord>('DailyRecord', DailyRecordSchema);
