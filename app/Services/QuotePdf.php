<?php

namespace App\Services;

use App\Models\Ventas\Quote;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\File;

class QuotePdf
{
    public function render(Quote $quote): string
    {
        $cache = storage_path('framework/cache/dompdf');
        File::ensureDirectoryExists($cache);
        $logoPath = public_path('assets/img/logo.png');
        $logo = is_file($logoPath) ? 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath)) : null;
        $options = new Options([
            'isRemoteEnabled' => false, 'isPhpEnabled' => false, 'isJavascriptEnabled' => false,
            'defaultFont' => 'DejaVu Sans', 'tempDir' => $cache, 'fontCache' => $cache,
        ]);
        $pdf = new Dompdf($options);
        $pdf->setPaper('A4', 'portrait');
        $pdf->loadHtml(view('pdf.quote', ['quote' => $quote, 'logo' => $logo])->render(), 'UTF-8');
        $pdf->render();

        return $pdf->output();
    }
}
