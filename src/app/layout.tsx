import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CodeTracker — College Coding Progress & Proctored Assessment Platform",
  description: "Turn coding progress into mastery! Track platform stats, aggregate LeetCode/Codeforces scores, and take proctored coding assessments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Dark mode temporarily disabled by user request. Defaulting to light mode.
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                
                // Disable right-click globally to prevent inspection
                document.addEventListener('contextmenu', event => event.preventDefault());
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F6F7FF] dark:bg-gray-900 text-[#1E1F2B] dark:text-[#E2E8F0] selection:bg-[#8B8CF6] selection:text-white transition-colors duration-300">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

