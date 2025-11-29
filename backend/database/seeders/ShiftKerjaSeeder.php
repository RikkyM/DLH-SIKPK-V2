<?php

namespace Database\Seeders;

use App\Models\ShiftKerja;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShiftKerjaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shifts = [
            [
                'jadwal' => 'Kategori 1',
                'jam_masuk' => '07:30:00',
                'jam_keluar' => '16:00:00'
            ],
            [
                'jadwal' => 'Kategori 2',
                'jam_masuk' => '06:00:00',
                'jam_keluar' => '16:00:00'
            ],
            [
                'jadwal' => 'Kategori 3',
                'jam_masuk' => '16:00:00',
                'jam_keluar' => '23:00:00'
            ],
            [
                'jadwal' => 'Kategori 4',
                'jam_masuk' => '00:30:00',
                'jam_keluar' => '06:00:00'
            ],
            [
                'jadwal' => 'Kategori 5',
                'jam_masuk' => '08:00:00',
                'jam_keluar' => '15:00:00'
            ],
            [
                'jadwal' => 'Kategori 6',
                'jam_masuk' => '06:00:00',
                'jam_keluar' => '16:00:00'
            ],
        ];

        foreach ($shifts as $shift) {
            ShiftKerja::create($shift);
        }
    }
}
