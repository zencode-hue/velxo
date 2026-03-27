import Navbar from "@/components/storefront/Navbar";
import Providers from "@/components/storefront/Providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </Providers>
  );
}
