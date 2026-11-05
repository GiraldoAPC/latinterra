import './bootstrap';
import '../css/app.css';
import '../css/admin-design.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Latin Terra';

createInertiaApp({
    title: (title) => (title ? title : appName),
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const syncDesign = (page) => {
            document.body.classList.add('lt-app-design');
            document.body.classList.toggle('lt-document-page', /\/(ReciboPago|ReciboOtroPago|FichaMatricula|RecordNotas|Certificate|Certificado)$/.test(page.component));
        };
        syncDesign(props.initialPage);
        router.on('navigate', (event) => syncDesign(event.detail.page));
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    // Se usa el mismo GlobalLoader del sitio publico (ver PublicLayout /
    // AdminLayout) en vez de la barra de progreso por defecto de Inertia.
    progress: false,
});
