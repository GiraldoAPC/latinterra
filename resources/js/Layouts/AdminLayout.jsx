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
} from "lucide-react";

function NavItem({ href, icon: Icon, label }) {
    const { url } = usePage();
    const active = url === href || url.startsWith(href + "/");

    return (
        <Link
            href={href}
            className={[
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
        >
            <Icon className="h-4 w-4" />
            <span className="truncate">{label}</span>
        </Link>
    );
}

function SidebarContent() {
    return (
        <div className="flex h-full flex-col">
            <div className="px-4 py-4">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <div className="leading-tight">
                        <div className="font-semibold">Latin Terra</div>
                        <div className="text-xs text-muted-foreground">
                            Admin Panel
                        </div>
                    </div>
                </Link>
            </div>

            <Separator />

            <div className="flex-1 px-3 py-3 space-y-1">
                <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                    MENÚ
                </div>

                <NavItem
                    href="/admin"
                    icon={LayoutDashboard}
                    label="Dashboard"
                />
                <NavItem
                    href="/admin/products"
                    icon={Package}
                    label="Productos"
                />
                <NavItem
                    href="/admin/categories"
                    icon={Tags}
                    label="Categorías"
                />
                <NavItem href="/admin/brands" icon={Layers} label="Marcas" />
                <NavItem
                    href="/admin/quotes"
                    icon={FileText}
                    label="Cotizaciones"
                />
                <NavItem href="/admin/users" icon={Users} label="Usuarios" />
            </div>

            <Separator />

            <div className="p-3">
                <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                    <Settings className="h-4 w-4" />
                    Configuración
                </Link>
            </div>
        </div>
    );
}

export default function AdminLayout({ title = "Admin", children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card md:block">
                <SidebarContent />
            </aside>

            {/* Main */}
            <div className="md:pl-64">
                {/* Header */}
                <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
                    <div className="flex h-14 items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            {/* Mobile sidebar */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72">
                                    <SidebarContent />
                                </SheetContent>
                            </Sheet>

                            <div className="font-semibold">{title}</div>
                        </div>

                        {/* User dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 px-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback>
                                            {(auth?.user?.name || "U")[0]}
                                        </AvatarFallback>
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
                                    <Link href="/profile">Perfil</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full"
                                    >
                                        <span className="flex items-center gap-2">
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
    );
}
