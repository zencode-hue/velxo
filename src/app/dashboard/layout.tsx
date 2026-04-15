import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import DashboardSidebar from "./DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <div className="flex min-h-screen bg-[#0d0a07]">
      <DashboardSidebar userName={session.user.name ?? session.user.email ?? "User"} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
