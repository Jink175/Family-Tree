import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import  ToastProvider  from "@/components/providers/toast-provider";
import { DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { UserProvider } from "@/lib/user-context"
import { TreeProvider } from "@/lib/tree-context";
import ScrollToTop from '@/app/landpage/ScrollToTop'
import Aoscompo from '@/utils/aos'
const font = DM_Sans({ subsets: ['latin'] })
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'FAMILY TREE',
  description: 'Create and Visualize Your Family History',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <link rel='icon' href='/logo.svg' type='image/x-icon'></link>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black `}
        
      >
        <Toaster position='top-center' toastOptions={{
            duration: 3000,
          }}/>
        <TreeProvider>
          <UserProvider>
            <Header />
              <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>{children}</main>
            <Footer />
          </UserProvider>
        </TreeProvider>
          <ScrollToTop />
      </body>
    </html>
  );
}
