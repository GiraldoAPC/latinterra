import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function AdminDashboard({ auth }) {
  return (
    <>
      <Head title="Admin" />

      <AdminLayout title="Dashboard">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Productos</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">0</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">0</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Cotizaciones</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">0</CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Panel Admin</CardTitle>
            <Button>Nuevo producto</Button>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Bienvenido, {auth.user.name}
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
