<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PenugasanRequest extends FormRequest
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
            'nama' => 'required|unique:jabatan,nama,' . $this->id,
            'gaji' => 'required|numeric',
            'kpa' => 'nullable|string|exists:pegawai_asn,nama',
            'bp' => 'nullable|string|exists:pegawai_asn,nama',
            'bpp' => 'nullable|string|exists:pegawai_asn,nama',
            'pptk' => 'nullable|string|exists:pegawai_asn,nama'
        ];
    }

    public function messages(): array
    {
        return [
            '*.required' => ':attribute wajib diisi.',
            '*.unique' => ':attribute sudah ada.',
            '*.exists' => ':attribute tidak ada.',
            '*.numeric' => ':attribute harus angka.',
            '*.string' => ':attribute harus teks.',
        ];
    }

    public function attributes(): array
    {
        return [
            'nama' => 'Nama',
            'gaji' => 'Gaji',
            'kpa' => 'KPA',
            'bp' => 'BP',
            'bpp' => "BPP",
            'pptk' => 'PPTK',
        ];
    }
}
