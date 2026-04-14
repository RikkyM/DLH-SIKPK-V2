<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EncryptFile extends Model
{
    protected $fillable = [
        'type',
        'name',
        'password',
        'is_active'
    ];
}
