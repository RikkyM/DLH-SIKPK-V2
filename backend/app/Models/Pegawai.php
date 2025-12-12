<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pegawai extends Model
{
    protected $connection = 'mysql';
    protected $table = 'pegawai';

    protected $fillable = [
        'id',
        'old_id',
        'id_department',
        'id_penugasan',
        'id_shift',
        'id_korlap',
        'badgenumber',
        'nama',
        'penugasan',
        'shift',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'gol_darah',
        'alamat',
        'rt',
        'rw',
        'kelurahan',
        'kecamatan',
        'agama',
        'status_perkawinan',
        'upload_ktp',
        'upload_kk',
        'upload_pas_foto',
        'foto_lapangan',
        'rute_kerja',
        'updated_at'
    ];

    public function department()
    {
        return $this->belongsTo(Departments::class, 'id_department', 'DeptID');
    }

    public function shift()
    {
        return $this->belongsTo(ShiftKerja::class, 'id_shift', 'id');
    }

    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class, 'id_penugasan', 'id');
    }

    public function korlap()
    {
        return $this->belongsTo(PegawaiAsn::class, 'id_korlap', 'id');
    }

    public function kehadirans()
    {
        return $this->hasMany(Kehadiran::class, 'pegawai_id', 'old_id');
    }

    public function fingers()
    {
        return $this->hasMany(ChecktimeSikpk::class, 'userid', 'old_id');
    }
}
