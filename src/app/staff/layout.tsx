import { requireStaff } from "@/lib/staff-auth";
import StaffSidebar from "./StaffSidebar";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  return (
    <div className="flex min-h-screen bg-[#0d0a07]">
      <StaffSidebar staffName={session.name} />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
