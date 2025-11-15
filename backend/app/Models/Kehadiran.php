<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kehadiran extends Model
{
    protected $connection = 'mysql';
    protected $table = 'kehadiran';

    protected $fillable = [
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
}
