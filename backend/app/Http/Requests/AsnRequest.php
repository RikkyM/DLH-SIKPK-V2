<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AsnRequest extends FormRequest
{
    private function req(): string
    {
        return $this->isMethod('post') ? "required" : "sometimes|filled";
    }

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
            'id_department' => 'sometimes|nullable|numeric|exists:mysql_iclock.departments,deptID',
            'nip' => $this->req() . '|numeric|digits:18',
            'nama' => $this->req() . '|string|max:50',
            'pangkat' => $this->req() . '|string|max:50',
            'golongan' => $this->req() . '|string|max:50',
            'jabatan' => $this->req() . '|string|max:255',
            'role' => $this->req() . '|in:KABID,KATIM,KUPTD,KASUBBAG,BENDAHARA,OPERATOR,SEKRETARIAT',
        ];
    }

    public function messages(): array
    {
        return [
            '*.required' => ':attribute wajib diisi.',
            '*.numeric' => ':attribute harus berupa angka.',
            '*.string' => ':attribute harus berupa teks.',
            '*.digits' => ':attribute harus 18 digit.',
            '*.exists' => ':attribute tidak ditemukan.',
            '*.in' => ':attribute tidak valid. Pilih salah satu: :values.',
            '*.max' => ':attribute maksimal :max karakter.',
            '*.filled' => ':attribute tidak boleh kosong.'
        ];
    }

    public function attributes(): array
    {
        return [
            'id_department' => 'Unit kerja',
            'nip' => 'NIP',
            'nama' => 'Nama',
            'pangkat' => 'Pangkat',
            'golongan' => "Golongan",
            'jabatan' => 'Jabatan',
            'role' => 'Role'
        ];
    }
}
