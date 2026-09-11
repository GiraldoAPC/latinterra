import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import { Warehouse } from "lucide-react";

export default function Index({ warehouseMode }) {
    const [saving, setSaving] = useState(false);

    const toggle = (value) => {
        setSaving(true);
        router.put(
            "/admin/settings",
            { warehouse_mode: value },
            { preserveScroll: true, onFinish: () => setSaving(false) }
        );
    };

    return (
        <>
            <Head title="Configuración" />
            <AdminLayout title="Configuración">
                <div className="mb-6">
                    <h1 className="text-lg font-bold text-[#024A7D]">Configuración</h1>
                    <p className="text-sm text-muted-foreground">Ajustes generales del sistema.</p>
                </div>

                <Card className="max-w-xl">
                    <CardContent className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ADEE]/15 text-[#024A7D]">
                                    <Warehouse className="h-4.5 w-4.5" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-[#024A7D]">Control de almacén</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Cuando esta apagado (por defecto), una compra sube el stock directo — asi funciona hoy.
                                        <br />
                                        Cuando esta prendido, las compras entran a <strong>Almacén</strong> y hay que{" "}
                                        <strong>transferir a Ventas</strong> antes de poder vender — util cuando el almacén es un
                                        area fisica separada del punto de venta.
                                    </p>
                                </div>
                            </div>
                            <Switch checked={warehouseMode} disabled={saving} onCheckedChange={toggle} />
                        </div>
                    </CardContent>
                </Card>
            </AdminLayout>
        </>
    );
}
