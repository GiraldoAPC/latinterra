<?php

namespace App\Services;

use App\Models\Aula\{Certificate, Course, CourseEquivalency, CourseInstallment, CourseLessonMaterial, CourseOrder, Enrollment, Exam, ExamAttempt, InPersonSession, LessonMaterialView, LessonProgress};
use App\Models\Inventario\{Brand, Category, StockPurchase, StockSponsorship, StockTransfer, Supplier};
use App\Models\Ventas\{Client, OtherPayment, Product, Quote};
use App\Models\{Persona, Setting, User};
use Illuminate\Support\Facades\{DB, Storage};
use Illuminate\Support\Str;

class MeetingDemo
{
    public const KEY = 'meeting_demo_v1';
    private array $ids = [];
    private string $password;
    private User $actor;

    public function prepare(User $actor, bool $enableWarehouse = false): array
    {
        abort_unless($actor->role === 'admin' && $actor->is_active, 403);
        $this->actor = $actor;
        return DB::transaction(function () use ($enableWarehouse) {
            Setting::firstOrCreate(['key' => self::KEY], ['value' => '']);
            $marker = Setting::where('key', self::KEY)->lockForUpdate()->firstOrFail();
            if ($marker->value) {
                if ($enableWarehouse) Setting::set('warehouse_mode', '1');
                return ['created' => false, 'counts' => json_decode($marker->value, true)['counts'], 'password' => null];
            }
            $this->assertNamespaceAvailable();
            $this->ids = [];
            $this->password = Str::random(20).'!9a';
            $previousWarehouse = Setting::get('warehouse_mode');
            Setting::set('warehouse_mode', '1');
            $students = $this->people();
            $products = $this->inventory();
            $this->commerce($products);
            $courses = $this->courses();
            $this->learning($courses, $students);
            $this->inPerson($courses, $students);
            if (!$enableWarehouse) {
                if ($previousWarehouse === null) Setting::where('key', 'warehouse_mode')->delete();
                else Setting::set('warehouse_mode', $previousWarehouse);
            }
            $counts = collect($this->ids)->map(fn ($ids) => count($ids))->all();
            $marker->update(['value' => json_encode(['created_at' => now()->toIso8601String(), 'ids' => $this->ids, 'counts' => $counts], JSON_UNESCAPED_UNICODE)]);
            return ['created' => true, 'counts' => $counts, 'password' => $this->password];
        });
    }

    private function remember(string $module, $model)
    {
        $this->ids[$module][] = $model->id;
        return $model;
    }

    private function assertNamespaceAvailable(): void
    {
        // Refuse a partial/manual collision rather than overwrite an existing person's account or inventory.
        if (User::where('email', 'like', '%@demo.latinterra.test')->exists()
            || User::whereBetween('dni', ['99000001', '99000018'])->exists()
            || Persona::whereBetween('dni', ['99000001', '99000018'])->exists()
            || Product::where('sku', 'like', 'DEMO-%')->exists()
            || Course::where('slug', 'like', 'demo-reunion-%')->exists()
            || Client::where('business_name', 'like', 'DEMO %')->exists()
            || Brand::where('name', 'like', 'DEMO %')->exists()
            || Category::where('name', 'like', 'DEMO %')->exists()
            || Supplier::where('name', 'like', 'DEMO %')->exists()) {
            throw new \RuntimeException('Hay registros con el espacio DEMO reservado pero falta su marcador. Revisa la carga anterior antes de continuar; no se sobrescribió nada.');
        }
    }

