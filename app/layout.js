import { Inter } from "next/font/google";
import { blue } from "@mui/material/colors";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Part Picker-Pro!",
  description: " ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
