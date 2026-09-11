import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Latin Terra';

createInertiaApp({
    title: (title) => (title ? title : appName),
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    // Se usa el mismo GlobalLoader del sitio publico (ver PublicLayout /
    // AdminLayout) en vez de la barra de progreso por defecto de Inertia.
    progress: false,
});
