<?php

namespace Database\Seeders;

use App\Models\EncryptFile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EncryptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $datas = [
            [
                'type' => 'pdf',
                'name' => 'spj',
                'password' => '123456',
            ],
            [
                'type' => 'excel',
                'name' => 'spj',
                'password' => '123456',
            ],
        ];

        foreach ($datas as $data) {
            EncryptFile::create($data);
        }
    }
}
