import '@/app/globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'meddelivery',
  description: 'MedDelivery application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
