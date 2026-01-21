<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use App\Models\Jabatan;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use App\Models\ShiftKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $today      = now()->toDateString();
            $timeNow    = now()->format('H:i:s');

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

            $masukKerja = Kehadiran::with('pegawai')
                ->when(Auth::user()->role === 'operator', function ($data) {
                    $data->whereHas('pegawai', fn($d) => $d->where('id_department', Auth::user()->id_department));
                })
                ->where('check_type', 0)
                ->whereDate('check_time', now())
                ->count();
            $pulangKerja = Kehadiran::with('pegawai')
                ->when(Auth::user()->role === 'operator', function ($data) {
                    $data->whereHas('pegawai', fn($d) => $d->where('id_department', Auth::user()->id_department));
                })
                ->where('check_type', 1)
                ->whereDate('check_time', now())
                ->count();

            $checkJam = Pegawai::when(Auth::user()->role === 'operator', function ($data) {
                $data->where('id_department', Auth::user()->id_department);
            })
                ->whereHas('shift', function ($q) use ($timeNow) {
                    $q->where(function ($shift) use ($timeNow) {
                        // Shift normal
                        $shift->whereTime('jam_masuk', '<', 'jam_keluar')
                            ->whereTime('jam_keluar', '<', $timeNow);
                    })->orWhere(function ($shift) use ($timeNow) {
                        // Shift malam
                        $shift->whereTime('jam_masuk', '>', 'jam_keluar')
                            ->whereTime('jam_keluar', '<', $timeNow);
                    });
                });

            $tidakFingerMasuk = (clone $checkJam)
                ->whereDoesntHave('kehadirans', function ($q) use ($today) {
                    $q->where('check_type', 0)
                        ->whereDate('check_time', $today);
                })
                ->whereHas('kehadirans', function ($q) use ($today) {
                    $q->where('check_type', 1)
                        ->whereDate('check_time', $today);
                })
                ->count();

            $tidakFingerPulang = (clone $checkJam)
                ->whereDoesntHave('kehadirans', function ($q) use ($today) {
                    $q->where('check_type', 1)
                        ->whereDate('check_time', $today);
                })
                ->whereHas('kehadirans', function ($q) use ($today) {
                    $q->where('check_type', 0)
                        ->whereDate('check_time', $today);
                })
                ->count();

            //table crosstab
            $departments = Departments::with(['pegawai.jabatan'])
                ->where(function ($q) {
                    $q->where('DeptName', 'not like', '%non aktif%')
                        ->where('DeptName', 'not like', "%our company%");
                })
                ->orderBy('DeptName')->get();

            // dd($departments);

            $penugasanTypes = Jabatan::select('jabatan.nama')
                ->leftJoin('pegawai', 'pegawai.id_penugasan', '=', 'jabatan.id')
                ->selectRaw('COUNT(pegawai.id) as pegawais_count')
                ->groupBy('jabatan.nama')
                ->orderByDesc('pegawais_count')
                ->get();

            // dd($penugasanTypes);

            // data selain role uptd
            $dataTable = $departments->map(function ($department) use ($penugasanTypes) {
                $departmentData = [
                    'id' => $department->DeptID,
                    'nama' => $department->DeptName,
                ];

                $total = 0;

                foreach ($penugasanTypes as $jenisPenugasan) {
                    $jenis = $jenisPenugasan->nama;

                    $count = $department->pegawai()
                        ->whereHas('jabatan', fn($q) => $q->where('nama', $jenis))
                        ->count();

                    $key = strtolower(str_replace(' ', '_', $jenis));
                    $departmentData[$key] = $count;

                    $total += $count;
                }

                $departmentData['total'] = $total;

                return $departmentData;
            })->values();

            return response()->json([
                'jumlah_pegawai' => $pegawai,
                'masuk_kerja'    => $masukKerja,
                'pulang_kerja'   => $pulangKerja,
                'tidakFingerMasuk' => $tidakFingerMasuk,
                'tidakFingerPulang' => $tidakFingerPulang,
                'data_table' => $dataTable,
                'headers' => $penugasanTypes->pluck('nama')
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
