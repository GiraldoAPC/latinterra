import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import RoleManagement from '@/Components/Admin/RoleManagement';

export default function Roles(props) {
  return (
    <>
      <Head title="Roles y permisos" />
      <AdminLayout title="Roles y permisos">
        <RoleManagement {...props} />
      </AdminLayout>
    </>
  );
}
