import { Inter as FontSans } from "@next/font/google"
import localFont from "@next/font/local"
import "./globals.css"
import { Toaster } from "@/ui/toast"
import { cn } from "@/lib/utils"
import { SiteFooter } from "@/components/site-footer"
import { AnalyticsWrapper } from "@/components/analytics"
import { ClientProvider } from "@/client/trpcClient"

const satoshi = localFont({
    src: "./Satoshi-Variable.woff2",
    variable: "--font-satoshi",
    weight: "300 900",
    display: "swap",
    style: "normal",
})

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-inter",
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClientProvider>
            <html
                lang="en"
                className={cn(
                    "bg-appbg font-sans text-brandtext-500 antialiased",
                    satoshi.variable,
                    fontSans.variable
                )}
            >
                <head />
                <body className="min-h-screen">
                    {children}
                    <Toaster position="bottom-right" />
                    <SiteFooter />
                    <AnalyticsWrapper />
                </body>
            </html>
        </ClientProvider>
    )
}
