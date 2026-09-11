<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use App\Models\Distrito;
use App\Models\Pais;
use App\Models\Provincia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Endpoints livianos para los selects en cascada de Departamento/Provincia/
 * Distrito (no se manda el catalogo completo de una vez - serian ~1800
 * distritos - se pide de a un nivel segun lo que el usuario va eligiendo).
 */
class UbigeoController extends Controller
{
    public function paises(): JsonResponse
    {
        return response()->json(
            Pais::orderBy('nombre')->get(['id', 'codigo', 'nombre'])
        );
    }

    public function departamentos(): JsonResponse
    {
        return response()->json(
            Departamento::orderBy('nombre')->get(['id', 'nombre'])
        );
    }

    public function provincias(Request $request): JsonResponse
    {
        $request->validate(['departamento_id' => ['required', 'integer']]);

        return response()->json(
            Provincia::where('departamento_id', $request->departamento_id)
                ->orderBy('nombre')
                ->get(['id', 'nombre'])
        );
    }

    public function distritos(Request $request): JsonResponse
    {
        $request->validate(['provincia_id' => ['required', 'integer']]);

        return response()->json(
            Distrito::where('provincia_id', $request->provincia_id)
                ->orderBy('nombre')
                ->get(['id', 'nombre'])
        );
    }
}
