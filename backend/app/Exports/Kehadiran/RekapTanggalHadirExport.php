<?php

namespace App\Exports\Kehadiran;

use Maatwebsite\Excel\Concerns\FromCollection;

class RekapTanggalHadirExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        dd('asd');
    }
}
