<?php

namespace App\Services;

use App\Models\Aula\CourseLesson;
use App\Models\Aula\Enrollment;
use App\Models\Aula\LessonProgress;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LessonVideoTracker
{
    public function start(Enrollment $enrollment, CourseLesson $lesson): array
    {
        return DB::transaction(function () use ($enrollment, $lesson) {
            $this->lockEnrollment($enrollment, $lesson);
            $progress = LessonProgress::firstOrCreate(['enrollment_id' => $enrollment->id, 'course_lesson_id' => $lesson->id]);
            if ($progress->video_watched_at) return $this->payload($progress, $lesson);
            $this->assertConfigured($lesson);
            if ($progress->video_tracking_video_id !== $lesson->youtube_video_id || $progress->video_tracking_duration !== (int) $lesson->duration_seconds) {
                $progress->video_position_ms = 0;
            }
            $progress->fill(['video_tracking_token' => (string) Str::uuid(), 'video_tracking_video_id' => $lesson->youtube_video_id,
                'video_tracking_duration' => $lesson->duration_seconds, 'video_last_ping_ms' => now()->getTimestampMs(), 'video_is_playing' => false])->save();
            return $this->payload($progress, $lesson, true);
        });
    }

    public function heartbeat(Enrollment $enrollment, CourseLesson $lesson, string $token, float $position, bool $playing, bool $ended): array
    {
        return DB::transaction(function () use ($enrollment, $lesson, $token, $position, $playing, $ended) {
            $this->lockEnrollment($enrollment, $lesson);
            $progress = LessonProgress::where('enrollment_id', $enrollment->id)->where('course_lesson_id', $lesson->id)->first();
            if (!$progress || !$progress->video_tracking_token || !hash_equals($progress->video_tracking_token, $token)) {
                throw ValidationException::withMessages(['video' => 'Esta sesión de video cambió. Vuelve a reproducir para retomar el avance guardado.']);
            }
            $this->assertConfigured($lesson);
            if ($progress->video_tracking_video_id !== $lesson->youtube_video_id || $progress->video_tracking_duration !== (int) $lesson->duration_seconds) {
                throw ValidationException::withMessages(['video' => 'La clase fue actualizada. Recarga la página para ver su contenido actual.']);
            }
            if ($progress->video_watched_at) return $this->payload($progress, $lesson);
            $now = now()->getTimestampMs();
            $elapsed = max(0, $now - (int) $progress->video_last_ping_ms);
            $duration = (int) $lesson->duration_seconds * 1000;
            $reported = (int) round($position * 1000);
            $delta = $reported - $progress->video_position_ms;
            // Missing heartbeats, seeking and playback above real elapsed time cannot earn credit.
            $resync = ($progress->video_is_playing && $elapsed > 15000) || $delta < -1500
                || $delta > $elapsed + 1500 || (!$progress->video_is_playing && $delta > 1500) || $reported > $duration + 1500;
            if (!$resync && $progress->video_is_playing) {
                $progress->video_position_ms = min($duration, $progress->video_position_ms + min(max(0, $delta), $elapsed));
            }
            $progress->video_last_ping_ms = $now;
            $progress->video_is_playing = !$resync && $playing && !$ended;
            // Integer metadata rounds YouTube's fractional duration; never waive the whole video.
            $tolerance = min(1000, max(500, (int) floor($duration * .01)));
            if (!$resync && $ended && $reported >= $duration - $tolerance && $progress->video_position_ms >= $duration - $tolerance) {
                $progress->video_watched_at = now();
                $progress->video_is_playing = false;
            } elseif ($ended) {
                $resync = true;
                $progress->video_is_playing = false;
            }
            $progress->save();
            return $this->payload($progress, $lesson) + ['resync' => $resync];
        });
    }

    private function lockEnrollment(Enrollment $enrollment, CourseLesson $lesson): void
    {
        $locked = Enrollment::whereKey($enrollment->id)->lockForUpdate()->firstOrFail();
        abort_unless($lesson->module && (int) $lesson->module->course_id === (int) $locked->course_id, 404);
        abort_unless($locked->status === 'active' && !$locked->isTrulyCompleted(), 403);
    }

    private function assertConfigured(CourseLesson $lesson): void
    {
        if (!$lesson->youtube_video_id || (int) $lesson->duration_seconds <= 0) {
            throw ValidationException::withMessages(['video' => 'La duración de esta clase está pendiente de configuración. Contacta con administración.']);
        }
    }

    private function payload(LessonProgress $progress, CourseLesson $lesson, bool $includeToken = false): array
    {
        return ['position' => $progress->video_position_ms / 1000, 'duration' => (int) $lesson->duration_seconds,
            'complete' => $progress->video_watched_at !== null] + ($includeToken ? ['token' => $progress->video_tracking_token] : []);
    }
}
