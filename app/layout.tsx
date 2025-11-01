import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MCQ Scanner - Online Exam Platform',
  description: 'MCQ Scanner and Exam Platform with AI-powered image extraction',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
