<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kehadiran extends Model
{
    protected $connection = 'mysql';
    protected $table = 'kehadiran';

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
        'bukti_dukung'
    ];

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'old_id', 'pegawai_id');
    }
}
