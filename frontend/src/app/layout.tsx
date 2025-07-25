import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Alligator - DeFi Yield Optimizer',
  description: 'Compare lending rates across Aave and Morpho protocols on Avalanche',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
