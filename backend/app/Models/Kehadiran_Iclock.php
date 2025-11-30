<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kehadiran_Iclock extends Model
{
    protected $connection = 'mysql_iclock';
    protected $table      = 'checkinout';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'userid',
        'checktime',
        'checktype',
        'verifycode',
        'SN',
        'sensorid',
        'WorkCode',
        'Reserved'
    ];
}
