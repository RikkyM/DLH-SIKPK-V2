<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShiftKerja extends Model
{
    use SoftDeletes;
    protected $connection = 'mysql';
    protected $table = 'shift_kerja';

    protected $fillable = [
        'jadwal',
        'jam_masuk',
        'jam_keluar',
        'telat',
        'pulang_cepat'
    ];

    protected $casts = [
        'telat' => 'array',
        'pulang_cepat' => 'array'
    ];

    public function pegawai()
    {
        return $this->hasMany(Pegawai::class, 'id_shift', 'id');
    }
}
