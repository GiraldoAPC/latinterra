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
    $user = \Illuminate\Support\Facades\Auth::user();

    return $user->isAdmin()
        ? redirect('/admin')
        : redirect('/aula-virtual/mis-cursos');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', fn() => Inertia::render('Admin/Dashboard'))->name('admin');

    Route::get('/products', [\App\Http\Controllers\Admin\ProductController::class, 'index'])->name('admin.products');
    Route::post('/products', [\App\Http\Controllers\Admin\ProductController::class, 'store'])->name('admin.products.store');
    Route::put('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'update'])->name('admin.products.update');
    Route::delete('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy'])->name('admin.products.destroy');
    Route::get('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('admin.categories');
    Route::post('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('admin.categories.store');
    Route::put('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('admin.categories.destroy');
    Route::get('/brands', [\App\Http\Controllers\Admin\BrandController::class, 'index'])->name('admin.brands');
    Route::post('/brands', [\App\Http\Controllers\Admin\BrandController::class, 'store'])->name('admin.brands.store');
    Route::put('/brands/{brand}', [\App\Http\Controllers\Admin\BrandController::class, 'update'])->name('admin.brands.update');
    Route::delete('/brands/{brand}', [\App\Http\Controllers\Admin\BrandController::class, 'destroy'])->name('admin.brands.destroy');
    Route::get('/quotes', fn() => Inertia::render('Admin/Quotes/Index'))->name('admin.quotes');
    Route::get('/users', fn() => Inertia::render('Admin/Users/Index'))->name('admin.users');
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('admin.settings');
    Route::put('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('admin.settings.update');

    Route::get('/buscar', [\App\Http\Controllers\Admin\StudentController::class, 'search'])->name('admin.search');

    // ===== Catalogos de selects (tipo de documento, genero, SCTR...) =====
    Route::get('/catalogos', [\App\Http\Controllers\Admin\CatalogController::class, 'index'])->name('admin.catalogs');
    Route::post('/catalogos', [\App\Http\Controllers\Admin\CatalogController::class, 'store'])->name('admin.catalogs.store');
    Route::put('/catalogos/{option}', [\App\Http\Controllers\Admin\CatalogController::class, 'update'])->name('admin.catalogs.update');
    Route::delete('/catalogos/{option}', [\App\Http\Controllers\Admin\CatalogController::class, 'destroy'])->name('admin.catalogs.destroy');

    // ===== Aula virtual: estudiantes y certificados (pendiente de implementar) =====
    Route::get('/cursos/estudiantes', [\App\Http\Controllers\Admin\StudentController::class, 'index'])->name('admin.cursos.estudiantes');
    Route::get('/estudiantes/exportar', [\App\Http\Controllers\Admin\StudentController::class, 'export'])->name('admin.students.export');
    Route::get('/estudiantes/nuevo', [\App\Http\Controllers\Admin\StudentController::class, 'create'])->name('admin.students.create');
    Route::post('/estudiantes', [\App\Http\Controllers\Admin\StudentController::class, 'store'])->name('admin.students.store');
    Route::get('/estudiantes/{student}/perfil', [\App\Http\Controllers\Admin\StudentController::class, 'show'])->name('admin.students.show');
    Route::get('/estudiantes/{student}', [\App\Http\Controllers\Admin\StudentController::class, 'edit'])->name('admin.students.edit');
    Route::put('/estudiantes/{student}', [\App\Http\Controllers\Admin\StudentController::class, 'update'])->name('admin.students.update');
    Route::delete('/estudiantes/{student}', [\App\Http\Controllers\Admin\StudentController::class, 'destroy'])->name('admin.students.destroy');
    Route::post('/estudiantes/{student}/foto', [\App\Http\Controllers\Admin\StudentController::class, 'updateAvatar'])->name('admin.students.avatar');
    Route::post('/estudiantes/{student}/cuotas/{installment}/pagar', [\App\Http\Controllers\Admin\StudentController::class, 'payInstallment'])->name('admin.students.installments.pay');
    Route::post('/estudiantes/{student}/ventas', [\App\Http\Controllers\Admin\OtherPaymentController::class, 'sellToStudent'])->name('admin.students.sell');
    Route::get('/productos/buscar', [\App\Http\Controllers\Admin\ProductController::class, 'search'])->name('admin.products.search');
    Route::get('/estudiantes/{student}/matricula/{enrollment}', [\App\Http\Controllers\Admin\StudentReportController::class, 'matricula'])->name('admin.students.matricula');
    Route::get('/estudiantes/{student}/notas/{enrollment}', [\App\Http\Controllers\Admin\StudentReportController::class, 'notas'])->name('admin.students.notas');
    Route::get('/estudiantes/{student}/cuotas/{installment}/recibo', [\App\Http\Controllers\Admin\StudentReportController::class, 'reciboPago'])->name('admin.students.installments.receipt');
    Route::get('/estudiantes/{student}/cuotas/{installment}/recibo-datos', [\App\Http\Controllers\Admin\StudentReportController::class, 'reciboPagoDatos'])->name('admin.students.installments.receipt-data');
    Route::post('/estudiantes/{student}/toggle-active', [\App\Http\Controllers\Admin\StudentController::class, 'toggleActive'])->name('admin.students.toggle-active');
    Route::post('/estudiantes/{student}/reset-password', [\App\Http\Controllers\Admin\StudentController::class, 'resetPassword'])->name('admin.students.reset-password');
    Route::get('/cursos/certificados', fn() => Inertia::render('Admin/Cursos/Certificados'))->name('admin.cursos.certificados');

    // ===== Inventario: compras (movimientos) y proveedores =====
    Route::get('/inventario/movimientos', [\App\Http\Controllers\Admin\StockPurchaseController::class, 'index'])->name('admin.inventario.movimientos');
    Route::post('/inventario/movimientos', [\App\Http\Controllers\Admin\StockPurchaseController::class, 'store'])->name('admin.inventario.movimientos.store');
    Route::post('/inventario/transferencias', [\App\Http\Controllers\Admin\StockTransferController::class, 'store'])->name('admin.inventario.transferencias.store');
    Route::get('/inventario/proveedores', [\App\Http\Controllers\Admin\SupplierController::class, 'index'])->name('admin.inventario.proveedores');
    Route::post('/inventario/proveedores', [\App\Http\Controllers\Admin\SupplierController::class, 'store'])->name('admin.inventario.proveedores.store');
    Route::put('/inventario/proveedores/{supplier}', [\App\Http\Controllers\Admin\SupplierController::class, 'update'])->name('admin.inventario.proveedores.update');
    Route::delete('/inventario/proveedores/{supplier}', [\App\Http\Controllers\Admin\SupplierController::class, 'destroy'])->name('admin.inventario.proveedores.destroy');
    Route::get('/inventario/proveedores/buscar', [\App\Http\Controllers\Admin\SupplierController::class, 'search'])->name('admin.inventario.proveedores.search');

    // ===== Ventas: pedidos de cursos (pendiente de implementar) =====
    Route::get('/ventas/pedidos', [\App\Http\Controllers\Admin\CourseOrderController::class, 'index'])->name('admin.ventas.pedidos');
    Route::post('/ventas/pedidos/{order}/confirmar', [\App\Http\Controllers\Admin\CourseOrderController::class, 'confirm'])->name('admin.ventas.pedidos.confirm');
    Route::post('/ventas/pedidos/{order}/rechazar', [\App\Http\Controllers\Admin\CourseOrderController::class, 'reject'])->name('admin.ventas.pedidos.reject');

    // ===== Ventas: otros pagos (producto u otro concepto ajeno al curso) =====
    Route::get('/ventas/otros-pagos', [\App\Http\Controllers\Admin\OtherPaymentController::class, 'index'])->name('admin.ventas.otros-pagos');
    Route::post('/ventas/otros-pagos', [\App\Http\Controllers\Admin\OtherPaymentController::class, 'store'])->name('admin.ventas.otros-pagos.store');
    Route::get('/ventas/otros-pagos/buscar-cliente', [\App\Http\Controllers\Admin\OtherPaymentController::class, 'searchBuyers'])->name('admin.ventas.otros-pagos.search-buyers');
    Route::post('/ventas/vender', [\App\Http\Controllers\Admin\OtherPaymentController::class, 'sell'])->name('admin.ventas.vender');
    Route::get('/ventas/otros-pagos/{payment}/recibo', [\App\Http\Controllers\Admin\OtherPaymentController::class, 'reciboPago'])->name('admin.ventas.otros-pagos.receipt');
    Route::get('/ventas/otros-pagos/{payment}/recibo-datos', [\App\Http\Controllers\Admin\OtherPaymentController::class, 'reciboPagoDatos'])->name('admin.ventas.otros-pagos.receipt-data');
    Route::post('/ventas/otros-pagos/{payment}/anular', [\App\Http\Controllers\Admin\OtherPaymentController::class, 'void'])->name('admin.ventas.otros-pagos.void');

    // ===== Ventas: clientes con RUC (para facturar, simulado) =====
    Route::get('/clientes', [\App\Http\Controllers\Admin\ClientController::class, 'index'])->name('admin.clientes');
    Route::post('/clientes', [\App\Http\Controllers\Admin\ClientController::class, 'store'])->name('admin.clientes.store');
    Route::put('/clientes/{client}', [\App\Http\Controllers\Admin\ClientController::class, 'update'])->name('admin.clientes.update');
    Route::delete('/clientes/{client}', [\App\Http\Controllers\Admin\ClientController::class, 'destroy'])->name('admin.clientes.destroy');
    Route::get('/clientes/buscar', [\App\Http\Controllers\Admin\ClientController::class, 'search'])->name('admin.clientes.search');

    // ===== Usuarios: roles y permisos (pendiente de implementar) =====
    Route::get('/usuarios/roles', fn() => Inertia::render('Admin/Usuarios/Roles'))->name('admin.usuarios.roles');

    // ===== Aula virtual: gestion de cursos =====
    Route::get('/cursos', [\App\Http\Controllers\Admin\CourseController::class, 'index'])->name('admin.courses.index');
    Route::get('/cursos/nuevo', [\App\Http\Controllers\Admin\CourseController::class, 'create'])->name('admin.courses.create');
    Route::post('/cursos', [\App\Http\Controllers\Admin\CourseController::class, 'store'])->name('admin.courses.store');
    Route::get('/cursos/{course}', [\App\Http\Controllers\Admin\CourseController::class, 'edit'])->name('admin.courses.edit');
    Route::put('/cursos/{course}', [\App\Http\Controllers\Admin\CourseController::class, 'update'])->name('admin.courses.update');
    Route::delete('/cursos/{course}', [\App\Http\Controllers\Admin\CourseController::class, 'destroy'])->name('admin.courses.destroy');

    Route::post('/cursos/{course}/modulos', [\App\Http\Controllers\Admin\CourseModuleController::class, 'store'])->name('admin.modules.store');
    Route::put('/modulos/{module}', [\App\Http\Controllers\Admin\CourseModuleController::class, 'update'])->name('admin.modules.update');
    Route::delete('/modulos/{module}', [\App\Http\Controllers\Admin\CourseModuleController::class, 'destroy'])->name('admin.modules.destroy');

    Route::post('/modulos/{module}/clases', [\App\Http\Controllers\Admin\CourseLessonController::class, 'store'])->name('admin.lessons.store');
    Route::put('/clases/{lesson}', [\App\Http\Controllers\Admin\CourseLessonController::class, 'update'])->name('admin.lessons.update');
    Route::delete('/clases/{lesson}', [\App\Http\Controllers\Admin\CourseLessonController::class, 'destroy'])->name('admin.lessons.destroy');

    Route::post('/clases/{lesson}/materiales', [\App\Http\Controllers\Admin\CourseLessonMaterialController::class, 'store'])->name('admin.lessons.materials.store');
    Route::delete('/materiales/{material}', [\App\Http\Controllers\Admin\CourseLessonMaterialController::class, 'destroy'])->name('admin.lessons.materials.destroy');

    Route::post('/cursos/{course}/examen/preguntas', [\App\Http\Controllers\Admin\ExamController::class, 'storeQuestion'])->name('admin.exam.questions.store');
    Route::put('/examen/preguntas/{question}', [\App\Http\Controllers\Admin\ExamController::class, 'updateQuestion'])->name('admin.exam.questions.update');
    Route::delete('/examen/preguntas/{question}', [\App\Http\Controllers\Admin\ExamController::class, 'destroyQuestion'])->name('admin.exam.questions.destroy');

    // ===== Aula virtual: quiz por modulo (reusa update/destroy de arriba, las preguntas son el mismo modelo) =====
    Route::post('/modulos/{module}/examen/preguntas', [\App\Http\Controllers\Admin\ModuleExamController::class, 'storeQuestion'])->name('admin.module-exam.questions.store');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Ubigeo para selects en cascada fuera del panel admin (ej. perfil del
    // estudiante en el aula virtual) - mismo controller que usa /admin/ubigeo/*.
    Route::get('/ubigeo/paises', [\App\Http\Controllers\Admin\UbigeoController::class, 'paises'])->name('ubigeo.paises');
    Route::get('/ubigeo/departamentos', [\App\Http\Controllers\Admin\UbigeoController::class, 'departamentos'])->name('ubigeo.departamentos');
    Route::get('/ubigeo/provincias', [\App\Http\Controllers\Admin\UbigeoController::class, 'provincias'])->name('ubigeo.provincias');
    Route::get('/ubigeo/distritos', [\App\Http\Controllers\Admin\UbigeoController::class, 'distritos'])->name('ubigeo.distritos');
});

// ===== Aula virtual (LMS) =====
use App\Http\Controllers\Aula\StudentCourseController;
use App\Http\Controllers\Aula\CertificateController;

Route::get('/aula', [StudentCourseController::class, 'catalog'])->name('aula.catalogo');
Route::get('/aula/{course:slug}', [StudentCourseController::class, 'show'])->name('aula.curso');
Route::get('/certificado/verificar/{code}', [CertificateController::class, 'verify'])->name('certificado.verificar');

Route::middleware('auth')->group(function () {
    Route::post('/aula/{course:slug}/inscribirme', [StudentCourseController::class, 'enroll'])->name('aula.inscribirme');
    Route::get('/aula-virtual/mis-cursos', [StudentCourseController::class, 'myCourses'])->name('aula.mis-cursos');
    Route::get('/aula-virtual/perfil', [\App\Http\Controllers\Aula\StudentProfileController::class, 'show'])->name('aula.perfil');
    Route::put('/aula-virtual/perfil', [\App\Http\Controllers\Aula\StudentProfileController::class, 'update'])->name('aula.perfil.update');
    Route::post('/aula-virtual/perfil/foto', [\App\Http\Controllers\Aula\StudentProfileController::class, 'updateAvatar'])->name('aula.perfil.avatar');
    Route::get('/aula-virtual/perfil/cuotas/{installment}/recibo', [\App\Http\Controllers\Aula\StudentProfileController::class, 'reciboPago'])->name('aula.perfil.installments.receipt');
    Route::get('/aula-virtual/perfil/cuotas/{installment}/recibo-datos', [\App\Http\Controllers\Aula\StudentProfileController::class, 'reciboPagoDatos'])->name('aula.perfil.installments.receipt-data');
    Route::get('/aula-virtual/catalogo', [StudentCourseController::class, 'catalogSystem'])->name('aula.catalogo-sistema');
    Route::get('/aula/{course:slug}/continuar', [StudentCourseController::class, 'continueCourse'])->name('aula.continuar');
    Route::get('/aula/{course:slug}/clase/{lesson}', [StudentCourseController::class, 'lesson'])->name('aula.leccion');
    Route::post('/aula/{course:slug}/clase/{lesson}/completar', [StudentCourseController::class, 'completeLesson'])->name('aula.leccion.completar');
    Route::get('/aula/{course:slug}/examen', [StudentCourseController::class, 'examShow'])->name('aula.examen');
    Route::post('/aula/{course:slug}/examen', [StudentCourseController::class, 'examSubmit'])->name('aula.examen.enviar');
    Route::get('/aula/{course:slug}/modulo/{module}/quiz', [StudentCourseController::class, 'moduleQuizShow'])->name('aula.modulo.quiz');
    Route::post('/aula/{course:slug}/modulo/{module}/quiz', [StudentCourseController::class, 'moduleQuizSubmit'])->name('aula.modulo.quiz.enviar');
    Route::get('/aula/certificado/{enrollment}', [CertificateController::class, 'show'])->name('certificado.ver');
});

require __DIR__ . '/auth.php';
