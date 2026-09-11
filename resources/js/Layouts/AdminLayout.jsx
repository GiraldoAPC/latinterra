import { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";
import { Input } from "@/Components/ui/input";
import GlobalSearch from "@/Components/Admin/GlobalSearch";
import GlobalLoader from "@/Components/GlobalLoader";
import FlashToast from "@/Components/Shared/FlashToast";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
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

import {
    LayoutDashboard,
    Package,
    Tags,
    Layers,
    FileText,
    Users,
    Menu,
    Settings,
    LogOut,
    GraduationCap,
    Search,
    Bell,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronRight,
    ChevronDown,
    UserCircle,
    Globe,
    Boxes,
    ClipboardList,
    Truck,
    Award,
    ShoppingCart,
    ShoppingBag,
    Building2,
    ShieldCheck,
    ListChecks,
} from "lucide-react";

const NAV = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    {
        label: "Cursos",
        icon: GraduationCap,
        base: "/admin/cursos",
        children: [
            { href: "/admin/cursos", icon: GraduationCap, label: "Todos los cursos" },
            { href: "/admin/cursos/estudiantes", icon: Users, label: "Estudiantes" },
            { href: "/admin/cursos/certificados", icon: Award, label: "Certificados" },
            { href: "/admin/catalogos", icon: ListChecks, label: "Catalogos" },
        ],
    },
    {
        label: "Inventario",
        icon: Boxes,
        base: "/admin/inventario",
        children: [
            { href: "/admin/products", icon: Package, label: "Productos" },
            { href: "/admin/categories", icon: Tags, label: "Categorías" },
            { href: "/admin/brands", icon: Layers, label: "Marcas" },
            { href: "/admin/inventario/movimientos", icon: ClipboardList, label: "Movimientos" },
            { href: "/admin/inventario/proveedores", icon: Truck, label: "Proveedores" },
        ],
    },
    {
        label: "Ventas",
        icon: ShoppingCart,
        base: "/admin/ventas",
        children: [
            { href: "/admin/quotes", icon: FileText, label: "Cotizaciones" },
            { href: "/admin/ventas/pedidos", icon: ShoppingCart, label: "Pedidos de cursos" },
            { href: "/admin/ventas/otros-pagos", icon: ShoppingBag, label: "Ventas" },
            { href: "/admin/clientes", icon: Building2, label: "Clientes" },
        ],
    },
    {
        label: "Usuarios",
        icon: Users,
        base: "/admin/usuarios",
        children: [
            { href: "/admin/users", icon: Users, label: "Usuarios" },
            { href: "/admin/usuarios/roles", icon: ShieldCheck, label: "Roles y permisos" },
        ],
    },
    { href: "/admin/settings", icon: Settings, label: "Configuración" },
];

function isActive(url, href) {
    if (href === "/admin") return url === "/admin";
    return url === href || url.startsWith(href + "/");
}

function groupIsActive(url, item) {
    if (!item.children) return isActive(url, item.href);
    return item.children.some((c) => isActive(url, c.href));
}

function NavLink({ href, icon: Icon, label, collapsed, sub }) {
    const { url } = usePage();
    const active = isActive(url, href);

    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
                "group relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2" : sub ? "py-1.5 pl-9 pr-3" : "px-3",
                active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 lt-hover-sweep hover:text-white [--lt-sweep-color:rgba(255,255,255,0.08)]"
            )}
        >
            {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#00ADEE]" />
            )}
            {(!sub || collapsed) && (
                <Icon
                    className={cn(
                        "h-4 w-4 shrink-0",
                        active && "text-[#59CAF4]"
                    )}
                />
            )}
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

function NavGroup({ item, collapsed, open, onToggle }) {
    const { url } = usePage();
    const active = groupIsActive(url, item);

    if (collapsed) {
        // Collapsed: show only the group icon, linking to its first child.
        return (
            <NavLink
                href={item.children[0].href}
                icon={item.icon}
                label={item.label}
                collapsed
            />
        );
    }

    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                        ? "text-white"
                        : "text-slate-400 lt-hover-sweep hover:text-white [--lt-sweep-color:rgba(255,255,255,0.08)]"
                )}
            >
                <item.icon
                    className={cn(
                        "h-4 w-4 shrink-0",
                        active && "text-[#59CAF4]"
                    )}
                />
                <span className="flex-1 truncate text-left">{item.label}</span>
                <ChevronDown
                    className={cn(
                        "h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>
            {open && (
                <div className="mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                        <NavLink key={child.href} sub {...child} />
                    ))}
                </div>
            )}
        </div>
    );
}

