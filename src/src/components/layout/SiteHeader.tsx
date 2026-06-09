import React from 'react';
import { AnnouncementBar } from './AnnouncementBar';
import { SiteHeaderClient, SiteHeaderLabels } from './SiteHeaderClient';
import { StorefrontNavItem } from '@/lib/theme/storefront-types';
interface SiteHeaderProps {
  announcementMessage?: string;
  navItems: StorefrontNavItem[];
  cartCount: number;
  showAccountLink?: boolean;
  labels?: SiteHeaderLabels;
}
export const SiteHeader = ({
  announcementMessage,
  navItems,
  cartCount,
  showAccountLink = true,
  labels
}: SiteHeaderProps) => {
  return (
    <>
      {announcementMessage && <AnnouncementBar message={announcementMessage} />}
      <SiteHeaderClient
        navItems={navItems}
        cartCount={cartCount}
        showAccountLink={showAccountLink}
        labels={labels} />
      
    </>);

};