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
}
