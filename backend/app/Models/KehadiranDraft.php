<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KehadiranDraft extends Model
{
    protected $connection = 'mysql';

    protected $fillable = [
        'old_id',
        'pegawai_id',
        'nik',
        'nama',
        'check_time',
        'check_type',
        'nama_department',
        'jabatan',
        'shift_kerja',
        'keterangan',
        'bukti_dukung',
        'status'
    ];

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'pegawai_id', 'old_id');
    }
}
