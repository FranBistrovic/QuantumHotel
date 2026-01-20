
// app/layout.tsx

import "./globals.css";
import { DashboardLayout } from "./components/DashboardLayoutuser";

export const metadata = {
  title: "Quantum Hotel",
  description: "Hotel u Zagrebu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <body style={{ margin: 0, padding: 0 }}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
