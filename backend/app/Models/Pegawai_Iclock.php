<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pegawai_Iclock extends Model
{
    protected $connection = 'mysql_iclock';
    protected $table      = 'userinfo';
    protected $primaryKey = 'userid';
}
