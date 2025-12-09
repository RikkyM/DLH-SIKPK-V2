<?php

namespace App\Http\Controllers\Export;

use App\Exports\Kehadiran\KehadiranExport;
use App\Exports\Kehadiran\KehadiranPerTanggalExport;
use App\Exports\Pegawai\PegawaiExport;
use App\Http\Controllers\Controller;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function pegawaiExport(Request $request)
    {
        $fileName = 'Pegawai-' . now()->format('d-m-Y') . '.xlsx';
        return Excel::download(new PegawaiExport($request), $fileName);
    }

    public function kehadiranExport(Request $request, $name)
    {
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $exists = Kehadiran::with('pegawai')
            ->when($fromDate && $toDate, function ($data) use ($fromDate, $toDate) {
                $data->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate   . ' 23:59:59',
                ]);
            })->exists();

        if (! $exists) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data kehadiran untuk filter yang dipilih'
            ], 422);
        }

        $filename = $name . '-' . now()->format('d-m-Y') . '.xlsx';

        return Excel::download(new KehadiranExport($request), $filename);
    }

    public function kehadiranPerTanggalExport(Request $request)
    {
        $filename = 'Kehadiran-' . now()->format('d-m-Y') . '.xlsx';
        return Excel::download(new KehadiranPerTanggalExport($request), $filename);
    }
}
