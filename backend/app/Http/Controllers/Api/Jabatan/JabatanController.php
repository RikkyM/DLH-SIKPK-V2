<?php

namespace App\Http\Controllers\Api\Jabatan;

use App\Http\Controllers\Controller;
use App\Http\Requests\PenugasanRequest;
use App\Models\Jabatan;
use App\Models\PegawaiAsn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class JabatanController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $datas = Jabatan::when($search, function ($data) use ($search) {
                $data->where('nama', 'like', "%{$search}%");
            })
                ->paginate($perPage);

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data jabatan.'
            ]);
        }
    }

    public function store(PenugasanRequest $request)
    {
        $payload = $request->validated();
        $pegawaiAsn = function ($id) {
            return PegawaiAsn::find($id)?->nama;
        };

        DB::beginTransaction();
        try {
            Jabatan::create([
                'kpa_id' => $payload['kpa_id'],
                'bp_id' => $payload['bp_id'],
                'bpp_id' => $payload['bpp_id'],
                'pptk_id' => $payload['pptk_id'],
                'kasubbag_id' => $payload['kasubbag_id'],
                'nama' => $payload['nama'],
                'gaji' => $payload['gaji'],
                'no_rekening' => $payload['no_rekening'],
                'kpa' => $pegawaiAsn($payload['kpa_id']),
                'bp' => $pegawaiAsn($payload['bp_id']),
                'bpp' => $pegawaiAsn($payload['bpp_id']),
                'pptk' => $pegawaiAsn($payload['pptk_id']),
                'kasubbag_keuangan' => $pegawaiAsn($payload['kasubbag_id']),
                'is_holiday' => $payload['is_holiday']
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Berhasil menambahkan data penugasan.',
                'payload' => $payload
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Gagal menambah data penugasan.',
                $e->getMessage()
            ], 400);
        }
    }

    public function update(PenugasanRequest $request, $id)
    {
        $jabatan = Jabatan::findOrFail($id);
        $pegawaiAsn = function ($id) {
            return PegawaiAsn::find($id)?->nama;
        };

        $payload = $request->validated();

        DB::beginTransaction();
        try {
            $jabatan->update([
                'kpa_id' => $payload['kpa_id'],
                'bp_id' => $payload['bp_id'],
                'bpp_id' => $payload['bpp_id'],
                'pptk_id' => $payload['pptk_id'],
                'kasubbag_id' => $payload['kasubbag_id'],
                'nama' => $payload['nama'],
                'gaji' => $payload['gaji'],
                'no_rekening' => $payload['no_rekening'] ?: null,
                'kpa' => $payload['kpa_id'] ? $pegawaiAsn($payload['kpa_id']) : null,
                'bp' => $payload['bp_id'] ? $pegawaiAsn($payload['bp_id']) : null,
                'bpp' => $payload['bpp_id'] ? $pegawaiAsn($payload['bpp_id']) : null,
                'pptk' => $payload['pptk_id'] ? $pegawaiAsn($payload['pptk_id']) : null,
                'kasubbag_keuangan' => $payload['kasubbag_id'] ? $pegawaiAsn($payload['kasubbag_id']) : null,
                'is_holiday' => $payload['is_holiday'] ?? false,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Berhasil mengubah data jabatan.",
                'jabatan' => $jabatan
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);

            return response()->json([
                'message' => "Terjadi kesalahan pada server. Silakan coba lagi."
            ]);
        }
    }

    public function penugasan(Request $request)
    {
        try {
            $penugasan = Jabatan::with(['pegawais' => function ($q) {
                if (Auth::user() === 'operator') {
                    $q->where('id_department', Auth::user()->id_department);
                }
            }])
                ->when(Auth::user()->role === 'operator', function ($q) {
                    $q->whereHas('pegawais', function ($qq) {
                        $qq->where('id_department', Auth::user()->id_department);
                    });
                })
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $penugasan
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendapatkan data penugasan.'
            ]);
        }
    }
}
