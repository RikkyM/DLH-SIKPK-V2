<?php

namespace App\Http\Controllers\Import;

use App\Http\Controllers\Controller;
use App\Imports\Kendaraan\ImportKendaraan;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    public function importKendaraan()
    {
        return view('import.import-kendaraan');
    }

    public function importKendaraanProcess(Request $request)
    {
        $request->file('file');

        Excel::import(new ImportKendaraan, $request->file('file'));

        return back();
    }
}
