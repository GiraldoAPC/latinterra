import { Link, usePage } from "@inertiajs/react";
import { PageIcon } from '@/Components/Shared/PageDesign';
import { HardHat, ShieldCheck, Wrench, GraduationCap } from "lucide-react";

const TAGS = ["Trabajos en altura", "EPP", "Certificaciones", "Capacitación"];

const FEATURES = [
    { icon: HardHat, label: "Equipo de protección certificado" },
    { icon: GraduationCap, label: "Cursos y certificaciones" },
    { icon: Wrench, label: "Inventario y ventas centralizados" },
];

/**
 * Layout de las paginas de autenticacion (login, registro, reset password,
 * etc): panel de marca a la izquierda (oculto en mobile) + card del
 * formulario a la derecha, con la paleta de Acceso Vertical Peru.
 */
export default function Guest({ children }) {
    const { component } = usePage();
    const titles = { Register: 'Crear una cuenta', ForgotPassword: 'Recuperar contraseña', ResetPassword: 'Nueva contraseña', VerifyEmail: 'Verifica tu correo', ConfirmPassword: 'Confirma tu contraseña' };
    const title = titles[component.split('/').at(-1)];
    return (
        <div className="lt-fullscreen-layout flex min-h-dvh w-full flex-col lg:h-dvh lg:flex-row">
            <div className="relative hidden w-1/2 flex-col overflow-hidden bg-[#024A7D] p-8 text-white lg:flex lg:p-10 xl:p-12">
                <img
                    src="/assets/img/slider/slider4.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#024A7D] via-[#035c95] to-[#00ADEE] opacity-90" />
                <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-40 -right-24 h-[26rem] w-[26rem] rounded-full bg-white/5 blur-3xl" />
                <div className="pointer-events-none absolute right-10 top-1/3 h-64 w-64 rounded-full border border-white/10" />

                <div className="relative z-10 flex flex-1 flex-col justify-center">
                    <div className="mx-auto max-w-md space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {TAGS.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-white"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#7fe0ff] shadow-[0_0_8px_2px_rgba(127,224,255,0.7)]" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl font-extrabold leading-tight">
                            Especialistas en trabajos en altura y equipo de protección
                        </h1>
                        <p className="text-sm leading-relaxed text-white/75">
                            Gestiona cursos, certificaciones, inventario y ventas de Acceso Vertical Perú desde un
                            mismo panel.
                        </p>

                        <div className="flex flex-col gap-3 pt-2">
                            {FEATURES.map((f) => (
                                <div key={f.label} className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                        <f.icon className="h-4.5 w-4.5" />
                                    </span>
                                    <span className="text-sm font-medium text-white/90">{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-center gap-2 text-center text-xs font-medium text-white/60">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Acceso restringido a personal autorizado
                </div>
            </div>

            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-between gap-5 overflow-y-auto bg-gradient-to-br from-sky-50/70 via-white to-sky-50 px-5 py-8 sm:gap-6 sm:px-6 sm:py-10 lg:w-1/2">
                <Link href="/" className="flex shrink-0 items-center">
                    <img
                        src="/assets/img/acceso-vertical-form.png"
                        alt="Acceso Vertical Peru"
                        className="h-32 w-auto sm:h-24 lg:h-28"
                    />
                </Link>

                <div className="w-full max-w-md shrink-0 overflow-hidden rounded-3xl border border-[#024A7D]/10 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(2,74,125,0.3)] sm:p-8">
                    <div className="mb-5 flex items-center gap-3 border-b border-[#024A7D]/10 pb-5"><PageIcon small icon={ShieldCheck} /><div><p className="text-xs font-medium text-slate-400">Acceso Vertical Perú</p>{title ? <h1 className="text-lg font-semibold text-[#024A7D]">{title}</h1> : <p className="font-semibold text-[#024A7D]">Bienvenido a tu plataforma</p>}</div></div>
                    {children}
                </div>

                <p className="shrink-0 px-4 text-center text-[10px] leading-relaxed text-slate-400 sm:text-[11px]">
                    © {new Date().getFullYear()} Acceso Vertical Perú. Todos los derechos reservados.
                    <br />
                    Implementado por <span className="font-semibold text-slate-500">MR INFRAWEB</span>.
                </p>
            </div>
        </div>
    );
}
