import { requireStaff } from "@/lib/staff-auth";
import { db } from "@/lib/db";
import StaffSidebar from "./StaffSidebar";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staffMember = await (db as any).staffMember.findUnique({
    where: { id: session.id },
    select: { position: true },
  });

  return (
    <div className="flex min-h-screen" style={{ background: "#000" }}>
      <StaffSidebar staffName={session.name} staffPosition={staffMember?.position} />
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
