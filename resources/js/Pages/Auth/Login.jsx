import { useEffect, useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Button } from "@/Components/ui/button";
import { Head, Link, useForm } from "@inertiajs/react";
import { Eye, EyeOff, User, Lock, LogIn, CheckCircle2 } from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesion" />

            <div className="mb-6 text-center sm:mb-8">
                <h2 className="text-xl font-extrabold text-[#00ADEE] sm:text-2xl">Iniciar sesión</h2>
                <p className="mt-2 text-sm text-muted-foreground">Bienvenido. Ingresa tus credenciales para continuar.</p>
            </div>

            {status && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5 sm:space-y-6">
                <div>
                    <div className="flex overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-all focus-within:border-[#024A7D] focus-within:ring-4 focus-within:ring-[#024A7D]/15">
                        <span className="flex w-12 shrink-0 items-center justify-center bg-[#024A7D] text-white">
                            <User className="h-4 w-4" />
                        </span>
                        <input
                            id="email"
                            type="text"
                            name="email"
                            placeholder="Usuario (correo o DNI)"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData("email", e.target.value)}
                            className="w-full border-0 bg-transparent px-4 py-6 text-base text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <div className="flex overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-all focus-within:border-[#00ADEE] focus-within:ring-4 focus-within:ring-[#00ADEE]/15">
                        <span className="flex w-12 shrink-0 items-center justify-center bg-[#00ADEE] text-white">
                            <Lock className="h-4 w-4" />
                        </span>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Contraseña"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) => setData("password", e.target.value)}
                            className="w-full border-0 bg-transparent px-4 py-6 text-base text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="flex w-10 shrink-0 items-center justify-center text-slate-400 hover:text-[#024A7D]"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData("remember", e.target.checked)}
                            className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#00ADEE] focus:ring-[#00ADEE]/40"
                        />
                        Mantener sesión iniciada
                    </label>

                    {canResetPassword && (
                        <Link href={route("password.request")} className="shrink-0 text-sm font-medium text-[#024A7D] hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                <Button type="submit" className="w-full rounded-lg py-6 text-base font-bold uppercase tracking-wide" disabled={processing}>
                    <LogIn className="h-4 w-4" />
                    {processing ? "Ingresando..." : "Ingresar"}
                </Button>
            </form>
        </GuestLayout>
    );
}
