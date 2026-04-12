import type { Metadata } from "next";
import localFont from "next/font/local";

import { NuqsAdapter } from "nuqs/adapters/next";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://syncnotee.vercel.app"),
  title: "SYNCNOTE | AI 실전 면접 연습",
  description:
    "AI 면접관과 실시간 음성으로 대화하며 면접 실력을 키워보세요. 맞춤형 꼬리 질문과 상세한 피드백을 제공합니다.",
  openGraph: {
    title: "SYNCNOTE",
    description:
      "AI 면접관과 실시간 음성으로 대화하며 면접 실력을 키워보세요. 맞춤형 꼬리 질문과 상세한 피드백을 제공합니다.",
    images: ["/thumbnail.png"],
  },
};

const pretendard = localFont({
  src: [
    { path: "./fonts/Pretendard-Regular.subset.woff2", weight: "400" },
    { path: "./fonts/Pretendard-Medium.subset.woff2", weight: "500" },
    { path: "./fonts/Pretendard-SemiBold.subset.woff2", weight: "600" },
    { path: "./fonts/Pretendard-Bold.subset.woff2", weight: "700" },
  ],
  display: "swap",
  preload: true,
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <html lang="ko">
          <body className={`${pretendard.className} antialiased`}>
            <Toaster />
            {children}
          </body>
        </html>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
