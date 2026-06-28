import React, { useEffect, useRef } from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  animate?: boolean;
}

const getColor = (pct: number): string => {
  if (pct >= 75) return '#22c55e';
  if (pct >= 60) return '#f59e0b';
  return '#ef4444';
};

const getGlow = (pct: number): string => {
  if (pct >= 75) return 'rgba(34, 197, 94, 0.4)';
  if (pct >= 60) return 'rgba(245, 158, 11, 0.4)';
  return 'rgba(239, 68, 68, 0.4)';
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 180,
  strokeWidth = 12,
  animate = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getColor(percentage);
  const glow = getGlow(percentage);
  const displayRef = useRef<HTMLSpanElement>(null);

  // Animated counter
  useEffect(() => {
    if (!animate || !displayRef.current) return;
    const target = percentage;
    const duration = 800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target * 10) / 10;
      if (displayRef.current) displayRef.current.textContent = `${current}%`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [percentage, animate]);

  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-raised)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: animate ? 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease' : 'none',
            filter: `drop-shadow(0 0 8px ${glow})`,
          }}
        />
      </svg>
      {/* Center text */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}>
        <span
          ref={displayRef}
          style={{
            fontSize: size * 0.18,
            fontWeight: 800,
            color,
            letterSpacing: '-1px',
            lineHeight: 1,
            fontFamily: 'var(--font-family)',
            transition: 'color 0.4s ease',
          }}
        >
          {percentage}%
        </span>
        <span style={{
          fontSize: 11,
          color: 'var(--color-text-muted)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          Attendance
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;
