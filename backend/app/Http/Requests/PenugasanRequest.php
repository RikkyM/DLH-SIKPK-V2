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
            'no_rekening' => "nullable|string",
            'kpa_id' => 'nullable|exists:pegawai_asn,id',
            'bp_id' => 'nullable|exists:pegawai_asn,id',
            'bpp_id' => 'nullable|exists:pegawai_asn,id',
            'pptk_id' => 'nullable|exists:pegawai_asn,id',
            'kasubbag_id' => 'nullable|exists:pegawai_asn,id',
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
            'no_rekening' => "Nomor Rekening.",
            'kpa_id' => 'KPA',
            'bp_id' => 'BP',
            'bpp_id' => "BPP",
            'pptk_id' => 'PPTK',
            'kasubbag_id' => "Kasubbag Keuangan"
        ];
    }
}
