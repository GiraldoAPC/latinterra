<?php

namespace App\Services;

use App\Models\Aula\{Certificate, Course, InPersonCertificate};

class CertificateCourseDetails
{
    public static function snapshot(Course $course): array
    {
        return ['title' => $course->title, 'content' => $course->certificate_content,
            'duration_hours' => $course->certificate_duration_hours];
    }

    public static function resolve(Certificate|InPersonCertificate $certificate): array
    {
        // New certificates preserve even intentionally empty fields. Legacy certificates use current course configuration.
        if ($certificate->course_details !== null) return $certificate->course_details;
        if ($certificate instanceof Certificate) return self::snapshot($certificate->enrollment->course);
        $course = $certificate->participant?->session?->course;
        return ['title' => $certificate->course_title, 'content' => $course?->certificate_content,
            'duration_hours' => $course?->certificate_duration_hours];
    }
}
