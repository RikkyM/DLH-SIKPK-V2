<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departments extends Model
{
    protected $connection = 'mysql_iclock';
    protected $table = 'departments';
    protected $primaryKey = 'DeptID';
    public $timestamps = false;
    public $incrementing = true;

    protected $fillable = [
        'DeptID',
        'DeptName'
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'id_department', 'DeptID');
    }

    public function pegawai()
    {
        return $this->hasMany(Pegawai::class, 'id_department', 'DeptID');
    }
}
