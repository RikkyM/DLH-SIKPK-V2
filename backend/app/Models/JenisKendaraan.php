<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JenisKendaraan extends Model
{
    use SoftDeletes;
    protected $connection = 'mysql';
    protected $table = 'jenis_kendaraan';
    protected $fillable = [
        'nama',
    ];

    public function kendaraan()
    {
        return $this->hasMany(Kendaraan::class);
    }
}
