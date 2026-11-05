import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader, PageIcon, Surface } from '@/Components/Shared/PageDesign';
import { Package, GraduationCap, FileText, Users, ClipboardList, ShieldCheck, ArrowUpRight, LayoutDashboard } from 'lucide-react';

const modules = [
    [Package, 'Inventario', 'Productos, marcas y existencias disponibles.', '/admin/products'],
    [FileText, 'Cotizaciones', 'Documentos comerciales y seguimiento de ventas.', '/admin/quotes'],
    [GraduationCap, 'Cursos', 'Contenido, clases y evaluaciones del aula virtual.', '/admin/cursos'],
    [Users, 'Estudiantes', 'Perfiles, inscripciones y seguimiento de pagos.', '/admin/cursos/estudiantes'],
    [ClipboardList, 'Movimientos', 'Compras y transferencias del inventario.', '/admin/inventario/movimientos'],
    [ShieldCheck, 'Roles y permisos', 'Cuentas del personal y acceso al sistema.', '/admin/usuarios/roles'],
];
export default function AdminDashboard({ auth }) {
    return <><Head title="Panel administrativo" /><AdminLayout title="Dashboard">
        <PageHeader icon={LayoutDashboard} title="Panel administrativo" description={`Hola, ${auth.user.name}. Accede a las herramientas de gestión.`} />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{modules.map(([Icon, title, description, href]) => <Surface key={href} className="transition-shadow hover:shadow-lg"><Link href={href} className="group block p-6"><div className="flex items-center justify-between"><PageIcon small icon={Icon} /><ArrowUpRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-[#00ADEE]" /></div><h2 className="mb-2 mt-5 text-lg font-semibold text-[#024A7D]">{title}</h2><p className="text-sm leading-relaxed text-slate-500">{description}</p></Link></Surface>)}</div>
    </AdminLayout></>;
}