function SidebarContent({ collapsed = false, onToggleCollapse }) {
    const { url } = usePage();
    const activeGroupLabel =
        NAV.find((item) => item.children && groupIsActive(url, item))?.label ??
        null;
    const [openGroup, setOpenGroup] = useState(activeGroupLabel);

    useEffect(() => {
        if (activeGroupLabel) setOpenGroup(activeGroupLabel);
    }, [activeGroupLabel]);

    return (
        <div className="flex h-full flex-col bg-[#024A7D] text-slate-300">
            <div
                className={cn(
                    "flex h-16 items-center gap-2 px-4",
                    collapsed && "justify-center px-2"
                )}
            >
                <Link href="/admin" className="flex min-w-0 items-center gap-2">
                    <img
                        src="/assets/img/LOGO-ACCESO-VERTICAL.png"
                        alt="Acceso Vertical Perú"
                        className="h-10 w-10 shrink-0 object-contain"
                    />
                    {!collapsed && (
                        <div className="min-w-0 leading-tight">
                            <div className="truncate font-semibold text-white">
                                Acceso Vertical Perú
                            </div>
                            <div className="text-xs text-slate-400">
                                Admin Panel
                            </div>
                        </div>
                    )}
                </Link>
            </div>

            <Separator className="bg-white/10" />

            <nav className="lt-admin-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {NAV.map((item) =>
                    item.children ? (
                        <NavGroup
                            key={item.label}
                            item={item}
                            collapsed={collapsed}
                            open={openGroup === item.label}
                            onToggle={() =>
                                setOpenGroup((prev) =>
                                    prev === item.label ? null : item.label
                                )
                            }
                        />
                    ) : (
                        <NavLink key={item.href} collapsed={collapsed} {...item} />
                    )
                )}
            </nav>

            <Separator className="bg-white/10" />

            <div className="p-3">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 lt-hover-sweep hover:text-white [--lt-sweep-color:rgba(255,255,255,0.08)]",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Ir al sitio web" : undefined}
                >
                    <Globe className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Ir al sitio web</span>}
                </Link>

                {onToggleCollapse && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className={cn(
                            "mt-1 hidden w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 lt-hover-sweep hover:text-white [--lt-sweep-color:rgba(255,255,255,0.08)] md:flex",
                            collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? "Expandir menú" : undefined}
                    >
                        {collapsed ? (
                            <PanelLeftOpen className="h-4 w-4 shrink-0" />
                        ) : (
                            <>
                                <PanelLeftClose className="h-4 w-4 shrink-0" />
                                <span>Colapsar menú</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function currentPageLabel(url) {
    for (const item of NAV) {
        if (item.children) {
            const child = item.children.find((c) => isActive(url, c.href));
            if (child) return `${item.label} · ${child.label}`;
        } else if (isActive(url, item.href)) {
            return item.label;
        }
    }
    return null;
}

export default function AdminLayout({ title = "Admin", children }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [collapsed, setCollapsed] = useState(false);
    const showLoader = useGlobalLoader();

    useEffect(() => {
        const stored = window.localStorage.getItem("lt-admin-sidebar-collapsed");
        if (stored === "1") setCollapsed(true);
    }, []);

    function toggleCollapse() {
        setCollapsed((prev) => {
            const next = !prev;
            window.localStorage.setItem(
                "lt-admin-sidebar-collapsed",
                next ? "1" : "0"
            );
            return next;
        });
    }

    const breadcrumbLabel = currentPageLabel(url);
    const initials = (auth?.user?.name || "Usuario")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");

    return (
        <>
        <GlobalLoader show={showLoader} />
        <FlashToast />
        <div
            className={cn(
                "min-h-screen bg-muted/30 md:grid md:transition-[grid-template-columns] md:duration-200",
                collapsed ? "md:grid-cols-[4rem_1fr]" : "md:grid-cols-[16rem_1fr]"
            )}
        >
            {/* Sidebar desktop. CSS Grid (not fixed + padding) keeps this and
                the content column pixel-perfect with no subpixel gap. */}
            <aside className="hidden md:sticky md:top-0 md:block md:h-screen md:overflow-hidden">
                <SidebarContent
                    collapsed={collapsed}
                    onToggleCollapse={toggleCollapse}
                />
            </aside>

            {/* Main */}
            <div className="min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-40 border-b bg-background/80 shadow-sm backdrop-blur">
                    <div className="flex h-16 items-center gap-3 px-4 md:px-6">
                        {/* Mobile sidebar */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 md:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>

                        {/* Breadcrumb / title */}
                        <div className="flex min-w-0 items-center gap-1.5 text-sm">
                            <span className="hidden text-muted-foreground sm:inline">
                                Admin
                            </span>
                            {breadcrumbLabel && breadcrumbLabel !== title && (
                                <>
                                    <ChevronRight className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
                                    <span className="hidden text-muted-foreground sm:inline">
                                        {breadcrumbLabel}
                                    </span>
                                </>
                            )}
                            <ChevronRight className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
                            <span className="truncate font-semibold">
                                {title}
                            </span>
                        </div>

                        {/* Search */}
                        <div className="hidden flex-1 items-center justify-center md:flex">
                            <div className="w-full max-w-sm">
                                <GlobalSearch />
                            </div>
                        </div>

                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative shrink-0 md:ml-1"
                                >
                                    <Bell className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72">
                                <DropdownMenuLabel>
                                    Notificaciones
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                    No hay notificaciones nuevas.
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="gap-2 px-2 shrink-0"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-[#00ADEE]/15 text-xs font-semibold text-[#024A7D]">
                                            {initials || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-left text-sm leading-tight lg:block">
                                        <span className="block max-w-[120px] truncate font-medium">
                                            {auth?.user?.name || "Usuario"}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            Administrador
                                        </span>
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
                                    <Link href="/profile">Perfil</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/">Ir al sitio web</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full"
                                    >
                                        <span className="flex items-center gap-2 text-destructive">
                                            <LogOut className="h-4 w-4" />
                                            Cerrar sesión
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page container */}
                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
        </>
    );
}
