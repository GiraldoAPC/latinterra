<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicContactController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Public/Home');
})->name('home');

Route::get('/sitemap.xml', function () {
    $baseUrl = 'https://latin-terra.com';

    $pages = [
        ['url' => '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
        ['url' => '/nosotros', 'priority' => '0.6', 'changefreq' => 'monthly'],
        ['url' => '/contacto', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ['url' => '/acceso-por-cuerdas', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/trabajos-en-altura', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/epp-y-seguridad', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/equipo-electrico', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/herramientas', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/reparacion-de-palas', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/parques-eolicos', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/beal', 'priority' => '0.9', 'changefreq' => 'weekly'],
        ['url' => '/beal/sport', 'priority' => '0.9', 'changefreq' => 'weekly'],
        ['url' => '/kuhlmann', 'priority' => '0.9', 'changefreq' => 'weekly'],
    ];

    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

    foreach ($pages as $page) {
        $xml .= "  <url>\n";
        $xml .= '    <loc>' . $baseUrl . $page['url'] . "</loc>\n";
        $xml .= '    <changefreq>' . $page['changefreq'] . "</changefreq>\n";
        $xml .= '    <priority>' . $page['priority'] . "</priority>\n";
        $xml .= "  </url>\n";
    }

    $xml .= '</urlset>';

    return response($xml, 200)->header('Content-Type', 'application/xml');
})->name('sitemap');


Route::get('/nosotros', function () {
    /*sleep(1);*/
        return Inertia::render('Public/About');
})->name('about');

Route::get('/contacto', function () {
    return Inertia::render('Public/Contacto');
})->name('contacto');
Route::post('/contacto/enviar', [PublicContactController::class, 'send'])->name('contacto.send');

Route::redirect('/marcas', '/', 301)->name('marcas');

Route::get('/acceso-por-cuerdas', function () {
    return Inertia::render('Public/Trabajosenaltura');
})->name('accesoporcuerdas');

Route::get('/beal', function () {
    return Inertia::render('Public/Beal', ['initialLine' => 'pro']);
})->name('beal');

Route::get('/beal/sport', function () {
    return Inertia::render('Public/Beal', ['initialLine' => 'sport']);
})->name('beal.sport');

Route::get('/kuhlmann', function () {
    return Inertia::render('Public/Kuhlmann');
})->name('kuhlmann');

Route::get('/trabajos-en-altura', function () {
    return Inertia::render('Public/TrabajosAlturaCatalogo');
})->name('trabajosenaltura');

Route::redirect('/trabajosenaltura', '/acceso-por-cuerdas', 301);

Route::get('/epp-y-seguridad', function () {
    return Inertia::render('Public/EppSeguridad');
})->name('eppseguridad');

Route::redirect('/eppyseguridad', '/epp-y-seguridad', 301);

Route::get('/equipo-electrico', function () {
    return Inertia::render('Public/EquipoElectrico');
})->name('equipoelectrico');

Route::redirect('/equipos-electricos', '/equipo-electrico', 301);

Route::get('/herramientas', function () {
    return Inertia::render('Public/Herramientas');
})->name('herramientas.catalogo');

Route::redirect('/articulos-de-ferreteria', '/herramientas', 301)->name('ferreteria.catalogo');

Route::get('/reparacion-de-palas', function () {
    return Inertia::render('Public/ReparacionPalas');
})->name('reparacionpalas.catalogo');

Route::get('/parques-eolicos', function () {
    return Inertia::render('Public/ParquesEolicos');
})->name('parqueseolicos.catalogo');


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/', fn() => Inertia::render('Admin/Dashboard'))->name('admin');

    Route::get('/products', fn() => Inertia::render('Admin/Products/Index'))->name('admin.products');
    Route::get('/categories', fn() => Inertia::render('Admin/Categories/Index'))->name('admin.categories');
    Route::get('/brands', fn() => Inertia::render('Admin/Brands/Index'))->name('admin.brands');
    Route::get('/quotes', fn() => Inertia::render('Admin/Quotes/Index'))->name('admin.quotes');
    Route::get('/users', fn() => Inertia::render('Admin/Users/Index'))->name('admin.users');
    Route::get('/settings', fn() => Inertia::render('Admin/Settings/Index'))->name('admin.settings');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