    private function people(): array
    {
        $names = ['Ana Torres', 'Luis Mendoza', 'María Rojas', 'Carlos Vega', 'Sofía Paredes', 'Diego Salazar', 'Valeria Cruz', 'José Ramos', 'Camila Flores', 'Miguel Castro', 'Lucía Medina', 'Pedro Silva', 'Daniela León', 'Andrés Navarro', 'Elena Vargas', 'Jorge Campos'];
        $students = [];
        foreach ($names as $i => $name) {
            $n = $i + 1; [$first, $last] = explode(' ', $name, 2);
            $persona = $this->remember('Personas', Persona::create(['document_type' => 'dni', 'dni' => (string) (99000000 + $n),
                'name' => 'DEMO '.$first, 'last_name' => $last, 'birth_date' => now()->subYears(25 + $i)->toDateString(),
                'address' => 'Dirección ficticia para demostración, Lima', 'gender' => $i % 2 ? 'm' : 'f']));
            $student = User::create(['persona_id' => $persona->id, 'name' => $persona->name, 'dni' => $persona->dni,
                'email' => sprintf('alumno%02d@demo.latinterra.test', $n), 'password' => $this->password,
                'role' => 'student', 'is_active' => true, 'company' => 'DEMO Servicios Verticales', 'position' => 'Técnico de campo',
                'district' => 'Lima', 'sctr_status' => 'vigente', 'sctr_expires_at' => now()->addMonths(6)->toDateString(), 'previous_experience' => 'Ficha ficticia para la presentación.']);
            $this->remember('Estudiantes', $student);
            $students[] = $student;
        }
        foreach (['instructor' => 'DEMO Instructor de capacitación', 'coordinacion' => 'DEMO Coordinadora académica'] as $key => $name) {
            $this->remember('Personal', app(RoleManagement::class)->createStaff($this->actor, ['name' => $name,
                'email' => $key.'@demo.latinterra.test', 'password' => $this->password, 'role' => $key === 'instructor' ? 'instructor' : 'coordinator']));
        }
        return $students;
    }

    private function inventory(): array
    {
        $rows = json_decode(file_get_contents(resource_path('data/demo-inventory.json')), true, 512, JSON_THROW_ON_ERROR);
        $catalog = json_decode(file_get_contents(resource_path('data/beal-products.json')), true, 512, JSON_THROW_ON_ERROR);
        $seen = []; $added = 0;
        foreach ($catalog as $group) foreach ($group as $row) {
            $category = $row['subcategory'] ?? 'Equipos';
            if (($seen[$category] ?? 0) >= 3 || !is_numeric($row['price'] ?? null) || (float) $row['price'] <= 0 || $added >= 17) continue;
            $seen[$category] = ($seen[$category] ?? 0) + 1; $added++;
            $rows[] = ['sku' => 'BEAL-'.$added, 'name' => $row['name'], 'category' => $category, 'brand' => 'BEAL',
                'color' => $row['color'] ?? null, 'size' => $row['size'] ?? null, 'price' => (float) $row['price'], 'cost' => round((float) $row['price'] * .6, 2)];
        }
        $suppliers = [];
        foreach (['Equipos de Altura', 'Distribuidora Andina', 'Suministros Industriales'] as $i => $name) {
            $suppliers[] = $this->remember('Proveedores', Supplier::create(['name' => 'DEMO '.$name, 'ruc' => '2099000000'.($i + 1),
                'email' => 'proveedor'.($i + 1).'@demo.latinterra.test', 'address' => 'Dirección de muestra - Lima', 'is_active' => true]));
        }
        $products = [];
        foreach ($rows as $i => $row) {
            $brand = Brand::firstOrCreate(['name' => 'DEMO '.$row['brand']], ['is_active' => true]);
            $category = Category::firstOrCreate(['name' => 'DEMO '.$row['category']], ['is_active' => true]);
            if ($brand->wasRecentlyCreated) $this->remember('Marcas', $brand);
            if ($category->wasRecentlyCreated) $this->remember('Categorías', $category);
            $product = $this->remember('Productos', Product::create(['sku' => 'DEMO-'.$row['sku'], 'name' => 'DEMO '.$row['name'],
                'brand_id' => $brand->id, 'category_id' => $category->id, 'price' => $row['price'], 'color' => $row['color'], 'size' => $row['size'],
                'min_stock' => 5, 'is_active' => true]));
            $purchase = StockPurchase::register(['product_id' => $product->id, 'supplier_id' => $suppliers[$i % 3]->id,
                'document_type' => 'factura', 'document_number' => sprintf('DEMO-C%03d', $i + 1), 'payment_method' => 'transferencia',
                'quantity' => 30 + $i, 'unit_cost' => $row['cost'], 'purchased_at' => now()->subDays($i === 0 ? 60 : 40 - $i)->toDateString(),
                'notes' => 'DEMO: compra simulada; costo referencial, sin comprobante externo.', 'registered_by' => $this->actor->id]);
            $this->remember('Compras', $purchase);
            $this->remember('Transferencias', StockTransfer::register(['product_id' => $product->id, 'quantity' => $i < 3 ? 10 : ($i % 4 === 0 ? 3 : 18),
                'notes' => 'DEMO: reposición de almacén a ventas.', 'registered_by' => $this->actor->id]));
            if ($i === 2) {
                $this->remember('Compras', StockPurchase::register(['product_id' => $product->id, 'supplier_id' => $suppliers[0]->id,
                    'document_type' => 'factura', 'document_number' => 'DEMO-COSTO-02', 'payment_method' => 'efectivo',
                    'quantity' => 10, 'unit_cost' => $row['cost'] + 20, 'purchased_at' => now()->subDays(5)->toDateString(),
                    'notes' => 'DEMO: segunda compra para mostrar costo promedio ponderado.', 'registered_by' => $this->actor->id]));
            }
            $products[] = $product->fresh();
        }
        return $products;
    }

