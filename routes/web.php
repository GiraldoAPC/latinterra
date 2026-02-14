<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
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
    sleep(1);
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/', function () {
    return Inertia::render('Public/Home');
    sleep(1);
})->name('home');

Route::get('/nosotros', function () {
    sleep(1);
        return Inertia::render('Public/About');
})->name('about');

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
