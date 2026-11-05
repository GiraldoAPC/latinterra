<?php

namespace App\Services;

use App\Models\Aula\CourseLessonMaterial;
use App\Models\Aula\Enrollment;
use App\Models\Aula\LessonMaterialView;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MaterialPageTracker
{
    public const SECONDS_PER_PAGE = 12;

    public function start(Enrollment $enrollment, CourseLessonMaterial $material): array
    {
        return DB::transaction(function () use ($enrollment, $material) {
            $this->lockEnrollment($enrollment, $material);
            app(MaterialPdfMetadata::class)->ensure($material);
            $view = LessonMaterialView::firstOrCreate(['enrollment_id' => $enrollment->id, 'course_lesson_material_id' => $material->id], ['opened_at' => now()]);
            // Previously approved files remain approved, including approvals made before page tracking.
            if ($view->confirmed_at) return $this->payload($view, $material);
            $state = $view->reading_state ?? [];
            if (($state['checksum'] ?? null) !== $material->pdf_checksum) {
                $state = ['checksum' => $material->pdf_checksum, 'completed_pages' => 0, 'elapsed_ms' => 0, 'page' => 1];
            }
            $state['token'] = (string) Str::uuid();
            $state['page'] = min($material->pdf_page_count, $state['completed_pages'] + 1);
            $state['last_ping_ms'] = now()->getTimestampMs();
            $state['active'] = false;
            $view->update(['reading_state' => $state]);
            return $this->payload($view, $material) + ['token' => $state['token']];
        });
    }

    public function heartbeat(Enrollment $enrollment, CourseLessonMaterial $material, string $token, int $page, bool $active): array
    {
        return DB::transaction(function () use ($enrollment, $material, $token, $page, $active) {
            $this->lockEnrollment($enrollment, $material);
            $view = LessonMaterialView::where('enrollment_id', $enrollment->id)->where('course_lesson_material_id', $material->id)->first();
            $state = $view->reading_state ?? [];
            if (!$view || !isset($state['token']) || !hash_equals($state['token'], $token)
                || ($state['checksum'] ?? null) !== $material->pdf_checksum) {
                $this->invalid('Esta sesión de lectura cambió. Cierra el material y vuelve a abrirlo para retomar tu avance.');
            }
            if ($view->confirmed_at) return $this->payload($view, $material);
            if ($page < 1 || $page > min($material->pdf_page_count, $state['completed_pages'] + 1)) {
                $this->invalid('Completa el tiempo de la página actual antes de continuar.');
            }
            $now = now()->getTimestampMs();
            $elapsed = max(0, $now - $state['last_ping_ms']);
            // Only consecutive visible-page heartbeats count. Gaps and page switches never credit time away.
            if ($state['active'] && $active && $state['page'] === $page && $page === $state['completed_pages'] + 1 && $elapsed <= 6500) {
                $state['elapsed_ms'] = min(self::SECONDS_PER_PAGE * 1000, $state['elapsed_ms'] + $elapsed);
                if ($state['elapsed_ms'] >= self::SECONDS_PER_PAGE * 1000) {
                    $state['completed_pages']++;
                    $state['elapsed_ms'] = 0;
                    if ($state['completed_pages'] === $material->pdf_page_count) $view->confirmed_at = now();
                }
            }
            $state['page'] = $page;
            $state['active'] = $active && !$view->confirmed_at;
            $state['last_ping_ms'] = $now;
            $view->reading_state = $state;
            $view->save();
            return $this->payload($view, $material);
        });
    }

    private function lockEnrollment(Enrollment $enrollment, CourseLessonMaterial $material): void
    {
        $locked = Enrollment::whereKey($enrollment->id)->lockForUpdate()->firstOrFail();
        abort_unless($material->lesson && (int) $material->lesson->module->course_id === (int) $locked->course_id, 404);
        abort_unless($locked->status === 'active' && !$locked->isTrulyCompleted(), 403);
        abort_unless($material->isPdf(), 422);
    }

    private function invalid(string $message): void
    {
        throw ValidationException::withMessages(['material' => $message]);
    }

    private function payload(LessonMaterialView $view, CourseLessonMaterial $material): array
    {
        $state = $view->reading_state ?? [];
        return ['complete' => (bool) $view->confirmed_at, 'page_count' => $material->pdf_page_count,
            'completed_pages' => $view->confirmed_at ? $material->pdf_page_count : ($state['completed_pages'] ?? 0),
            'page' => $state['page'] ?? 1, 'elapsed_ms' => $state['elapsed_ms'] ?? 0,
            'seconds_per_page' => self::SECONDS_PER_PAGE];
    }
}