    private function commerce(array $products): void
    {
        $clients = [];
        foreach (['Servicios Verticales SAC', 'Constructora Horizonte SAC', 'Minería del Sur SAC', 'Rescate Andino SAC', 'Montajes del Pacífico SAC', 'Operaciones Industriales SAC'] as $i => $name) {
            $clients[] = $this->remember('Clientes', Client::create(['type' => 'juridica', 'business_name' => 'DEMO '.$name,
                'ruc' => '2099100000'.($i + 1), 'address' => 'Dirección ficticia - Lima', 'email' => 'cliente'.($i + 1).'@demo.latinterra.test']));
        }
        $ops = app(QuoteOperations::class);
        // Completed sales across both periods make the dashboard chart and comparisons meaningful.
        foreach ([45, 36, 28, 25, 21, 18, 14, 11, 8, 5, 3, 1, 0] as $i => $days) {
            $product = $products[$i % count($products)]; $client = $clients[$i % count($clients)];
            $quote = $ops->create(['buyer_name' => $client->business_name, 'buyer_document' => $client->ruc, 'buyer_email' => $client->email,
                'valid_until' => now()->addDays(15)->toDateString(), 'notes' => 'DEMO: venta de muestra. No tiene validez tributaria.',
                'items' => [['product_id' => $product->id, 'qty' => $i < 2 ? 5 : 1, 'unit_price' => $product->price]]], $this->actor->id);
            $this->remember('Cotizaciones', $quote);
            $ops->approve($quote, $this->actor->id);
            $payment = $ops->sell($quote, ['payment_method' => ['efectivo', 'transferencia', 'yape', 'tarjeta'][$i % 4], 'payment_reference' => 'DEMO-VENTA-'.($i + 1)], $this->actor->id);
            $payment->update(['client_id' => $client->id, 'buyer_ruc' => $client->ruc, 'buyer_business_name' => $client->business_name,
                'receipt_code' => sprintf('DEMO-V%03d', $i + 1)]);
            $this->date($payment, $days, 'paid_at'); $this->date($quote, $days);
            $this->remember('Ventas', $payment);
        }
        foreach (['draft', 'draft', 'approved', 'approved', 'cancelled', 'expired'] as $i => $status) {
            $client = $clients[$i]; $p = $products[$i];
            $quote = $ops->create(['buyer_name' => $client->business_name, 'buyer_document' => $client->ruc, 'buyer_email' => $client->email,
                'valid_until' => now()->addDays(15)->toDateString(), 'notes' => 'DEMO: muestra de flujo comercial; ningún correo enviado.',
                'items' => [['product_id' => $p->id, 'qty' => 2, 'unit_price' => $p->price]]], $this->actor->id);
            if ($status === 'approved') $ops->approve($quote, $this->actor->id);
            if ($status === 'cancelled') $ops->cancel($quote);
            if ($status === 'expired') $quote->update(['valid_until' => now()->subDay()->toDateString()]);
            $this->remember('Cotizaciones', $quote);
        }
        foreach ([0, 1, 2] as $i) {
            $sponsor = app(InventoryOperations::class)->sponsor(['product_id' => $products[$i]->id, 'recipient' => 'DEMO Brigada de rescate '.($i + 1),
                'source' => $i === 2 ? 'warehouse' : 'sales', 'quantity' => 1, 'request_key' => (string) Str::uuid(), 'notes' => 'DEMO: entrega de equipo a costo.'], $this->actor->id);
            $this->date($sponsor, $i + 2); $this->remember('Auspicios', $sponsor);
        }
        $payment = OtherPayment::register(['type' => 'otro', 'document_type' => 'ticket', 'concept' => 'DEMO Servicio de inspección de EPP',
            'description' => 'Servicio ficticio para mostrar otros pagos.', 'amount' => 180, 'buyer_name' => $clients[0]->business_name,
            'payment_method' => 'transferencia', 'registered_by' => $this->actor->id, 'receipt_code' => 'DEMO-OTRO-001']);
        $this->date($payment, 2, 'paid_at'); $this->remember('Otros pagos', $payment);
        // Demonstrate a void without changing product balances: this was a service, never an inventory sale.
        $void = OtherPayment::register(['type' => 'otro', 'document_type' => 'ticket', 'concept' => 'DEMO Servicio anulado', 'amount' => 90,
            'buyer_name' => $clients[1]->business_name, 'payment_method' => 'efectivo', 'registered_by' => $this->actor->id,
            'receipt_code' => 'DEMO-ANULADO-001', 'voided_at' => now(), 'voided_by' => $this->actor->id, 'void_reason' => 'DEMO: ejemplo de anulación sin cobro real.']);
        $this->remember('Otros pagos', $void);
    }

