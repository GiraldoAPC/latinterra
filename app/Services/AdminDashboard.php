<?php

namespace App\Services;

use App\Models\Aula\Certificate;
use App\Models\Aula\Course;
use App\Models\Aula\CourseInstallment;
use App\Models\Aula\CourseOrder;
use App\Models\Aula\Enrollment;
use App\Models\Aula\InPersonCertificate;
use App\Models\Aula\InPersonSession;
use App\Models\Inventario\StockPurchase;
use App\Models\Inventario\StockSponsorship;
use App\Models\User;
use App\Models\Ventas\OtherPayment;
use App\Models\Ventas\Product;
use App\Models\Ventas\Quote;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class AdminDashboard
{
    private const ZONE = 'America/Lima';

    public function build(int $days = 30): array
    {
        if (!in_array($days, [7, 30, 90], true)) throw new \InvalidArgumentException('Periodo no válido.');
        $now = CarbonImmutable::now(self::ZONE);
        $start = $now->startOfDay()->subDays($days - 1);
        $previousStart = $start->subDays($days);
        $today = $now->toDateString();
        $daily = [];
        for ($date = $start; $date->lessThanOrEqualTo($now); $date = $date->addDay()) {
            $daily[$date->toDateString()] = ['date' => $date->toDateString(), 'sales' => 0, 'installments' => 0, 'orders' => 0, 'total' => 0];
        }
        $sources = [];
        foreach ([
            'sales' => ['Ventas y otros pagos', OtherPayment::whereNull('voided_at')],
            'installments' => ['Cuotas de cursos', CourseInstallment::where('status', 'paid')],
            'orders' => ['Pedidos de cursos pagados', CourseOrder::where('status', 'paid')],
        ] as $key => [$label, $query]) {
            $current = $previous = $count = 0;
            // Cursor streams only amount/date; no unbounded payment collection or client-side totals.
            $rows = $query->where('paid_at', '>=', $this->databaseTime($previousStart))
                ->where('paid_at', '<=', $this->databaseTime($now))->toBase()->select('paid_at', 'amount')->cursor();
            foreach ($rows as $row) {
                $paid = CarbonImmutable::parse($row->paid_at, config('app.timezone'))->setTimezone(self::ZONE);
                $cents = (int) round((float) $row->amount * 100);
                if ($paid->lessThan($start)) { $previous += $cents; continue; }
                $current += $cents;
                $count++;
                $day = $paid->toDateString();
                $daily[$day][$key] += $cents;
                $daily[$day]['total'] += $cents;
            }
            $sources[] = ['key' => $key, 'label' => $label, 'amount' => $current / 100, 'previous' => $previous / 100, 'count' => $count];
        }
        $cashTotal = array_sum(array_column($sources, 'amount'));
        $previousTotal = array_sum(array_column($sources, 'previous'));
        $enrollments = fn () => Enrollment::whereIn('status', ['active', 'completed']);
        $quotes = $this->period(Quote::query(), 'created_at', $start, $now);
        $ready = Quote::where('status', 'approved')->whereNull('other_payment_id')
            ->where(fn ($query) => $query->whereNull('valid_until')->orWhereDate('valid_until', '>=', $today));
        $overdue = CourseInstallment::where('status', 'pending')->whereDate('due_date', '<=', $today)
            ->whereHas('enrollment', fn ($query) => $query->whereIn('status', ['active', 'completed']));
        $lowStock = Product::active()->lowStock();
        $expiring = $this->expiringCertificates($now);

        return [
            'generated_at' => $now->toIso8601String(),
            'period' => ['days' => $days, 'start' => $start->toDateString(), 'end' => $today,
                'previous_start' => $previousStart->toDateString(), 'previous_end' => $start->subDay()->toDateString(), 'timezone' => self::ZONE],
            'cash' => [
                'total' => round($cashTotal, 2), 'previous' => round($previousTotal, 2),
                'change_percent' => $previousTotal > 0 ? round(($cashTotal - $previousTotal) / $previousTotal * 100, 1) : null,
                'count' => array_sum(array_column($sources, 'count')), 'sources' => $sources,
                'daily' => array_values(array_map(function ($day) {
                    foreach (['sales', 'installments', 'orders', 'total'] as $key) $day[$key] /= 100;
                    return $day;
                }, $daily)),
                'purchases' => (float) StockPurchase::whereDate('purchased_at', '>=', $start->toDateString())->whereDate('purchased_at', '<=', $today)->sum('total'),
                'sponsorships' => (float) $this->period(StockSponsorship::query(), 'created_at', $start, $now)->sum('total_cost'),
            ],
            'activity' => [
                'enrollments' => $this->period($enrollments(), 'created_at', $start, $now)->count(),
                'previous_enrollments' => $this->previousPeriod($enrollments(), 'created_at', $previousStart, $start)->count(),
                'certificates' => $this->issued($start, $now),
                'previous_certificates' => $this->issued($previousStart, $start, true),
                'quotes' => (clone $quotes)->count(),
                'quotes_converted' => (clone $quotes)->where('status', 'sold')->whereHas('payment', fn ($query) => $query->whereNull('voided_at')->whereNotNull('paid_at')->where('paid_at', '<=', $this->databaseTime($now)))->count(),
            ],
            'academic' => [
                'active_students' => User::where('role', 'student')->where('is_active', true)->count(),
                'published_courses' => Course::where('is_published', true)->count(),
                'active_enrollments' => Enrollment::where('status', 'active')->whereDoesntHave('certificate')->count(),
                'completed_enrollments' => Enrollment::where(fn ($query) => $query->where('status', 'completed')->orWhereHas('certificate'))->count(),
            ],
            'attention' => [
                'overdue_count' => (clone $overdue)->count(), 'overdue_amount' => (float) (clone $overdue)->sum('amount'),
                'pending_orders' => CourseOrder::where('status', 'pending')->where('source', 'online')->count(),
                'ready_quotes' => (clone $ready)->count(), 'low_stock' => (clone $lowStock)->count(),
                'expiring_certificates' => $expiring['count'],
            ],
            'overdue' => (clone $overdue)->with('enrollment.user:id,name', 'enrollment.course:id,title')->orderBy('due_date')->orderBy('id')->limit(5)->get()->map(fn ($item) => [
                'id' => $item->id, 'student' => $item->enrollment->user->name, 'course' => $item->enrollment->course->title,
                'amount' => (float) $item->amount, 'due_date' => $item->due_date->format('Y-m-d'),
                'href' => '/admin/estudiantes/'.$item->enrollment->user_id.'/perfil',
            ])->all(),
            'ready_quotes' => (clone $ready)->orderByRaw('valid_until IS NULL')->orderBy('valid_until')->orderBy('id')->limit(5)->get(['id', 'code', 'buyer_name', 'amount', 'valid_until'])->map(fn ($quote) => [
                'id' => $quote->id, 'code' => $quote->code, 'buyer' => $quote->buyer_name, 'amount' => (float) $quote->amount,
                'valid_until' => $quote->valid_until?->format('Y-m-d'), 'href' => '/admin/quotes/'.$quote->id,
            ])->all(),
            'low_stock' => (clone $lowStock)->orderBy('stock')->orderBy('id')->limit(5)->get(['id', 'name', 'stock', 'stock_warehouse', 'min_stock'])->toArray(),
            'expiring_certificates' => $expiring['items'],
            'upcoming' => InPersonSession::with('course:id,title')->withCount('participants')->where('starts_at', '>=', $this->databaseTime($now))
                ->where('starts_at', '<=', $this->databaseTime($now->addDays(14)))->orderBy('starts_at')->limit(5)->get()->map(fn ($session) => [
                    'id' => $session->id, 'title' => $session->title, 'course' => $session->course->title, 'location' => $session->location,
                    'starts_at' => $session->starts_at->toIso8601String(), 'participants' => $session->participants_count, 'capacity' => $session->capacity,
                    'href' => '/admin/cursos/presenciales/'.$session->id,
                ])->all(),
        ];
    }

    private function databaseTime(CarbonImmutable $date): string
    {
        return $date->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s');
    }

    private function period(Builder $query, string $column, CarbonImmutable $start, CarbonImmutable $end): Builder
    {
        return $query->where($column, '>=', $this->databaseTime($start))->where($column, '<=', $this->databaseTime($end));
    }

    private function previousPeriod(Builder $query, string $column, CarbonImmutable $start, CarbonImmutable $end): Builder
    {
        return $query->where($column, '>=', $this->databaseTime($start))->where($column, '<', $this->databaseTime($end));
    }

    private function issued(CarbonImmutable $start, CarbonImmutable $end, bool $previous = false): int
    {
        $total = 0;
        foreach ([Certificate::query(), InPersonCertificate::query()] as $query) {
            $total += ($previous ? $this->previousPeriod($query, 'issued_at', $start, $end) : $this->period($query, 'issued_at', $start, $end))->count();
        }
        return $total;
    }

    private function expiringCertificates(CarbonImmutable $now): array
    {
        $horizon = $now->addDays(30);
        $count = 0;
        $items = [];
        $online = Certificate::where(function ($query) use ($now, $horizon) {
            $query->whereBetween('expires_at', [$this->databaseTime($now), $this->databaseTime($horizon)])
                ->orWhere(fn ($legacy) => $legacy->whereNull('expires_at')->whereBetween('issued_at', [
                    $this->databaseTime($now->subYear()->subDays(2)), $this->databaseTime($horizon->subYear()->addDays(2)),
                ]));
        })->with('enrollment.user:id,name', 'enrollment.course:id,title');
        $presential = InPersonCertificate::whereBetween('expires_at', [$this->databaseTime($now), $this->databaseTime($horizon)]);
        foreach ([$online, $presential] as $query) {
            foreach ($query->lazyById(200) as $certificate) {
                $expires = $certificate instanceof Certificate ? $certificate->validityEndsAt() : $certificate->expires_at;
                if (!$expires || $expires->lessThanOrEqualTo($now) || $expires->greaterThan($horizon)) continue;
                $count++;
                $items[] = ['code' => $certificate->code, 'student' => $certificate instanceof Certificate ? $certificate->enrollment->user->name : $certificate->student_name,
                    'course' => $certificate instanceof Certificate ? $certificate->enrollment->course->title : $certificate->course_title,
                    'expires_at' => $expires->toIso8601String(), 'modality' => $certificate instanceof Certificate ? 'Virtual' : 'Presencial',
                    'href' => '/certificado/verificar/'.rawurlencode($certificate->code)];
                usort($items, fn ($a, $b) => strcmp($a['expires_at'], $b['expires_at']));
                $items = array_slice($items, 0, 5);
            }
        }
        return ['count' => $count, 'items' => $items];
    }
}
