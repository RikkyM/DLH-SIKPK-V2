<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PegawaiAsn extends Model
{
    protected $table = 'pegawai_asn';

    protected $fillable = [
        'id_department',
        'nip',
        'nama',
        'pangkat',
        'golongan',
        'jabatan',
        'unit_kerja',
        'role'
    ];

    public function jabatanKpa()
    {
        return $this->hasMany(PegawaiAsn::class, 'kpa_id', 'id');
    }

    public function jabatanBp()
    {
        return $this->hasMany(PegawaiAsn::class, 'bp_id', 'id');
    }

    public function jabatanBpp()
    {
        return $this->hasMany(PegawaiAsn::class, 'bpp_id', 'id');
    }
    
    public function jabatanPptk()
    {
        return $this->hasMany(PegawaiAsn::class, 'pptk_id', 'id');
    }
}
