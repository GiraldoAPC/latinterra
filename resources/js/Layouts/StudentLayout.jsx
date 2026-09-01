import { Link, usePage } from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { GraduationCap, LogOut, ExternalLink } from "lucide-react";

export default function StudentLayout({ title, children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-[#f4f7fb]">
            <header className="sticky top-0 z-40 border-b bg-white">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                    <Link href="/aula-virtual/mis-cursos" className="flex items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#58b22d] text-white">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="leading-tight">
                            <div className="font-bold text-[#14264a]">Latin Terra</div>
                            <div className="text-xs text-slate-500">Aula Virtual</div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <a href="/" className="flex items-center gap-1.5 text-slate-500">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ir al sitio web
                            </a>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 px-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback>{(auth?.user?.name || "U")[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-sm md:block">
                                        {auth?.user?.name || "Usuario"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/aula-virtual/mis-cursos">Mis cursos</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Perfil</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button" className="w-full">
                                        <span className="flex items-center gap-2">
                                            <LogOut className="h-4 w-4" />
                                            Cerrar sesión
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                {title && <h1 className="mb-4 text-xl font-bold text-[#14264a]">{title}</h1>}
                {children}
            </main>
        </div>
    );
}
