<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Jabatan extends Model
{
    use SoftDeletes;
    protected $table = 'jabatan';
    
    protected $fillable = [
        'kpa_id',
        'bp_id',
        'bpp_id',
        'pptk_id',
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

    public function kpaAsn()
    {
        return $this->belongsTo(PegawaiAsn::class, 'kpa_id', 'id');
    }

    public function bpAsn()
    {
        return $this->belongsTo(PegawaiAsn::class, 'bp_id', 'id');
    }

    public function bppAsn()
    {
        return $this->belongsTo(PegawaiAsn::class, 'bpp_id', 'id');
    }

    public function pptkAsn()
    {
        return $this->belongsTo(PegawaiAsn::class, 'pptk_id', 'id');
    }
}
