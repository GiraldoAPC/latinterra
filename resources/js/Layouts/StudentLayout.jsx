import { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { cn } from "@/lib/utils";
import FlashToast from "@/Components/Shared/FlashToast";
import {
    GraduationCap,
    LayoutGrid,
    LogOut,
    Menu,
    Globe,
    ChevronRight,
    UserCircle,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

const NAV = [
    { href: "/aula-virtual/mis-cursos", icon: GraduationCap, label: "Mis cursos" },
    { href: "/aula-virtual/catalogo", icon: LayoutGrid, label: "Catalogo de cursos" },
];

function isActive(url, href) {
    return url === href || url.startsWith(href + "/");
}

function NavLink({ href, icon: Icon, label, collapsed }) {
    const { url } = usePage();
    const active = isActive(url, href);

    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
                "relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2" : "px-3",
                active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 lt-hover-sweep hover:text-white [--lt-sweep-color:rgba(255,255,255,0.08)]"
            )}
        >
            {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#00ADEE]" />
            )}
            <Icon className={cn("h-4 w-4 shrink-0", active && "text-[#59CAF4]")} />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

function SidebarContent({ collapsed = false, onToggleCollapse }) {
    return (
        <div className="flex h-full flex-col bg-[#024A7D] text-slate-300">
            <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && "justify-center px-2")}>
                <Link href="/aula-virtual/mis-cursos" className="flex min-w-0 items-center gap-2">
                    <img
                        src="/assets/img/LOGO-ACCESO-VERTICAL.png"
                        alt="Acceso Vertical Perú"
                        className="h-10 w-10 shrink-0 object-contain"
                    />
                    {!collapsed && (
                        <div className="min-w-0 leading-tight">
                            <div className="truncate font-semibold text-white">Acceso Vertical Perú</div>
                            <div className="text-xs text-slate-400">Aula Virtual</div>
                        </div>
                    )}
                </Link>
            </div>

            <Separator className="bg-white/10" />

            <nav className="lt-admin-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {!collapsed && (
                    <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Menu
                    </div>
                )}
                {NAV.map((item) => (
                    <NavLink key={item.href} collapsed={collapsed} {...item} />
                ))}
            </nav>

            <Separator className="bg-white/10" />

            <div className="p-3">
                <a
                    href="/"
                    className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 lt-hover-sweep hover:text-white [--lt-sweep-color:rgba(255,255,255,0.08)]",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Ir al sitio web" : undefined}
                >
                    <Globe className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Ir al sitio web</span>}
                </a>

                {onToggleCollapse && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className={cn(
                            "mt-1 hidden w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 lt-hover-sweep hover:text-white [--lt-sweep-color:rgba(255,255,255,0.08)] md:flex",
                            collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? "Expandir menu" : undefined}
                    >
                        {collapsed ? (
                            <PanelLeftOpen className="h-4 w-4 shrink-0" />
                        ) : (
                            <>
                                <PanelLeftClose className="h-4 w-4 shrink-0" />
                                <span>Colapsar menu</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function StudentLayout({ title, children }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const stored = window.localStorage.getItem("lt-student-sidebar-collapsed");
        if (stored === "1") setCollapsed(true);
    }, []);

    function toggleCollapse() {
        setCollapsed((prev) => {
            const next = !prev;
            window.localStorage.setItem("lt-student-sidebar-collapsed", next ? "1" : "0");
            return next;
        });
    }

    const activeNav = NAV.find((item) => isActive(url, item.href));
    const initials = (auth?.user?.name || "Usuario")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");

    return (
        <>
        <FlashToast />
        <div
            className={cn(
                "min-h-screen bg-muted/30 md:grid md:transition-[grid-template-columns] md:duration-200",
                collapsed ? "md:grid-cols-[4rem_1fr]" : "md:grid-cols-[16rem_1fr]"
            )}
        >
            {/* CSS Grid (not fixed + padding) keeps the sidebar and content
                boundary pixel-perfect: both columns are laid out in the same
                pass, so no subpixel gap can appear between them. */}
            <aside className="hidden md:sticky md:top-0 md:block md:h-screen md:overflow-hidden">
                <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapse} />
            </aside>

            <div className="min-w-0">
                <header className="sticky top-0 z-40 border-b bg-background/80 shadow-sm backdrop-blur">
                    <div className="flex h-16 items-center gap-3 px-4 md:px-6">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>

                        <div className="flex min-w-0 items-center gap-1.5 text-sm">
                            <span className="hidden text-muted-foreground sm:inline">Aula Virtual</span>
                            {activeNav && title && activeNav.label !== title && (
                                <>
                                    <ChevronRight className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
                                    <span className="hidden text-muted-foreground sm:inline">{activeNav.label}</span>
                                </>
                            )}
                            {title && (
                                <>
                                    <ChevronRight className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
                                    <span className="truncate font-semibold">{title}</span>
                                </>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="ml-auto gap-2 px-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-[#00ADEE]/15 text-xs font-semibold text-[#024A7D]">
                                            {initials || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-left text-sm leading-tight lg:block">
                                        <span className="block max-w-[120px] truncate font-medium">
                                            {auth?.user?.name || "Usuario"}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">Estudiante</span>
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex items-center gap-2">
                                        <UserCircle className="h-4 w-4" />
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">
                                                {auth?.user?.name || "Usuario"}
                                            </div>
                                            <div className="truncate text-xs font-normal text-muted-foreground">
                                                {auth?.user?.email}
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/aula-virtual/mis-cursos">Mis cursos</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/aula-virtual/perfil">Perfil</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href="/">Ir al sitio web</a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button" className="w-full">
                                        <span className="flex items-center gap-2 text-destructive">
                                            <LogOut className="h-4 w-4" />
                                            Cerrar sesion
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
        </>
    );
}
