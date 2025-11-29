<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecktimeSikpk extends Model
{
    protected $connection = 'mysql';
    protected $table = 'checktime_sikpk';

    public $timestamps = false;

    protected $fillable = [
        'old_id',
        'userid',
        'checktime',
        'checktype',
        'verifycode',
        'SN',
        'sensorid',
        'WorkCode',
        'Reserved'
    ];

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'userid', 'old_id');
    }
}
