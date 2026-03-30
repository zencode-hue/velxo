import { requireAdmin } from "@/lib/admin-auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#0e0f14]">
      <AdminSidebar />
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

