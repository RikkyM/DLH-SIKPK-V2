<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'username' => 'superadmin',
                'password' => 'duniafana2021',
                'role'     => 'superadmin'
            ],
            [
                'username'      => 'admin',
                'password'      => '12345678',
                'role'          => 'admin'
            ],
            [
                'id_department' => 2,
                'username'      => 'dlhsekretariat',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 3,
                'username'      => 'uptdalanglebar',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 6,
                'username'      => 'uptdilirbarat1',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 7,
                'username'      => 'uptdilirbarat2',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 8,
                'username'      => 'uptdilirtimur1',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 9,
                'username'      => 'uptdilirtimur2',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 10,
                'username'      => 'uptdilirtimur3',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 11,
                'username'      => 'uptdjakabaring',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 12,
                'username'      => 'uptdkalidoni',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 13,
                'username'      => 'uptdkemuning',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 22,
                'username'      => 'uptdlab',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 15,
                'username'      => 'uptdplaju',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 16,
                'username'      => 'uptdsako',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 19,
                'username'      => 'uptdsemabor',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 17,
                'username'      => 'uptdsu1',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 18,
                'username'      => 'uptdsu2',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 21,
                'username'      => 'uptdtpa',
                'password'      => '12345678',
                'role'          => 'operator'
            ],
            [
                'id_department' => 1,
                'username'      => 'dlhkeuangan',
                'password'      => '12345678',
                'role'          => 'keuangan'
            ],
            [
                'id_department' => 1,
                'username'      => 'dlhpalembang',
                'password'      => '12345678',
                'role'          => 'viewer'
            ],
            
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
