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
        'department_id',
        'badgenumber',
        'nama',
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
        'updated_at'
    ];

    public function department()
    {
        return $this->belongsTo(Departments::class, 'department_id', 'DeptID');
    }
}
