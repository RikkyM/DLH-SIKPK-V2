<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        try {

            $role = in_array(Auth::user()->role, ['superadmin', 'admin', 'keuangan', 'viewer'], true);

            $pegawai = Pegawai::where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', '%admin%')
                    ->where('id_department', '!=', 23);
            })->when(!$role, function ($data) {
                $data->where('id_department', Auth::user()->id_department);
            })
                ->count();
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
