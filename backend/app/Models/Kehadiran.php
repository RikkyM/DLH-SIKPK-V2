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
        'gaji',
        'shift_kerja',
        'jam_masuk',
        'jam_keluar',
        'telat',
        'pulang_cepat',
        'upah_kerja',
        'keterangan',
        'bukti_dukung',
        'status_kerja',
        'history'
    ];

    protected $casts = [
        'history' => 'array',
        'telat' => 'array',
        'pulang_cepat' => 'array'
    ];

    protected $attributes = [
        'history' => '[]',
        'telat' => '[]',
        'pulang_cepat' => '[]',
    ];

    public function scopeKehadiranHarian($query)
    {
        return $query
            ->selectRaw('
                pegawai_id,
                MAX(jam_masuk) as jam_absen,
                MAX(jam_keluar) as jam_keluar,
                MAX(shift_kerja) as shift_kerja,
                MAX(telat) as telat,
                MAX(pulang_cepat) as pulang_cepat,
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