    private function courses(): array
    {
        $titles = ['Trabajo seguro en altura', 'Acceso por cuerdas - nivel inicial', 'Rescate vertical y evacuación', 'Inspección de equipos de protección'];
        $topics = [['Fundamentos y prevención', 'Evaluación de riesgos', 'Uso e inspección del equipo'], ['Preparación del sistema', 'Progresión y maniobras', 'Respuesta ante emergencias']];
        $signers = $this->assets(); $courses = [];
        foreach ($titles as $i => $title) {
            $course = $this->remember('Cursos', Course::create(['slug' => 'demo-reunion-'.($i + 1), 'title' => 'DEMO '.$title,
                'summary' => 'Curso de muestra para presentar matrícula, aula, evaluaciones y certificación.',
                'description' => '<p>Contenido ficticio para demostración comercial. Este curso no acredita competencias profesionales.</p>',
                'thumbnail' => 'demo-reunion-v1/curso-'.($i + 1).'.png', 'price' => [450, 650, 800, 0][$i], 'passing_score' => 13,
                'is_free' => $i === 3, 'is_published' => true, 'min_age' => 18, 'payment_required' => $i !== 3,
                'billing_type' => 'unico', 'access_duration_days' => 90, 'certificate_signatories' => $signers]));
            if ($i === 2) $course->update(['prerequisite_course_id' => $courses[0]->id]);
            $course->instructors()->attach($this->ids['Personal'][0]);
            foreach ($topics as $moduleIndex => $lessons) {
                $module = $this->remember('Módulos de cursos', $course->modules()->create(['title' => ($moduleIndex ? 'Aplicación práctica' : 'Conceptos y seguridad'), 'description' => 'Módulo demostrativo.', 'position' => $moduleIndex + 1]));
                foreach ($lessons as $li => $topic) {
                    $lesson = $this->remember('Clases', $module->lessons()->create(['title' => $topic, 'position' => $li + 1,
                        'description' => '<p>Ejemplo del aula: revisa el PDF y responde el quiz. Material de prueba, sin validez formativa.</p>',
                        // Real playable public sample, explicitly unrelated to professional training.
                        'youtube_video_id' => 'aqz-KE-bpKQ', 'duration_seconds' => 635]));
                    $this->remember('Materiales PDF', $lesson->materials()->create(['title' => 'DEMO Guía de lectura: '.$topic,
                        'file_path' => 'demo-reunion-v1/manual.pdf', 'original_name' => 'manual-demo.pdf', 'mime_type' => 'application/pdf',
                        'size' => Storage::disk('public')->size('demo-reunion-v1/manual.pdf')] + app(MaterialPdfMetadata::class)->inspect(Storage::disk('public')->path('demo-reunion-v1/manual.pdf'))));
                    $this->exam($course, null, $lesson->id, 2);
                }
                $this->exam($course, $module->id, null, 20);
            }
            $courses[] = $course;
        }
        return $courses;
    }

