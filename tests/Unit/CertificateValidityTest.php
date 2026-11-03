<?php

namespace Tests\Unit;

use App\Models\Aula\Certificate;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CertificateValidityTest extends TestCase
{
    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_legacy_certificate_expires_one_year_after_issue_without_mutating_issue_date(): void
    {
        $certificate = new Certificate(['issued_at' => '2024-02-29 10:00:00']);
        Carbon::setTestNow('2025-02-28 09:59:59');
        $this->assertSame('valid', $certificate->validityStatus());
        $this->assertSame('2025-02-28 10:00:00', $certificate->validityEndsAt()->toDateTimeString());
        $this->assertSame('2024-02-29', $certificate->issued_at->toDateString());
        Carbon::setTestNow('2025-02-28 10:00:00');
        $this->assertSame('expired', $certificate->validityStatus());
    }

    public function test_explicit_expiry_is_used_and_missing_dates_are_not_reported_valid(): void
    {
        Carbon::setTestNow('2026-11-03 12:00:00');
        $certificate = new Certificate(['issued_at' => '2026-01-01', 'expires_at' => '2026-10-01']);
        $this->assertSame('expired', $certificate->validityStatus());
        $this->assertSame('unknown', (new Certificate())->validityStatus());
    }
}
