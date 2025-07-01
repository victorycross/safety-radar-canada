
import React from 'react';
import { PasswordService, PasswordStrength } from '@/services/passwordService';

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (strength: PasswordStrength) => void;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  onStrengthChange
}) => {
  const strength = React.useMemo(() => {
    const result = PasswordService.validatePassword(password);
    onStrengthChange?.(result);
    return result;
  }, [password, onStrengthChange]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded ${
              level <= strength.score
                ? PasswordService.getStrengthColor(strength.score)
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          Strength: {PasswordService.getStrengthLabel(strength.score)}
        </span>
        {strength.isValid && (
          <span className="text-green-600 text-sm">✓ Strong enough</span>
        )}
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <ul className="text-sm text-gray-600 space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-center space-x-1">
              <span className="text-red-500">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
