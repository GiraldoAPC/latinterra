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

Route::redirect('/trabajos-en-altura', '/acceso-por-cuerdas', 301);

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

Route::get('/articulos-de-ferreteria', function () {
    return Inertia::render('Public/ArticulosFerreteria');
})->name('ferreteria.catalogo');

Route::get('/reparacion-de-palas', function () {
    return Inertia::render('Public/ReparacionPalas');
})->name('reparacionpalas.catalogo');


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
