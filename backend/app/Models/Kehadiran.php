<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

    public function scopeKehadiranHarian($query)
    {
        return $query
            ->selectRaw('
                pegawai_id,
                DATE(check_time) as tanggal,
                TIME(MIN(CASE WHEN check_type = 0 THEN check_time END)) as jam_masuk,
                TIME(MAX(CASE WHEN check_type = 1 THEN check_time END)) as jam_pulang
            ')
            ->groupBy('pegawai_id', DB::raw('DATE(check_time)'));
    }

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'pegawai_id', 'old_id');
    }
}
