import { User } from 'lucide-react';

export default function Avatar({ url, name, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  if (url) {
    return (
      <img 
        src={url} 
        alt={`${name}'s avatar`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  if (name) {
    const initial = name.charAt(0).toUpperCase();
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-emerald-100 text-emerald-600
                      flex items-center justify-center font-medium`}>
        {initial}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-100 text-gray-400
                    flex items-center justify-center`}>
      <User className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
    </div>
  );
} 