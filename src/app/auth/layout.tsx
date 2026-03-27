import Providers from "@/components/storefront/Providers";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
