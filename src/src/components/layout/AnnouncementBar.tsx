import React from 'react';
interface AnnouncementBarProps {
  message: string;
}
export const AnnouncementBar = ({ message }: AnnouncementBarProps) =>
<div className="bg-gm-text text-white text-xs md:text-sm font-medium py-2.5 text-center px-4 tracking-wide relative z-[60]">
    {message}
  </div>;