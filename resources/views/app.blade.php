<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" href="/assets/img/icono-pestana.png">

        @php
            $ogCatalog = [
                'Public/Home' => [
                    'title' => 'Latin Terra | Soluciones industriales, EPP y trabajo en altura',
                    'description' => 'Abastecimiento confiable en herramientas, equipos electricos, EPP, trabajos en altura y mas.',
                    'image' => 'slider/slider1.jpg',
                ],
                'Public/About' => [
                    'title' => 'Nosotros | Latin Terra',
                    'description' => 'Conoce Latin Terra: empresa peruana de productos industriales, comerciales y de seguridad.',
                    'image' => 'nosotros.jpg',
                ],
                'Public/Contacto' => [
                    'title' => 'Contacto | Latin Terra',
                    'description' => 'Contacta a Latin Terra para cotizaciones de EPP, herramientas, equipo electrico, ferreteria y soluciones industriales.',
                    'image' => 'encabezado/contactenos.jpg',
                ],
                'Public/Marcas' => [
                    'title' => 'Marcas | Latin Terra',
                    'description' => 'Catalogo de marcas trabajadas por Latin Terra en sus categorias de productos.',
                    'image' => 'encabezado/marca.jpg',
                ],
                'Public/Trabajosenaltura' => [
                    'title' => 'Acceso por Cuerdas | Latin Terra',
                    'description' => 'Catalogo de marcas para trabajos en altura, rescate y sistemas de seguridad especializada.',
                    'image' => 'encabezado/acceso-por-cuerdas.jpg',
                ],
                'Public/TrabajosAlturaCatalogo' => [
                    'title' => 'Trabajos en Altura | Latin Terra',
                    'description' => 'Catalogo de marcas para trabajos en altura, rescate y sistemas de seguridad especializada.',
                    'image' => 'encabezado/acceso-por-cuerdas.jpg',
                ],
                'Public/EppSeguridad' => [
                    'title' => 'EPP y Seguridad | Latin Terra',
                    'description' => 'Marcas de EPP y seguridad industrial: proteccion personal, visual, respiratoria y vestimenta de trabajo.',
                    'image' => 'encabezado/epp-y-seguridad.jpg',
                ],
                'Public/EquipoElectrico' => [
                    'title' => 'Equipo Electrico | Latin Terra',
                    'description' => 'Catalogo de marcas de equipo electrico, medicion, energia y herramientas tecnicas.',
                    'image' => 'encabezado/equipo-electrico.jpg',
                ],
                'Public/Herramientas' => [
                    'title' => 'Herramientas | Latin Terra',
                    'description' => 'Catalogo de marcas de herramientas para mantenimiento, taller e industria.',
                    'image' => 'categorias/Herramientas.jpg',
                ],
                'Public/ReparacionPalas' => [
                    'title' => 'Reparacion de Palas | Latin Terra',
                    'description' => 'Catalogo de marcas para reparacion de palas, mantenimiento y consumibles especializados.',
                    'image' => 'encabezado/reparacion-de-palas.jpg',
                ],
                'Public/ParquesEolicos' => [
                    'title' => 'Parques Eolicos | Latin Terra',
                    'description' => 'Marcas y soluciones para parques eolicos, mantenimiento tecnico, limpieza industrial y equipos de medicion.',
                    'image' => 'encabezado/reparacion-de-palas.jpg',
                ],
                'Public/Beal' => [
                    'title' => 'Catalogo BEAL | Latin Terra',
                    'description' => 'Catalogo Beal Profesional y Sport: cuerdas, arneses, cascos, mosquetones y accesorios para trabajo en altura y escalada.',
                    'image' => 'encabezado/acceso-por-cuerdas.jpg',
                ],
            ];

            $ogDefault = $ogCatalog['Public/Home'];
            $og = $ogCatalog[$page['component'] ?? null] ?? $ogDefault;
        @endphp

        <title inertia>{{ config('app.name', 'Latin Terra') }}</title>

        {{-- Open Graph / vista previa al compartir el enlace (WhatsApp, Facebook, etc).
             Se calcula aqui (servidor) porque esos bots no ejecutan JavaScript, asi
             que las etiquetas del <Head> de React no les sirven de nada. --}}
        <meta property="og:site_name" content="Latin Terra" inertia>
        <meta property="og:type" content="website" inertia>
        <meta property="og:title" content="{{ $og['title'] }}" inertia>
        <meta property="og:description" content="{{ $og['description'] }}" inertia>
        <meta property="og:image" content="https://latin-terra.com/assets/img/{{ $og['image'] }}" inertia>
        <meta property="og:image:width" content="1400" inertia>
        <meta property="og:image:height" content="934" inertia>
        <meta property="og:url" content="https://latin-terra.com{{ request()->getRequestUri() }}" inertia>
        <meta name="twitter:card" content="summary_large_image" inertia>
        <meta name="twitter:title" content="{{ $og['title'] }}" inertia>
        <meta name="twitter:description" content="{{ $og['description'] }}" inertia>
        <meta name="twitter:image" content="https://latin-terra.com/assets/img/{{ $og['image'] }}" inertia>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />

        {{-- Cargadas aqui (bloqueante) en vez de inyectadas por React, para evitar el
             flash sin estilos (logo/menu sin tamano) al entrar a cada pagina --}}
        <link rel="stylesheet" href="/assets/css/home.css" />
        <link rel="stylesheet" href="/assets/css/nosotros.css" />
        <link rel="stylesheet" href="/assets/css/Productos.css" />
        @if (($page['component'] ?? null) === 'Public/Contacto')
            <script src="https://www.google.com/recaptcha/enterprise.js?render=6LfZDHosAAAAAPEGIEgAcW-DwG-HB5eIv0AJ7A_q"></script>
            <style>
                .grecaptcha-badge {
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
            </style>
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
