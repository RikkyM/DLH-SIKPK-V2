<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kendaraan extends Model
{
    protected $connection = 'mysql';
    protected $table = 'kendaraan';

    protected $fillable = [
        'no_tnkb',
        'id_jenis_kendaraan',
        'id_department',
        'merk',
        'lambung',
        'no_rangka',
        'no_mesin',
        'tahun_pembuatan',
        'kondisi',
        'keterangan'
    ];

    public function department()
    {
        return $this->belongsTo(Departments::class, 'id_department', 'DeptID');
    }

    public function jenisKendaraan()
    {
        return $this->belongsTo(JenisKendaraan::class, 'id_jenis_kendaraan', 'id')->withTrashed();
    }
}
