<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kendaraan extends Model
{
    protected $table = 'kendaraan';

    protected $fillable = [
        'no_tnkb',
        'id_jenis_kendaraan',
        'merk',
        'lambung',
        'no_rangka',
        'no_mesin',
        'tahun_pembuatan',
        'kondisi',
        'keterangan'
    ];

    public function jenisKendaraan()
    {
        return $this->belongsTo(JenisKendaraan::class)->withTrashed();
    }
}
