<?php

namespace App\Http\Controllers\Export;

use App\Exports\Kehadiran\FingerExport;
use App\Exports\Kehadiran\KehadiranExport;
use App\Exports\Kehadiran\KehadiranPerTanggalExport;
use App\Exports\Kehadiran\RekapTanggalHadirExport;
use App\Exports\Pegawai\PegawaiExport;
use App\Http\Controllers\Controller;
use App\Models\Departments;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    protected function fileName($prefix = '')
    {
        $user = Auth::user();
        $deptSlug = null;

        if ($user->role === 'operator') {
            $deptName = optional(Departments::find($user->id_department))->DeptName;

            $deptSlug = $deptName ? Str::slug($deptName, '-') : null;
        }

        $date = now()->format('d-m-Y');

        return $deptSlug
            ? "{$prefix}-{$deptSlug}-{$date}.xlsx"
            : "{$prefix}-{$date}.xlsx";
    }

    public function pegawaiExport(Request $request)
    {
        return Excel::download(new PegawaiExport($request), $this->fileName('petugas'));
    }

    public function fingerExport(Request $request)
    {
        return Excel::download(new FingerExport($request), $this->filename('log-kehadiran'));
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

        return Excel::download(new KehadiranExport($request), $this->filename('kehadiran'));
    }

    public function kehadiranPerTanggalExport(Request $request)
    {
        return Excel::download(new KehadiranPerTanggalExport($request), $this->filename('kehadiran-per-tanggal'));
    }

    public function rekapTanggalHadirExport(Request $request)
    {
        return Excel::download(new RekapTanggalHadirExport($request), $this->filename('rekap-tanggal-hadir'));
    }
}
