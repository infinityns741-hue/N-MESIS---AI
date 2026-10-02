import React, { useState } from 'react';

interface UserAvatarProps {
  name: string;
  email?: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  avatarBg?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  photoUrl,
  size = 'md',
  avatarBg,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute initials (e.g. "Lucía Farfán" -> "LF" or "Lucía" -> "LU" as in user screenshot)
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'U';
    const clean = fullName.replace(/^(Dr\.|Ing\.|Prof\.|Mg\.)\s+/i, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Default color backgrounds for avatars
  const defaultBgs = [
    'bg-purple-600', // Matches user's screenshot!
    'bg-indigo-600',
    'bg-teal-600',
    'bg-cyan-600',
    'bg-emerald-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-blue-600',
  ];

  // Pick stable bg based on name
  const pickedBg = avatarBg || defaultBgs[
    Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % defaultBgs.length
  ];

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base font-bold',
  };

  // Determine possible avatar source
  // If explicitly passed photoUrl, use it.
  // Otherwise if email exists, we can try unavatar.io
  const resolvedPhoto = photoUrl || (email && !email.includes('test') && !email.includes('demo') 
    ? `https://unavatar.io/${encodeURIComponent(email)}?fallback=false` 
    : undefined);

  if (resolvedPhoto && !imageError) {
    return (
      <div className={`relative rounded-full overflow-hidden flex-shrink-0 shadow-md ${sizeClasses[size]} ${className}`}>
        <img
          src={resolvedPhoto}
          alt={name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Monogram circle (like in user's image with purple background and bold letters)
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white tracking-wide shadow-md flex-shrink-0 select-none ${pickedBg} ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
};
