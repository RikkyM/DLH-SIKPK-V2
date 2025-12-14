<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelurahan extends Model
{
    protected $connection = 'mysql_sirep';
    protected $table = 'kelurahan';
    protected $primaryKey = 'kodeKelurahan';
    public $timestamps = false;
    public $incrementing = false;
}