    private function exam(Course $course, ?int $moduleId, ?int $lessonId, int $count): void
    {
        $exam = $this->remember('Evaluaciones', Exam::create(['course_id' => $course->id, 'course_module_id' => $moduleId, 'course_lesson_id' => $lessonId,
            'title' => $lessonId ? 'Comprobación del tema' : 'Evaluación del módulo', 'passing_score' => 13, 'max_attempts' => 6, 'duration_minutes' => 20, 'question_limit' => 10]));
        $questions = [
            ['¿Cuándo se revisa un equipo antes de utilizarlo?', 'Antes de cada uso', 'Solo al comprarlo', 'Solo cuando se rompe', 'Nunca'],
            ['¿Qué se debe hacer si un equipo presenta daños?', 'Retirarlo de servicio y reportarlo', 'Ocultar el daño', 'Seguir utilizándolo', 'Prestarlo a otra persona'],
            ['¿Qué información debe conocer el equipo de trabajo?', 'El procedimiento y el plan de emergencia', 'Solo la hora de salida', 'Únicamente el precio del equipo', 'Ninguna'],
            ['¿Qué corresponde antes de iniciar una tarea?', 'Evaluar los riesgos y aplicar los controles', 'Improvisar el procedimiento', 'Ignorar las condiciones del lugar', 'Trabajar sin coordinación'],
            ['¿Quién debe realizar una maniobra especializada?', 'Personal formado y autorizado', 'Cualquier visitante', 'Una persona sin equipo', 'Nadie necesita preparación'],
        ];
        for ($n = 0; $n < $count; $n++) {
            $row = $questions[$n % count($questions)];
            $q = $exam->questions()->create(['question' => ($n + 1).'. '.$row[0].($n >= 5 ? ' (Caso '.(intdiv($n, 5) + 1).')' : ''), 'position' => $n + 1, 'type' => 'multiple_choice']);
            foreach (array_slice($row, 1) as $position => $text) $q->options()->create(['option_text' => $text, 'position' => $position + 1, 'is_correct' => $position === 0]);
        }
    }

