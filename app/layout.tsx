import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AiChatWidget } from './components/chat/AiChatWidget';
import { CartDrawerWrapper } from './components/layout/CartDrawerWrapper';
import { PushNotificationPrompt } from './components/notifications/PushNotificationPrompt';
import { StorefrontProviders } from './components/providers/StorefrontProviders';
import '../src/index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrowMedica',
  description: 'Prémiové prírodné doplnky stravy',
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
