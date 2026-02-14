import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Index() {
  return (
    <>
      <Head title="Productos" />
      <AdminLayout title="Productos">
        <div className="text-sm text-muted-foreground">
          Página en construcción.
        </div>
      </AdminLayout>
    </>
  );
}
