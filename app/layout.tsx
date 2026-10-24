import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AiChatWidget } from './components/chat/AiChatWidget';
import { CartDrawerWrapper } from './components/layout/CartDrawerWrapper';
import { PushNotificationPrompt } from './components/notifications/PushNotificationPrompt';
import { StorefrontProviders } from './components/providers/StorefrontProviders';
import '../src/index.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#146e6d',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'GrowMedica',
  description: 'Prémiové prírodné doplnky stravy',
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GrowMedica',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body className={inter.className}>
        <StorefrontProviders>
          {children}
          <CartDrawerWrapper />
          <PushNotificationPrompt />
          <AiChatWidget />
        </StorefrontProviders>
      </body>
    </html>
  );
}
