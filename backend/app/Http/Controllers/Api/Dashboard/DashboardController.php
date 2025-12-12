<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $pegawai = Pegawai::count();
            $masukKerja = Kehadiran::where('check_type', 0)->whereDate('check_time', now())->count();
            $pulangKerja = Kehadiran::where('check_type', 1)->whereDate('check_time', now())->count();

            return response()->json([
                'jumlah_pegawai' => $pegawai,
                'masuk_kerja'    => $masukKerja,
                'pulang_kerja'   => $pulangKerja
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.'
            ]);
        }
    }
}
