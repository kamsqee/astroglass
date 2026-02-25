import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { cn } from '../../lib/utils';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  fallback,
  className,
  imageClassName,
  fallbackClassName,
}) => {
  return (
    <Avatar className={className}>
      <AvatarImage 
        src={src} 
        alt={alt} 
        className={cn("object-cover", imageClassName)} 
      />
      <AvatarFallback className={fallbackClassName}>
        {fallback || alt?.charAt(0) || '?'}
      </AvatarFallback>
    </Avatar>
  );
};
