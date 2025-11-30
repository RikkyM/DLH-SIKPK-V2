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
        'jam_keluar'
    ];

    public function pegawai()
    {
        return $this->hasMany(Pegawai::class, 'id_shift', 'id');
    }
}
