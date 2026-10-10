import React from 'react';

interface MetricBarProps {
  label: string;
  value: number;
  unit: string;
  max: number;
  goodThreshold?: number;
  cautionThreshold?: number;
  neutral?: boolean;
}

export const MetricBar: React.FC<MetricBarProps> = ({
  label,
  value,
  unit,
  max,
  goodThreshold = 0,
  cautionThreshold = 0,
  neutral = false,
}) => {
  const fraction = Math.min(Math.max(value / max, 0), 1);
  const percentage = fraction * 100;

  // Calcolo posizioni stop del gradiente (0-100%)
  const goodPos = Math.min(Math.max((goodThreshold / max) * 100, 0), 100);
  const cautionPos = Math.min(Math.max((cautionThreshold / max) * 100, 0), 100);

  const gradientStyle = neutral
    ? '#B9D6E8'
    : `linear-gradient(to right, #7CFFB2 0%, #7CFFB2 ${goodPos}%, #FFD369 ${cautionPos}%, #FF7676 100%)`;

  return (
    <div className="metric-bar-group">
      <div className="metric-bar-header">
        <span className="metric-label">{label}</span>
        <span className="metric-value">
          {value.toFixed(1)} <span className="metric-unit">{unit}</span>
        </span>
      </div>
      <div className="metric-track">
        <div
          className="metric-fill"
          style={{
            width: `${percentage}%`,
            background: gradientStyle,
          }}
        />
      </div>
    </div>
  );
};
