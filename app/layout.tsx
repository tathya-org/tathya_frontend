import "./globals.css"
import { Noto_Sans_Devanagari } from "next/font/google"

const devFont = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ne" className={devFont.variable}>
      <body>{children}</body>
    </html>
  )
}