    private function learning(array $courses, array $students): void
    {
        foreach ($students as $i => $student) {
            $course = $courses[$i % 4]; $completed = in_array($i, [4, 5, 6, 7], true);
            $expiry = $completed ? ($i === 6 ? now()->subDays(5) : ($i === 7 ? now()->addDays(15) : now()->addYear()->subDays($i))) : null;
            $issuedAt = $expiry?->copy()->subYearNoOverflow();
            $days = $i === 15 ? 100 : 2 + $i * 2;
            $enrollment = $this->remember('Matrículas', Enrollment::create(['user_id' => $student->id, 'course_id' => $course->id,
                'status' => $completed ? 'completed' : 'active', 'completed_at' => $completed ? now()->subDays($i - 2) : null]));
            $this->date($enrollment, $days);
            if ($completed) $enrollment->forceFill(['created_at' => $issuedAt->copy()->subDays(25), 'completed_at' => $issuedAt])->save();
            if (!$course->is_free) {
                for ($n = 1; $n <= 3; $n++) {
                    $paid = $completed || $n === 1 || ($i % 3 === 0 && $n === 2);
                    $installment = CourseInstallment::create(['enrollment_id' => $enrollment->id, 'type' => 'mensualidad', 'installment_number' => $n,
                        'amount' => $n === 3 ? (float) $course->price - 2 * round((float) $course->price / 3, 2) : round((float) $course->price / 3, 2),
                        'due_date' => $completed ? $issuedAt->copy()->subDays(20 - $n * 5)->toDateString() : now()->addDays($n === 1 ? -20 : ($n === 2 ? -3 : 12))->toDateString(), 'status' => $paid ? 'paid' : 'pending',
                        'paid_at' => $paid ? ($completed ? $issuedAt->copy()->subDays(8 - $n) : now()->subDays(min($days - 1, $n * 2))->setTime(10, 0)) : null,
                        'payment_method' => $paid ? ['efectivo', 'transferencia', 'yape'][$i % 3] : null,
                        'payment_reference' => $paid ? 'DEMO-CUOTA-'.($i + 1).'-'.$n : null,
                        'receipt_code' => $paid ? sprintf('DEMO-C%02d-%d', $i + 1, $n) : null, 'document_type' => 'ticket']);
                    $this->remember('Cuotas', $installment);
                    if (!$paid && $n === 3 && $i === 2) $installment->extendDueDate(7);
                }
            }
            $lessons = $course->lessons()->orderBy('course_module_id')->orderBy('position')->get();
            $done = $completed ? $lessons->count() : ($i === 8 ? 0 : ($i === 0 ? 1 : $i % 5));
            foreach ($lessons->take($done) as $lesson) {
                $studiedAt = $completed ? $issuedAt->copy()->subDay() : now()->subDay();
                LessonProgress::create(['enrollment_id' => $enrollment->id, 'course_lesson_id' => $lesson->id, 'video_watched_at' => $studiedAt, 'completed_at' => $studiedAt]);
                foreach ($lesson->materials as $material) LessonMaterialView::create(['enrollment_id' => $enrollment->id, 'course_lesson_material_id' => $material->id, 'opened_at' => $studiedAt->copy()->subDay(), 'confirmed_at' => $studiedAt]);
                $this->attempt($enrollment, $lesson->exam, true, 20);
            }
            foreach ($course->modules as $mi => $module) {
                if ($completed || $done >= ($mi + 1) * 3) $this->attempt($enrollment, $module->exam, true, $completed ? 18 : 16);
            }
            if ($i === 8) $this->attempt($enrollment, $course->modules->first()->exam, false, 10);
            if ($completed) {
                $certificate = Certificate::create(['enrollment_id' => $enrollment->id, 'code' => 'LT-DEMO-'.sprintf('%04d', $i + 1),
                    'issued_at' => $expiry->copy()->subYearNoOverflow(), 'expires_at' => $expiry, 'final_score' => 18, 'signatories' => $course->certificate_signatories]);
                $enrollment->update(['completed_at' => $certificate->issued_at]);
                $this->remember('Certificados virtuales', $certificate);
            }
            if ($i % 4 === 2) $this->remember('Convalidaciones', CourseEquivalency::create(['user_id' => $student->id, 'course_id' => $courses[0]->id,
                'issuing_institution' => 'DEMO Centro externo de capacitación', 'note' => 'Registro ficticio de convalidación manual para presentar el requisito previo.',
                'score' => 17, 'file_path' => 'demo-reunion-v1/manual.pdf', 'granted_by' => $this->actor->id]));
        }
        // Split/manual orders do not duplicate installment income in dashboard totals.
        foreach (['pending', 'pending', 'paid', 'manual', 'split', 'rejected'] as $i => $status) {
            $order = CourseOrder::create(['user_id' => $students[($i + 9) % 16]->id, 'course_id' => $courses[0]->id,
                'amount' => $courses[0]->price, 'status' => $status, 'source' => $status === 'manual' ? 'admin' : 'online',
                'payment_method' => $status === 'paid' ? 'transferencia' : null, 'payment_reference' => 'DEMO-PEDIDO-'.($i + 1),
                'paid_at' => $status === 'paid' ? now()->subDays(3) : null]);
            $this->remember('Pedidos de cursos', $order);
            if (in_array($status, ['paid', 'split'], true)) {
                $entry = Enrollment::firstOrCreate(['user_id' => $order->user_id, 'course_id' => $order->course_id], ['status' => 'active']);
                if ($entry->wasRecentlyCreated) $this->remember('Matrículas', $entry);
                if ($status === 'split') for ($n = 1; $n <= 3; $n++) $this->remember('Cuotas', $entry->installments()->create([
                    'type' => 'mensualidad', 'installment_number' => $n, 'amount' => 150, 'status' => 'pending', 'due_date' => now()->addDays($n * 10)->toDateString()]));
            }
        }
    }

    private function attempt(Enrollment $enrollment, ?Exam $exam, bool $passed, int $score): void
    {
        if (!$exam) return;
        $at = $enrollment->completed_at ? $enrollment->completed_at->copy()->subDay() : now()->subDay();
        $attempt = $this->remember('Intentos evaluados', ExamAttempt::create(['enrollment_id' => $enrollment->id, 'exam_id' => $exam->id,
            'passed' => $passed, 'score' => $score, 'submitted_at' => $at]));
        $questions = $exam->questions->take($exam->isModuleQuiz() ? 10 : 2);
        $correctCount = (int) round($questions->count() * $score / 20);
        foreach ($questions->values() as $i => $question) {
            $correct = $i < $correctCount;
            $option = $question->options->firstWhere('is_correct', $correct);
            $attempt->answers()->create(['exam_question_id' => $question->id, 'exam_question_option_id' => $option->id, 'is_correct' => $correct]);
        }
    }

