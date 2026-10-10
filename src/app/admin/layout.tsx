import AdminShell from "@/components/admin/AdminShell";
import { Toaster } from "sonner";

export const metadata = {
  title: "Archai Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      {children}
      <Toaster theme="dark" position="bottom-right" />
    </AdminShell>
  );
}