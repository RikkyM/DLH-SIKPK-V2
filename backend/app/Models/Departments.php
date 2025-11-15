<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departments extends Model
{
    protected $connection = 'mysql_iclock';
    protected $table = 'departments';
    protected $primaryKey = 'DeptID';

    public function users()
    {
        // return $this->hasMany(User::class, 'department_id', 'DeptID');
        return $this->hasMany(User::class, 'department_id', 'DeptID');
    }
}
