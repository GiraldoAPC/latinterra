<?php

namespace App\Services;

use App\Models\Aula\CourseLessonMaterial;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Smalot\PdfParser\Config;
use Smalot\PdfParser\Parser;

class MaterialPdfMetadata
{
    public function inspect(string $path): array
    {
        try {
            if (!is_file($path) || filesize($path) > 20 * 1024 * 1024) throw new \RuntimeException('Missing or oversized PDF');
            $config = new Config();
            $config->setRetainImageContent(false);
            $config->setDecodeMemoryLimit(32 * 1024 * 1024);
            $document = (new Parser([], $config))->parseFile($path);
            $count = count($document->getPages());
            if ($count < 1 || $count > 1000) throw new \RuntimeException('Unsupported page count');
            return ['pdf_page_count' => $count, 'pdf_checksum' => hash_file('sha256', $path)];
        } catch (\Throwable $error) {
            throw ValidationException::withMessages(['file' => 'No se pudo leer el PDF. Usa un archivo válido, sin contraseña, de hasta 20 MB y 1000 páginas.']);
        }
    }

    public function ensure(CourseLessonMaterial $material): void
    {
        abort_unless($material->isPdf(), 404);
        $path = Storage::disk('public')->path($material->file_path);
        if (!$material->pdf_page_count || !is_file($path) || !hash_equals($material->pdf_checksum ?? '', hash_file('sha256', $path))) {
            $material->update($this->inspect($path));
        }
    }
}
