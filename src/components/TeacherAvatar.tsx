import React from 'react';

interface TeacherAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
  avatarUrl?: string;
  name?: string;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  size = 'md',
  className = '',
  showBadge = false,
  avatarUrl,
  name = 'Faculty Member'
}) => {
  const [imgError, setImgError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
    '2xl': 'w-28 h-28 text-2xl'
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'FA';

  const defaultImg = '/assets/images/image_72318e78.png';
  const resolvedUrl = avatarUrl || defaultImg;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-teal-300 shadow-md bg-teal-800 flex items-center justify-center shrink-0`}
      >
        {!imgError && resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-extrabold tracking-wider">
            {initials}
          </div>
        )}
      </div>
      {showBadge && (
        <span
          title="CTET & B.Ed Verified Teacher"
          className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border-2 border-white shadow text-[10px]"
        >
          ✓
        </span>
      )}
    </div>
  );
};
