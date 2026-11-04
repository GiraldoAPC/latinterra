import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { ShieldCheck, Plus } from 'lucide-react';
import { AdminPageHeader, AdminFormModal } from '@/Components/Admin/AdminPage';

function UserRow({ user, roles, ownId }) {
    const form = useForm({ role: user.role, is_active: user.is_active });
    return <tr className="border-b align-top"><td className="p-3"><strong>{user.name}</strong><p className="text-xs text-muted-foreground">{user.email}</p></td>
        <td className="p-3"><select aria-label={`Rol de ${user.name}`} disabled={user.id === ownId} className="rounded-md border p-2" value={form.data.role} onChange={(event) => form.setData('role', event.target.value)}>{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
        <td className="p-3"><label className="flex items-center gap-2"><input type="checkbox" disabled={user.id === ownId} checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />Activa</label></td>
        <td className="p-3"><Button size="sm" disabled={user.id === ownId || form.processing || !form.isDirty} onClick={() => form.put(`/admin/usuarios/roles/${user.id}`, { preserveScroll: true })}>Guardar</Button>
            {user.id === ownId && <p className="mt-1 text-xs text-muted-foreground">Tu cuenta</p>}
            {Object.entries(form.errors).map(([key, message]) => <p key={key} role="alert" className="mt-2 text-xs text-red-700">{message}</p>)}
        </td></tr>;
}

export default function RoleManagement({ users, roles, search }) {
    const { auth } = usePage().props;
    const [creating, setCreating] = useState(false);
    const [query, setQuery] = useState(search);
    const staff = useForm({ name: '', email: '', role: 'instructor', password: '', password_confirmation: '' });
    const inputClass = 'mt-1 block w-full rounded-md border p-2';
    return <>
        <AdminPageHeader icon={ShieldCheck} title="Roles y permisos" description="Gestiona las cuentas del personal y sus accesos al sistema." actions={<Button onClick={() => setCreating(true)}><Plus />Nueva cuenta</Button>} />
        <div className="mb-6 space-y-2 rounded-lg border bg-white p-4 text-sm">
            <p><strong>Administración y gerencia:</strong> gestión administrativa, ventas, inventario, pagos, certificados y cuentas.</p>
            <p><strong>Coordinador:</strong> seguimiento académico de todos los cursos y asignación de instructores.</p>
            <p><strong>Instructor:</strong> seguimiento de alumnos y notas de sus cursos asignados.</p>
            <p><strong>Estudiante:</strong> su aula virtual. Cada cuenta tiene un rol.</p>
            <p className="text-muted-foreground">Cambiar tu propio rol o estado requiere otro administrador. Siempre debe quedar una cuenta de administración activa.</p>
        </div>
        <AdminFormModal open={creating} onClose={() => { staff.reset('password', 'password_confirmation'); setCreating(false); }} processing={staff.processing} icon={ShieldCheck} title="Crear cuenta de personal" description="Define el rol y los datos de acceso de la nueva cuenta.">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); staff.post('/admin/usuarios/personal', { preserveScroll: true, onSuccess: () => { staff.reset(); setCreating(false); } }); }}>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm">Nombre<input required maxLength={150} className={inputClass} value={staff.data.name} onChange={(event) => staff.setData('name', event.target.value)} /></label>
                <label className="text-sm">Correo de acceso<input required type="email" maxLength={255} className={inputClass} value={staff.data.email} onChange={(event) => staff.setData('email', event.target.value)} /></label>
                <label className="text-sm">Rol<select className={inputClass} value={staff.data.role} onChange={(event) => staff.setData('role', event.target.value)}>{Object.entries(roles).filter(([role]) => role !== 'student').map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="text-sm">Contraseña inicial<input required type="password" minLength={8} autoComplete="new-password" className={inputClass} value={staff.data.password} onChange={(event) => staff.setData('password', event.target.value)} /></label>
                <label className="text-sm">Repetir contraseña<input required type="password" minLength={8} autoComplete="new-password" className={inputClass} value={staff.data.password_confirmation} onChange={(event) => staff.setData('password_confirmation', event.target.value)} /></label>
            </div>
            {Object.entries(staff.errors).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700">{message}</p>)}
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={staff.processing} onClick={() => { staff.reset('password', 'password_confirmation'); setCreating(false); }}>Cancelar</Button><Button disabled={staff.processing}>Crear cuenta</Button></div>
        </form>
        </AdminFormModal>
        <form className="mb-4 flex gap-3" onSubmit={(event) => { event.preventDefault(); router.get('/admin/usuarios/roles', { search: query }, { preserveState: true }); }}><input aria-label="Buscar cuentas por nombre o correo" placeholder="Nombre o correo" className="w-full rounded-md border p-2" value={query} onChange={(event) => setQuery(event.target.value)} /><Button type="submit" variant="outline">Buscar</Button></form>
        <div className="overflow-x-auto rounded-lg border bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Cuenta</th><th className="p-3">Rol</th><th className="p-3">Estado</th><th className="p-3">Acción</th></tr></thead><tbody>{users.data.map((user) => <UserRow key={`${user.id}:${user.role}:${user.is_active}`} user={user} roles={roles} ownId={auth.user.id} />)}</tbody></table></div>
        <div className="mt-4 flex gap-4">{users.prev_page_url && <Link href={users.prev_page_url}>Anterior</Link>}{users.next_page_url && <Link href={users.next_page_url}>Siguiente</Link>}</div>
    </>;
}
