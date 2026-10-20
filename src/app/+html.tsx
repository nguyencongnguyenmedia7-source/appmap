import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML layout for CITYVERSE Premium Dark Explorer.
 * Injects CSS variables, responsive viewport, safe-area variables,
 * Plus Jakarta Sans font, and polished mobile web ergonomics.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#080D18" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <title>CITYVERSE • Bản đồ & Khám phá Việt Nam</title>
        <meta
          name="description"
          content="CITYVERSE — Nền tảng bản đồ số thực tế & check-in du lịch, ẩm thực, văn hóa Việt Nam."
        />

        {/* Google Fonts: Plus Jakarta Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg-canvas: #080D18;
            --surface-base: #111827;
            --surface-elevated: #1B2435;
            --primary-blue: #4F7DFF;
            --electric-cyan: #20D6E7;
            --accent-violet: #8B7CFF;
            --text-main: #F4F7FF;
            --text-secondary: #A3AEC2;
            --text-muted: #76839A;
            --border-subtle: rgba(255, 255, 255, 0.10);
            --safe-top: env(safe-area-inset-top, 0px);
            --safe-bottom: env(safe-area-inset-bottom, 0px);
            --safe-left: env(safe-area-inset-left, 0px);
            --safe-right: env(safe-area-inset-right, 0px);
          }

          * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
            margin: 0;
            padding: 0;
          }

          html, body, #root {
            width: 100%;
            height: 100%;
            height: 100dvh;
            margin: 0;
            padding: 0;
            background-color: var(--bg-canvas);
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
          }

          /* Smooth touch & clean scrolling */
          .no-scrollbar::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .no-scrollbar {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }

          /* Sleek scrollbar for dropdowns */
          ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(17, 24, 39, 0.5);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.12);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.22);
          }

          /* Transitions */
          button, input, [role="button"] {
            transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background-color 180ms ease, border-color 180ms ease, opacity 180ms ease;
          }
          [role="button"]:active {
            transform: scale(0.975);
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
