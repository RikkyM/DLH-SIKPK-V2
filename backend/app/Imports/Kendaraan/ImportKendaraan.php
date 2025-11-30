<?php

namespace App\Imports\Kendaraan;

use App\Models\Departments;
use App\Models\JenisKendaraan;
use App\Models\Kendaraan;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportKendaraan implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $row = $row->forget([11, 12]);

            $jenis = JenisKendaraan::where('nama', $row['jenis'])->first();

            $department = Departments::where('DeptName', $row['departement'])->first();

            if ($row->filter()->isEmpty()) {
                continue;
            }

            Kendaraan::create([
                'no_tnkb' => $row['notnkb'],
                'id_jenis_kendaraan' => $jenis->id,
                'id_department' => $department->DeptID,
                'merk' => $row['merek'],
                'lambung' => $row['lambung'],
                'no_rangka' => $row['norangka'],
                'no_mesin' => $row['nomesin'],
                'tahun_pembuatan' => $row['tahunpembuatan'],
                'kondisi' => $row['kondisi'],
                'keterangan' => null
            ]);
        }
    }
}
