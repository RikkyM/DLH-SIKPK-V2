<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jabatans = [
            [
                'nama' => 'CREW ANGKUTAN SAMPAH',
                'gaji' => 100000
            ],
            [
                'nama' => 'CREW MESIN PRESS',
                'gaji' => 95000
            ],
            [
                'nama' => 'CREW TANGKI',
                'gaji' => 85000
            ],
            [
                'nama' => 'OPERATOR ALAT BERAT',
                'gaji' => 130000
            ],
            [
                'nama' => 'OPERATOR TIMBANGAN',
                'gaji' => 90000
            ],
            [
                'nama' => 'PENGAWAS KEBERSIHAN',
                'gaji' => 110000
            ],
            [
                'nama' => 'PENJAGA CUCIAN MOBIL',
                'gaji' => 80000
            ],
            [
                'nama' => 'PENJAGA DEPO',
                'gaji' => 70000
            ],
            [
                'nama' => 'PENJAGA TANGGUL TPA',
                'gaji' => 70000
            ],
            [
                'nama' => 'PENYAPUAN',
                'gaji' => 100000
            ],
            [
                'nama' => 'PENYAPUAN KELILING',
                'gaji' => 100000
            ],
            [
                'nama' => 'PETUGAS ADMINISTRASI KANTOR',
                'gaji' => 70000
            ],
            [
                'nama' => 'PETUGAS BENGKEL',
                'gaji' => 95000
            ],
            [
                'nama' => 'PETUGAS RETRIBUSI/KOLEKTOR',
                'gaji' => 70000
            ],
            [
                'nama' => 'PETUGAS TPA',
                'gaji' => 95000
            ],
            [
                'nama' => 'SOPIR ANGKUTAN SAMPAH',
                'gaji' => 120000
            ],
            [
                'nama' => 'SOPIR MOBIL LAVATORI',
                'gaji' => 95000
            ],
            [
                'nama' => 'SOPIR MOBIL TANGKI',
                'gaji' => 95000
            ],
            [
                'nama' => 'SOPIR MOBIL TINJA',
                'gaji' => 120000
            ],
            [
                'nama' => 'SOPIR MOTOR SAMPAH',
                'gaji' => 120000
            ],
        ];

        foreach ($jabatans as $jabatan) {
            Jabatan::create($jabatan);
        }
    }
}
