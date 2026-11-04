import { Link, usePage } from '@inertiajs/react';
import FlashToast from '@/Components/Shared/FlashToast';

export default function AcademicLayout({ children }) {
    const { auth } = usePage().props;
    const roles = { admin: 'Administración', manager: 'Gerencia', coordinator: 'Coordinador', instructor: 'Instructor' };
    return <div className="min-h-screen bg-slate-50">
        <FlashToast />
        <header className="border-b bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <Link href="/academico" className="font-bold text-[#024A7D]">Acceso Vertical Perú · Panel académico</Link>
            <div className="flex flex-wrap items-center gap-4 text-sm"><span>{auth.user.name} · {roles[auth.user.role]}</span>
                {['admin', 'manager'].includes(auth.user.role) && <Link className="underline" href="/admin">Administración</Link>}
                <Link className="underline" href="/logout" method="post" as="button">Cerrar sesión</Link>
            </div>
        </div></header>
        <main className="mx-auto max-w-6xl p-5 sm:p-8">{children}</main>
    </div>;
}
