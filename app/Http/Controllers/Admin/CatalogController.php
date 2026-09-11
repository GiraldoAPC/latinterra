<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SelectOption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CRUD para los catalogos de selects fijos del sistema (tipo de documento,
 * genero, estado SCTR...). Le da al admin control total sobre estas listas
 * sin depender de un cambio de codigo/deploy. Ver App\Models\SelectOption.
 */
class CatalogController extends Controller
{
    public function index(): Response
    {
        $options = SelectOption::query()->orderBy('group')->ordered()->get();

        return Inertia::render('Admin/Catalogs/Index', [
            'groups' => SelectOption::GROUPS,
            'options' => $options->groupBy('group'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request, null);
        SelectOption::create($data);

        return back()->with('success', 'Opcion agregada.');
    }

    public function update(Request $request, SelectOption $option): RedirectResponse
    {
        $data = $this->validated($request, $option->id, $option->group);
        $option->update($data);

        return back()->with('success', 'Opcion actualizada.');
    }

    public function destroy(SelectOption $option): RedirectResponse
    {
        $option->delete();

        return back()->with('success', 'Opcion eliminada.');
    }

    private function validated(Request $request, ?int $ignoreId, ?string $lockGroup = null): array
    {
        $data = $request->validate([
            'group' => ['required', Rule::in(array_keys(SelectOption::GROUPS))],
            'code' => [
                'required', 'string', 'max:40', 'regex:/^[a-z0-9_]+$/',
                Rule::unique('select_options', 'code')
                    ->where(fn ($q) => $q->where('group', $lockGroup ?? $request->input('group')))
                    ->ignore($ignoreId),
            ],
            'label' => ['required', 'string', 'max:80'],
            'pattern' => [
                'nullable', 'string', 'max:120',
                function ($attribute, $value, $fail) {
                    if ($value !== null && $value !== '' && @preg_match($value, '') === false) {
                        $fail('La expresion regular no es valida (ej. /^\\d{8}$/).');
                    }
                },
            ],
            'error_message' => ['nullable', 'string', 'max:180'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ], [
            'code.regex' => 'El codigo solo puede tener minusculas, numeros y guion bajo (sin espacios ni tildes).',
        ]);

        if ($lockGroup) {
            $data['group'] = $lockGroup;
        }

        return $data;
    }
}
