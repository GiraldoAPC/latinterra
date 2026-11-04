<?php

namespace App\Services;

use App\Models\Aula\Course;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\CourseModule;
use App\Models\Aula\Exam;

class StudentLearningPayload
{
    public function exam(?Exam $exam, bool $questions = true): ?array
    {
        if (!$exam) return null;
        return ['id' => $exam->id, 'title' => $exam->title, 'questions' => $exam->questions->map(function ($question) use ($questions) {
            if (!$questions) return ['id' => $question->id];
            return ['id' => $question->id, 'question' => $question->question, 'type' => $question->type,
                // Short-answer options contain the answer key, not choices for the student.
                'options' => $question->isShortAnswer() ? [] : $question->options->map(fn ($option) => [
                    'id' => $option->id, 'option_text' => $option->option_text,
                ])->all()];
        })->all()];
    }

    public function course(Course $course): array
    {
        return ['id' => $course->id, 'slug' => $course->slug, 'title' => $course->title, 'price' => $course->price, 'is_free' => $course->is_free,
            'modules' => $course->modules->map(fn ($module) => [
                'id' => $module->id, 'title' => $module->title, 'exam' => $this->exam($module->exam, false),
                'lessons' => $module->lessons->map(fn ($lesson) => [
                    'id' => $lesson->id, 'title' => $lesson->title, 'duration_seconds' => $lesson->duration_seconds,
                    'exam' => $this->exam($lesson->exam, false),
                ])->all(),
            ])->all()];
    }

    public function publicCourse(Course $course): array
    {
        return $course->only(['id', 'slug', 'title', 'summary', 'description', 'is_free', 'price', 'thumbnail']) + [
            'prerequisite_course' => $course->prerequisiteCourse ? $course->prerequisiteCourse->only(['id', 'title']) : null,
            'modules' => $course->modules->map(fn ($module) => [
                'id' => $module->id, 'title' => $module->title,
                'lessons' => $module->lessons->map(fn ($lesson) => $lesson->only(['id', 'title', 'duration_seconds']))->all(),
            ])->all(),
        ];
    }

    public function lesson(CourseLesson $lesson, bool $questions = false): array
    {
        return ['id' => $lesson->id, 'course_module_id' => $lesson->course_module_id,
            'title' => $lesson->title, 'description' => $lesson->description,
            'youtube_video_id' => $lesson->youtube_video_id, 'duration_seconds' => $lesson->duration_seconds,
            'materials' => $lesson->materials->map(fn ($material) => [
                'id' => $material->id, 'title' => $material->title, 'url' => $material->url,
                'original_name' => $material->original_name, 'mime_type' => $material->mime_type, 'size' => $material->size,
            ])->all(), 'exam' => $this->exam($lesson->exam, $questions)];
    }

    public function module(CourseModule $module): array
    {
        return ['id' => $module->id, 'title' => $module->title, 'exam' => $this->exam($module->exam)];
    }
}
