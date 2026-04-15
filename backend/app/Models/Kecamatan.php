<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kecamatan extends Model
{
    protected $connection = 'mysql_sirep';
    protected $table = 'kecamatan';
    protected $primaryKey = 'kodeKecamatan';

    public $timestamps = false;
    public $incrementing = false;
}
