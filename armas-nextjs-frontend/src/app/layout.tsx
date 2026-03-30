import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

import { cookies } from "next/headers";
import Footer from "@/components/Footer"; // Import the Footer component

export const metadata: Metadata = {
    title: "ARMAS - Report Management",
    description: "Advanced Report Management Analytics System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const role = cookieStore.get('userRole')?.value || null;

    const initialAuth = {
        isAuthenticated: !!token,
        userRole: role,
    };

    return (
        <html lang="en">
            <body>
                <AuthProvider initialAuth={initialAuth}>
                    {children}
                    <Footer /> {/* Add the Footer component */}
                </AuthProvider>
            </body>
        </html>
    );
}
