<?php

namespace App\Http\Requests\Parceira;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParceiraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nome' => [
                'required',
                'string',
                'max:255',
                Rule::unique('parceiras', 'nome')->ignore($this->route('parceira')),
            ],
            'email' => ['required', 'email', 'max:255'],
            'telefone' => ['required', 'string', 'max:32'],
            'instagram' => ['required', 'string', 'max:255'],
            'chave_pix' => ['required', 'string', 'max:255'],
            'cidade' => ['required', 'string', 'max:255'],
            'uf' => ['required', 'string', 'size:2'],
            'cnpj' => ['nullable', 'string', 'max:32'],
            'cep' => ['nullable', 'string', 'max:9'],
            'rua' => ['nullable', 'string', 'max:255'],
            'bairro' => ['nullable', 'string', 'max:255'],
            'numero' => ['nullable', 'string', 'max:20'],
            'complemento' => ['nullable', 'string', 'max:255'],
        ];
    }
}
