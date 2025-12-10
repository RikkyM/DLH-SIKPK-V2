<?php

namespace App\Http\Controllers\Api\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 10);
            $search     = $request->input('search');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');

            $startDate  = $request->input('from_date');
            $endDate    = $request->input('to_date');

            $datas = Pegawai::with([
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'kehadirans' => fn($q) => $q->whereBetween('check_time', [$startDate, $endDate]),
                'shift',
                'jabatan'
            ])
                // ->select('id', 'old_id', 'id_penugasan', 'id_shift', 'id_department', 'badgenumber', 'nama', 'jenis_kelamin', 'alamat', 'kecamatan', 'kelurahan', 'agama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%');
                })
                ->when(empty($department) || (int) $department !== 23, function ($data) {
                    $data->where('id_department', '!=', 23);
                })
                ->when(!empty($department), function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->where('id_penugasan', $jabatan);
                })
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->where('id_shift', $shift);
                })
                ->when($search, function ($data) use ($search) {
                    $data->where(function ($d) use ($search) {
                        $d->where('nama', 'like', "%{$search}%")
                            ->orWhere('badgenumber', 'like', "%{$search}%");
                    });
                })
                ->orderBy('nama', 'asc');

            if ((int) $perPage == -1) {
                return response()->json([
                    'success' => true,
                    'data' => $datas->get()
                ]);
            }

            return response()->json($datas->paginate($perPage));
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Gagal mengambil data pegawai'
            ]);
        }
    }

    public function updatePegawai(Request $request, $id)
    {
        $validated = $request->validate([
            'id_department'     => ['required', 'integer', 'exists:mysql_iclock.departments,DeptID'],
            'id_penugasan'      => ['required', 'integer', 'exists:jabatan,id'],
            'id_shift'          => ['required', 'integer', 'exists:shift_kerja,id'],
            'id_korlap'         => ['nullable'],
            'badgenumber'       => ['required', 'digits:16'],
            'nama'              => ['required', 'string', 'max:255'],
            'tempat_lahir'      => ['nullable', 'string', 'max:255'],
            'tanggal_lahir'     => ['nullable', 'date'],
            'jenis_kelamin'     => ['nullable', Rule::in(['laki-laki', 'perempuan'])],
            'gol_darah'         => ['nullable'],
            'alamat'            => ['nullable', 'string', 'max:255'],
            'rt'                => ['nullable', 'string'],
            'rw'                => ['nullable', 'string'],
            'kelurahan'         => ['nullable', 'string', 'max:255'],
            'kecamatan'         => ['nullable', 'string', 'max:255'],
            'kota'              => ['nullable', 'string'],
            'agama'             => ['nullable', 'string', 'max:255'],
            'status_perkawinan' => ['nullable', 'string', 'max:255'],
            'upload_ktp'        => ['nullable'],
            'upload_kk'         => ['nullable'],
            'upload_pas_foto'   => ['nullable'],
            'foto_lapangan'     => ['nullable'],
            'rute_kerja'        => ['nullable']
        ], [
            'id_department.required' => 'Unit kerja wajib dipilih.',
            'id_penugasan.required'  => 'Penugasan wajib dipilih.',
            'id_shift.required'      => 'Kategori Kerja wajib dipilih.',
            'badgenumber.required'   => 'NIK wajib diisi.',
            'badgenumber.digits'     => 'NIK harus terdiri dari 16 digit angka.',
            'nama.required'          => 'Nama wajib diisi.',
            'alamat.max'             => 'Alamat maksimal 255 karakter.'
        ]);

        DB::beginTransaction();
        try {
            $pegawai = Pegawai::findOrFail($id);

            $pegawai->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pegawai berhasil diupdate.',
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server'
            ]);
        }
    }

    public function gaji(Request $request)
    {
        try {
            $search = $request->input('search');
            $perPage = $request->input('per_page', 50);
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');

            $jumlah_hari = 0;

            if ($fromDate && $toDate) {
                $jumlah_hari = Carbon::parse($fromDate)
                    ->diffInDays(Carbon::parse($toDate)) + 1;
            }

            $pegawai = Pegawai::with([
                'kehadirans' => fn($q) => $q->whereBetween('check_time', [$fromDate, $toDate],),
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'jabatan'
            ])
                ->select('id', 'old_id', 'id_department', 'id_penugasan', 'badgenumber', 'nama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%')
                        ->where('id_department', '!=', 23);
                })
                ->when($search, function ($data) use ($search) {
                    $data->where('badgenumber', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%");
                })
                ->when(empty($department) || (int) $department !== 23, function ($data) {
                    $data->where('id_department', '!=', 23);
                })
                ->when(!empty($department), function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->where('id_penugasan', $jabatan);
                })
                ->orderBy('nama')
                ->paginate($perPage);

            $pegawai->getCollection()->transform(function ($data) use ($jumlah_hari) {
                return [
                    'id'            => $data->id,
                    'badgenumber'   => $data->badgenumber,
                    'nama'          => $data->nama,
                    'department'    => $data->department?->DeptName ?: "-",
                    'jabatan'       => $data->jabatan?->nama,
                    'jumlah_hari'   => $jumlah_hari,
                    'jumlah_masuk'  => $data->kehadirans->count() / 2
                ];
            });

            return response()->json($pegawai);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data gaji',
                'e' => $e
            ]);
        }
    }
}
