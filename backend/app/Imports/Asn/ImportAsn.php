<?php

namespace App\Imports\Asn;

use App\Models\PegawaiAsn;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportAsn implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        $payload = [];

        foreach ($rows as $row) {
            $row = $row->forget(['no', 7, 8, 9, 10, 11, 12, 13]);

            $isValid = $row->filter(function ($value, $key) {

                if (in_array($key, ['gol', 'unit_kerja'])) {
                    return true;
                }

                return !empty($value) && $value !== null;
            })->count() >= ($row->count() - 2);

            if ($isValid) {
                PegawaiAsn::create([
                    'nip'           => $row['nip_ni_pppk'],
                    'nama'          => $row['nama'],
                    'pangkat'       => $row['pangkat'],
                    'golongan'      => $row['gol'],
                    'jabatan'       => $row['jabatan'],
                    'unit_kerja'    => $row['unit_kerja']
                ]);
            }
        }
    }
}
