<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShiftKerjaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'jadwal' => 'required|string|max:255',
            'jam_masuk' => 'required|date_format:H:i:s',
            'jam_keluar' => 'required|date_format:H:i:s',
            'telat' => 'nullable|array',
            'telat.*' => 'nullable|date_format:H:i:s',
            'pulang_cepat' => 'nullable|array',
            'pulang_cepat.*' => 'nullable|date_format:H:i:s'
        ];
    }

    public function messages(): array
    {
        return [
            '*.required' => ':attribute wajib diisi.'
        ];
    }
}
