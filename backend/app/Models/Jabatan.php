<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Jabatan extends Model
{
    use SoftDeletes;
    protected $table = 'jabatan';
    
    protected $fillable = [
        'nama',
        'gaji',
        'kpa',
        'bp',
        'bpp',
        'pptk',
    ];

    public function pegawais()
    {
        return $this->hasMany(Pegawai::class, 'id_penugasan', 'id');
    }
}
