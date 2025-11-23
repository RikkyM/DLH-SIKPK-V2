<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisKendaraan extends Model
{
    protected $table = 'jenis_kendaraan';
    protected $fillable = [
        'nama'
    ];
}