    private function inPerson(array $courses, array $students): void
    {
        foreach ([7, 12, -5] as $i => $days) {
            $session = $this->remember('Grupos presenciales', InPersonSession::create(['course_id' => $courses[$i]->id,
                'title' => ['DEMO Taller práctico - grupo abierto', 'DEMO Capacitación - cupo completo', 'DEMO Jornada finalizada'][$i],
                'location' => 'DEMO Centro de prácticas - Lima', 'starts_at' => now()->addDays($days)->setTime(9, 0), 'capacity' => $i === 1 ? 4 : 12,
                'registration_token' => Str::random(48), 'registration_open' => true, 'registration_closes_at' => now()->addDays(6)]));
            for ($n = 0; $n < ($i === 1 ? 4 : 6); $n++) {
                $student = $students[$n + $i];
                $participant = app(InPersonRegistration::class)->register($session, ['document_type' => 'dni', 'document_number' => $student->dni,
                    'name' => $student->persona->name, 'last_name' => $student->persona->last_name, 'email' => $student->email]);
                $this->remember('Participantes presenciales', $participant);
                if ($i === 2) {
                    app(InPersonCertification::class)->assess($session, $participant, $n === 5 ? 10 : 18, $n !== 4, $this->actor->id);
                    if ($n < 3) {
                        $certificate = app(InPersonCertification::class)->issue($session, $participant, $this->actor->id);
                        $certificate->update(['code' => 'LT-P-DEMO-'.sprintf('%04d', $n + 1)]);
                        $this->remember('Certificados presenciales', $certificate);
                    }
                }
            }
            if ($i === 2) $session->update(['registration_open' => false, 'registration_closes_at' => now()->subDays(6)]);
        }
    }

    private function date($model, int $days, ?string $column = null): void
    {
        $at = now()->subDays($days)->setTime($days === 0 ? 0 : 10, 0);
        $values = ['created_at' => $at];
        if ($column) $values[$column] = $at;
        $model->forceFill($values)->save();
    }

    private function assets(): array
    {
        $disk = Storage::disk('public');
        $pdf = new \Dompdf\Dompdf();
        $pdf->loadHtml('<html><head><meta charset="utf-8"></head><body style="font-family:DejaVu Sans;color:#024A7D"><h1>DEMO · Guía del aula</h1><p>Material ficticio para mostrar la lectura por página.</p><p>No utilizar como procedimiento técnico.</p><h1 style="page-break-before:always">Página 2 · Evaluación</h1><p>Al terminar la lectura podrás acceder al quiz del tema.</p><p>DOCUMENTO DE PRUEBA — SIN VALIDEZ FORMATIVA.</p></body></html>');
        $pdf->render(); $disk->put('demo-reunion-v1/manual.pdf', $pdf->output());
        foreach (['company', 'instructor'] as $role) {
            $im = imagecreatetruecolor(600, 120); $white = imagecolorallocate($im, 255, 255, 255); $blue = imagecolorallocate($im, 2, 74, 125);
            imagefill($im, 0, 0, $white); imagestring($im, 5, 25, 35, strtoupper($role).' DEMO - FIRMA DE MUESTRA', $blue);
            imagestring($im, 3, 25, 75, 'SIN VALIDEZ - PRESENTACION COMERCIAL', $blue);
            ob_start(); imagepng($im); $disk->put('demo-reunion-v1/firma-'.$role.'.png', ob_get_clean()); imagedestroy($im);
        }
        for ($i = 1; $i <= 4; $i++) {
            $im = imagecreatetruecolor(1000, 500);
            for ($y = 0; $y < 500; $y++) { $color = imagecolorallocate($im, 2, 74 + (int) ($y * .2), 125 + (int) ($y * .2)); imageline($im, 0, $y, 1000, $y, $color); }
            $white = imagecolorallocate($im, 255, 255, 255);
            imagestring($im, 5, 60, 170, 'LATIN TERRA | AULA VIRTUAL', $white);
            imagestring($im, 5, 60, 225, 'CURSO DEMO 0'.$i.' - SEGURIDAD Y CAPACITACION', $white);
            imagestring($im, 4, 60, 280, 'Datos de prueba para presentacion', $white);
            ob_start(); imagepng($im); $disk->put('demo-reunion-v1/curso-'.$i.'.png', ob_get_clean()); imagedestroy($im);
        }
        return [['id' => (string) Str::uuid(), 'name' => 'DEMO Representante de empresa', 'role' => 'company', 'path' => 'demo-reunion-v1/firma-company.png'],
            ['id' => (string) Str::uuid(), 'name' => 'DEMO Instructor', 'role' => 'instructor', 'path' => 'demo-reunion-v1/firma-instructor.png']];
    }
}
