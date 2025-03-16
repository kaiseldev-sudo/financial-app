import { useMemo } from 'react';

export default function PasswordStrengthIndicator({ password }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, message: '' };
    
    let score = 0;
    let checks = {
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    const messages = {
      0: { message: 'Very Weak', color: 'bg-red-500' },
      1: { message: 'Weak', color: 'bg-orange-500' },
      2: { message: 'Fair', color: 'bg-yellow-500' },
      3: { message: 'Good', color: 'bg-blue-500' },
      4: { message: 'Strong', color: 'bg-emerald-500' },
      5: { message: 'Very Strong', color: 'bg-emerald-600' }
    };

    return {
      score,
      ...messages[score],
      checks
    };
  }, [password]);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 w-full rounded-full ${
              i < strength.score ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {password && (
        <div className="space-y-1 mt-2">
          <p className={`text-sm ${strength.score > 2 ? 'text-emerald-600' : 'text-gray-500'}`}>
            {strength.message}
          </p>
          <ul className="text-xs space-y-1 text-gray-500">
            <li className={strength.checks.length ? 'text-emerald-600' : ''}>
              ✓ At least 8 characters
            </li>
            <li className={strength.checks.hasUpper ? 'text-emerald-600' : ''}>
              ✓ At least one uppercase letter
            </li>
            <li className={strength.checks.hasLower ? 'text-emerald-600' : ''}>
              ✓ At least one lowercase letter
            </li>
            <li className={strength.checks.hasNumber ? 'text-emerald-600' : ''}>
              ✓ At least one number
            </li>
            <li className={strength.checks.hasSpecial ? 'text-emerald-600' : ''}>
              ✓ At least one special character
            </li>
          </ul>
        </div>
      )}
    </div>
  );
} 