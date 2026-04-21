<?php

namespace App\Http\Controllers\Api\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;
use App\Models\Kehadiran;
use App\Models\Kelurahan;
use App\Models\Pegawai;
use App\Services\KehadiranService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PegawaiController extends Controller
{
    protected KehadiranService $kehadiranService;

    public function __construct(KehadiranService $kehadiranService)
    {
        $this->kehadiranService = $kehadiranService;
    }

    private function hitungPotongan($data, $jumlah_hari)
    {
        $kehadiran = $data->kehadirans;
        $gaji = optional($data->jabatan)->gaji ?? 0;

        $toMenit = function ($jam) {
            if (!$jam) return null;
            [$h, $m] = explode(':', substr($jam, 0, 5));
            return ((int) $h * 60) + (int) $m;
        };

        $formatJam = function ($jam) {
            return $jam ? substr($jam, 11, 5) : null;
        };

        $decodeRules = function ($rules) {
            if (is_array($rules)) return $rules;
            return json_decode($rules ?? '[]', true) ?? [];
        };

        $telatRules = collect($decodeRules($data->shift->telat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()->values()->toArray();

        $pulcetRules = collect($decodeRules($data->shift->pulang_cepat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()->values()->toArray();

        // $menitShiftMasuk  = $toMenit($data->shift->jam_masuk ?? null);
        $menitShiftPulang = $toMenit($data->shift->jam_keluar ?? null);

        $perTanggal = $kehadiran->groupBy(function ($item) {
            return Carbon::parse($item->check_time)->toDateString();
        });

        $totalPotonganNominal = 0;
        $jumlahMasuk = 0;

        foreach ($perTanggal as $records) {
            $jamMasukRaw  = $records->where('check_type', 0)->min('check_time');
            $jamPulangRaw = $records->where('check_type', 1)->max('check_time');

            $menitMasuk  = $toMenit($formatJam($jamMasukRaw));
            $menitPulang = $toMenit($formatJam($jamPulangRaw));

            $tidakHadir = !$jamMasukRaw && !$jamPulangRaw;

            $potonganTelat = 0;
            if ($menitMasuk !== null && !empty($telatRules)) {
                $total = count($telatRules);
                foreach ($telatRules as $index => $batas) {
                    if ($menitMasuk > $batas) {
                        $potonganTelat = (($index + 1) / $total) * 50;
                    }
                }
            }

            $potonganPulcet = 0;
            if ($menitPulang !== null && $menitShiftPulang !== null && !empty($pulcetRules)) {
                if ($menitPulang < $menitShiftPulang) {
                    $total = count($pulcetRules);
                    foreach ($pulcetRules as $index => $batas) {
                        if ($menitPulang < $batas) {
                            $potonganPulcet = (($total - $index) / $total) * 50;
                            break;
                        }
                    }
                    if ($potonganPulcet === 0) {
                        $potonganPulcet = (int) round((1 / $total) * 50);
                    }
                }
            }

            if ($tidakHadir) {
                $persen = 100;
            } elseif (!$jamMasukRaw || !$jamPulangRaw) {
                $persen = 50;
            } else {
                $persen = max($potonganTelat, $potonganPulcet);
            }

            $totalPotonganNominal += ($persen / 100) * $gaji;

            if ($jamMasukRaw && $jamPulangRaw) {
                $jumlahMasuk++;
            } else if ($jamMasukRaw || $jamPulangRaw) {
                $jumlahMasuk += 0.5;
            }
        }

        $hariTanpaRecord = $jumlah_hari - $perTanggal->count();
        $totalPotonganNominal += $hariTanpaRecord * $gaji;

        $upahBersih = max(0, ($gaji * $jumlah_hari) - $totalPotonganNominal);

        return [
            // 'id'                => $data->id,
            // 'badgenumber'       => $data->badgenumber,
            // 'nama'              => $data->nama,
            // 'department'        => $data->department?->DeptName ?: "-",
            // 'jabatan'           => $data->jabatan?->nama,
            'gaji'              => $gaji,
            // 'jumlah_hari'       => $jumlah_hari,
            'jumlah_masuk'      => $jumlahMasuk,
            'potongan'          => round($totalPotonganNominal, 0),
            // 'upah_bersih'       => round($upahBersih, 0),
            'upah_kotor'        => round($gaji * $jumlah_hari, 0),
            'upah_bersih'       => round($upahBersih, 0),
        ];
    }

    public function searchKehadiranPetugas(Request $request)
    {
        $search = $request->query('search');

        $petugas = Pegawai::where(function ($data) {
            $data->where('nama', '!=', '')
                ->whereNotNull('nama')
                ->where('nama', 'not like', '%admin%')
                ->where('nama', 'not like', '%adm');
        })
            ->when(Auth::user()->role === 'operator', function ($data) {
                $data->where('id_department', Auth::user()->id_department);;
            })
            ->when($search, function ($query, $search) {
                return $query->whereLike('nama', "%{$search}%");
            })->get();

        return response()->json($petugas);
    }

    public function getDataKehadiranPetugas(Request $request)
    {
        $pegawai = $request->get('pegawai');
        $tipe    = $request->get('tipe');
        $tanggal = $request->get('tanggal');

        $kehadiran = Kehadiran::with(['pegawai', 'pegawai.jabatan', 'pegawai.department'])
            ->where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', "%admin%")
                    ->where('nama', 'not like', '%adm');
            })
            ->when($pegawai && $tanggal && $tipe !== null, function ($item) use ($pegawai, $tipe, $tanggal) {
                $item->where('pegawai_id', $pegawai)
                    ->where('check_type', $tipe)
                    // ->whereDate('check_time', $tanggal);
                    ->whereBetween('check_time', [
                        $tanggal . ' 00:00:00',
                        $tanggal . ' 23:59:59'
                    ]);
            })
            ->first();

        return response()->json($kehadiran);
        // return response()->json('asd');
    }

    public function searchKehadiranPetugasDetail(Request $request, $id)
    {

        $petugas = Pegawai::with('department', 'jabatan')->where(function ($data) {
            $data->where('nama', '!=', '')
                ->whereNotNull('nama')
                ->where('nama', 'not like', '%admin%')
                ->where('nama', 'not like', '%adm');
        })->where('old_id', $id)->first();

        return response()->json($petugas);
    }

    public function index(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 10);
            $search     = $request->input('search');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');
            $korlap      = $request->input('korlap');

            $startDate  = $request->input('from_date');
            $endDate    = $request->input('to_date');

            $checkRole = ['superadmin', 'admin', 'keuangan', 'viewer'];
            $canSeeAll = in_array(Auth::user()->role, $checkRole, true);

            $datas = Pegawai::with([
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'kehadirans' => fn($q) => $q->whereBetween('check_time', [$startDate, $endDate]),
                'shift',
                'jabatan',
                'korlap'
            ])
                // ->select('id', 'old_id', 'id_penugasan', 'id_shift', 'id_department', 'badgenumber', 'nama', 'jenis_kelamin', 'alamat', 'kecamatan', 'kelurahan', 'agama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%')
                        ->where('nama', 'not like', '%adm');
                })
                ->when(empty($department) || (int) $department !== 23, function ($data) {
                    $data->where('id_department', '!=', 23);
                })
                ->when(!$canSeeAll, function ($data) {
                    $data->where('id_department', Auth::user()->id_department);
                })
                ->when(!empty($department) && $canSeeAll, function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->where('id_penugasan', $jabatan);
                })
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->where('id_shift', $shift);
                })
                ->when(!empty($korlap), function ($data) use ($korlap) {
                    $data->where('id_korlap', $korlap);
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
        // dd($request->all());
        // return response()->json($request->all());
        $validated = $request->validate([
            'id_department'     => ['nullable'],
            // 'id_department'     => ['required', 'integer', 'exists:mysql_iclock.departments,DeptID'],
            'id_penugasan'      => ['nullable'],
            // 'id_penugasan'      => ['required', 'integer', 'exists:jabatan,id'],
            'id_shift'          => ['nullable',],
            // 'id_shift'          => ['required', 'integer', 'exists:shift_kerja,id'],
            'id_korlap'         => ['nullable'],
            // 'id_korlap'         => ['required', 'exists:pegawai_asn,id'],
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
            'upload_ktp'        => ['nullable', 'image',  'mimes:jpg,jpeg,png', 'max:250'],
            'upload_kk'         => ['nullable', 'file',  'mimes:pdf', 'max:250'],
            'upload_pas_foto'   => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:250'],
            'foto_lapangan'     => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:250'],
            'rute_kerja'        => ['nullable'],
            'no_rekening'       => ['nullable', 'numeric']
        ], [
            // 'id_department.required' => 'Unit kerja wajib dipilih.',
            // 'id_penugasan.required'  => 'Penugasan wajib dipilih.',
            // 'id_shift.required'      => 'Kategori Kerja wajib dipilih.',
            '*.required'   => ':attribute wajib diisi.',
            '*.digits'     => ':attribute harus terdiri dari 16 digit angka.',
            '*.required'   => ':attribute wajib diisi.',
            '*.max'        => ':attribute maksimal 255 karakter.'
        ]);

        $fotoField = ['upload_ktp', 'upload_kk', 'upload_pas_foto', 'foto_lapangan'];

        DB::beginTransaction();
        try {
            $pegawai = Pegawai::findOrFail($id);

            foreach ($fotoField as $field) {
                if ($request->hasFile($field)) {
                    $file = $request->file($field);
                    $ext = $file->getClientOriginalExtension();

                    if ($field === 'foto_lapangan') {
                        $fileName = "foto_lapangan_{$validated['nama']}.{$ext}";
                    } else {
                        $baseName = str_replace('upload_', '', $field);
                        $fileName = "{$baseName}_{$validated['nama']}.{$ext}";
                    }

                    if (!empty($pegawai->$field)) {
                        Storage::disk('local')->delete($pegawai->$field);
                    }

                    $path = $file->storeAs(
                        "pegawai/{$field}",
                        $fileName,
                        'local'
                    );

                    $validated[$field] = $path;
                }
            }

            if (!empty($validated['kecamatan'])) {
                $kecamatan = Kecamatan::where('kodeKecamatan', $validated['kecamatan'])->first();
                if ($kecamatan) {
                    $validated['kecamatan'] = Str::title(strtolower($kecamatan->namaKecamatan));
                }
            }

            if (!empty($validated['kelurahan'])) {
                $kelurahan = Kelurahan::where('kodeKelurahan', $validated['kelurahan'])->first();
                if ($kelurahan) {
                    $validated['kelurahan'] = Str::title(strtolower($kelurahan->namaKelurahan));
                }
            }

            $validated['no_rekening'] = !empty($validated['no_rekening'])
                ? $validated['no_rekening']
                : null;

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
                'message' => 'Terjadi kesalahan pada server',
                'asd' => $e->getMessage()
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
            $shift    = $request->input('shift');
            $korlap    = $request->input('korlap');

            $jumlah_hari = 0;

            if ($fromDate && $toDate) {
                $jumlah_hari = Carbon::parse($fromDate)
                    ->diffInDays(Carbon::parse($toDate)) + 1;
            }

            $baseQuery = Pegawai::with([
                'kehadirans' => fn($q) => $q->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate   . ' 23:59:59',
                ]),
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'jabatan',
                'shift'
            ])
                ->select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'badgenumber', 'no_rekening', 'nama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%')
                        ->where('nama', 'not like', '%adm')
                        ->where('id_department', '!=', 23);
                })
                ->when(Auth::user()->role === 'operator', function ($data) {
                    $data->where('id_department', Auth::user()->id_department);
                })
                ->when($search, function ($data) use ($search) {
                    $data->where(function ($q) use ($search) {
                        $q->where('badgenumber', 'like', "{$search}%")
                            ->orWhere('nama', 'like', "{$search}%");
                    });
                })
                ->when(empty($department) || (int) $department !== 23, function ($data) {
                    $data->where('id_department', '!=', 23);
                })
                ->when(!empty($department), function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->where('id_shift', $shift);
                })
                ->when(!empty($korlap), function ($data) use ($korlap) {
                    $data->where('id_korlap', $korlap);
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->where('id_penugasan', $jabatan);
                });
            // ->orderBy('nama')
            // ->paginate($perPage);

            $pegawai =
                $baseQuery->orderBy('nama')
                ->paginate($perPage);

            $pegawai->getCollection()->transform(function ($data) use ($jumlah_hari) {
                $kehadiran = $data->kehadirans
                    ->groupBy(function ($item) {
                        $tanggal = Carbon::parse($item->check_time)->toDateString();
                        return $tanggal . "_" . $item->check_type;
                    })
                    ->count() / 2;
                return [
                    'id'            => $data->id,
                    'badgenumber'   => $data->badgenumber,
                    'no_rekening'   => $data->no_rekening,
                    'nama'          => $data->nama,
                    'department'    => $data->department?->DeptName ?: "-",
                    'jabatan'       => $data->jabatan?->nama,
                    'gaji'          => $data->jabatan?->gaji ?: 0,
                    'jumlah_hari'   => $jumlah_hari,
                    'jumlah_masuk'  => $kehadiran
                ];
            });

            $totalQuery = Pegawai::with([
                'kehadirans' => fn($q) => $q->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate   . ' 23:59:59',
                ]),
                'jabatan',
                'shift'
            ])
                ->select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'badgenumber', 'no_rekening', 'nama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%')
                        ->where('nama', 'not like', '%adm')
                        ->where('id_department', '!=', 23);
                })
                ->when(
                    Auth::user()->role === 'operator',
                    fn($q) =>
                    $q->where('id_department', Auth::user()->id_department)
                )
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($qq) use ($search) {
                        $qq->where('badgenumber', 'like', "{$search}%")
                            ->orWhere('nama', 'like', "{$search}%");
                    });
                })
                ->when(
                    empty($department) || (int) $department !== 23,
                    fn($q) =>
                    $q->where('id_department', '!=', 23)
                )
                ->when(
                    !empty($department),
                    fn($q) =>
                    $q->where('id_department', $department)
                )
                ->when(
                    !empty($shift),
                    fn($q) =>
                    $q->where('id_shift', $shift)
                )
                ->when(
                    !empty($korlap),
                    fn($q) =>
                    $q->where('id_korlap', $korlap)
                )
                ->when(
                    !empty($jabatan),
                    fn($q) =>
                    $q->where('id_penugasan', $jabatan)
                )
                ->get()
                ->map(function ($query) use ($jumlah_hari) {
                    $gaji = $query->jabatan?->gaji ?: 0;

                    $jumlah_masuk = $query->kehadirans
                        ->groupBy(function ($item) {
                            $tanggal = Carbon::parse($item->check_time)->toDateString();
                            return $tanggal . "_" . $item->check_type;
                        })
                        ->count() / 2;

                    return [
                        'jumlah_masuk' => $jumlah_masuk,
                        'total_gaji_harian' => $gaji * $jumlah_hari,
                        'total_upah'  => $gaji * $jumlah_masuk
                    ];
                });

            return response()->json([
                ...$pegawai->toArray(),
                'total_gaji_harian' => $totalQuery->sum('total_gaji_harian'),
                'total_upah' => $totalQuery->sum('total_upah'),
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data gaji',
                'e' => $e
            ]);
        }
    }

    public function getGajiPetugas(Request $request)
    {
        $badgenumber = $request->get('badgenumber');
        $fromDate    = $request->get('from_date');
        $toDate      = $request->get('to_date');

        $petugas = Kehadiran::with(['pegawai.department', 'pegawai.jabatan', 'pegawai.shift'])
            ->kehadiranHarian()
            ->when($badgenumber, function ($q) use ($badgenumber) {
                $q->whereHas('pegawai', fn($q) => $q->where('badgenumber', $badgenumber));
            })
            ->when($fromDate && $toDate, function ($q) use ($fromDate, $toDate) {
                $q->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate . ' 23:59:59',
                ]);
            })
            ->orderBy('tanggal')
            ->get();

        // dd($petugas);

        $petugas = $petugas->map(function ($item) {

            $jamMasuk  = $item->jam_masuk;
            $jamPulang = $item->jam_pulang;

            $shiftMasuk  = $item->pegawai->shift->jam_masuk ?? null;
            $shiftPulang = $item->pegawai->shift->jam_keluar ?? null;

            $toMenit = function ($jam) {
                if (!$jam) return null;
                [$h, $m] = explode(':', substr($jam, 0, 5));
                return ((int) $h * 60) + (int) $m;
            };

            $formatJam = function ($menit) {
                if ($menit === null || $menit <= 0) return null;
                return sprintf('%02d:%02d', floor($menit / 60), $menit % 60);
            };

            $decodeRules = function ($rules) {
                if (is_array($rules)) return $rules;
                return json_decode($rules ?? '[]', true) ?? [];
            };

            $menitMasuk       = $toMenit($jamMasuk);
            $menitPulang      = $toMenit($jamPulang);
            $menitShiftMasuk  = $toMenit($shiftMasuk);
            $menitShiftPulang = $toMenit($shiftPulang);

            // Rules tetap jam clock absolut, sort ascending
            $telatRules = collect($decodeRules($item->pegawai->shift->telat ?? []))
                ->map(fn($r) => $toMenit($r))
                ->sort()
                ->values()
                ->toArray();

            $pulcetRules = collect($decodeRules($item->pegawai->shift->pulang_cepat ?? []))
                ->map(fn($r) => $toMenit($r))
                ->sort()
                ->values()
                ->toArray();

            // Hitung telat & pulang cepat untuk ditampilkan
            $telat = 0;
            if ($menitMasuk !== null && $menitShiftMasuk !== null) {
                $telat = max(0, $menitMasuk - $menitShiftMasuk);
            }

            $pulangCepat = 0;
            if ($menitPulang !== null && $menitShiftPulang !== null) {
                $pulangCepat = max(0, $menitShiftPulang - $menitPulang);
            }

            // Potongan telat: bandingkan jam masuk absolut vs rules jam clock
            // rules[0] = batas toleransi pertama (25%), rules[1] = batas kedua (50%)
            $getPotonganTelat = function ($menitMasuk, $rules) {
                if ($menitMasuk === null || empty($rules)) return 0;

                $total    = count($rules);
                $potongan = 0;

                foreach ($rules as $index => $batas) {
                    if ($menitMasuk > $batas) {
                        // index 0 dari 1 elemen = 50%
                        // index 0 dari 2 elemen = 25%, index 1 = 50%
                        $potongan = (int) round((($index + 1) / $total) * 50);
                    }
                }

                return $potongan;
            };

            // Pulang cepat: bandingkan jam pulang absolut vs rules ascending (dari terkecil)
            // rules[0]=batas terkecil(50%), rules[n-1]=batas terbesar(potongan terkecil)
            $getPotonganPulangCepat = function ($menitPulang, $menitShiftPulang, $rules) {
                if ($menitPulang === null || empty($rules)) return 0;
                if ($menitPulang >= $menitShiftPulang) return 0;

                $total    = count($rules);
                $potongan = 0;

                foreach ($rules as $index => $batas) {
                    if ($menitPulang < $batas) {
                        $potongan = (int) round((($total - $index) / $total) * 50);
                        break;
                    }
                }

                if ($potongan === 0 && $menitPulang < $menitShiftPulang) {
                    $potongan = (int) round((1 / $total) * 50);
                }

                return $potongan;
            };

            $potonganTelat  = $getPotonganTelat($menitMasuk, $telatRules);
            $potonganPulcet = $getPotonganPulangCepat($menitPulang, $menitShiftPulang, $pulcetRules);

            $tidakHadir = !$jamMasuk && !$jamPulang;

            if ($tidakHadir) {
                $totalPotongan = 100;
            } else if (!$jamMasuk || !$jamPulang) {
                $totalPotongan = 50;
            } else {
                $totalPotongan = max($potonganTelat, $potonganPulcet);
            }

            $upah            = $item->pegawai->jabatan->gaji ?? 0;
            $potonganNominal = ($totalPotongan / 100) * $upah;
            $upahBersih      = $upah - $potonganNominal;

            $batasTelatMenit = !empty($telatRules) ? $telatRules[0] : $menitShiftMasuk;
            $selisihTelat    = ($menitMasuk !== null && $batasTelatMenit !== null)
                ? max(0, $menitMasuk - $batasTelatMenit)
                : 0;

            // $batasPulcetMenit = !empty($pulcetRules) ? $pulcetRules[0] : $menitShiftPulang;
            // $selisihPulcet    = ($menitPulang !== null && $batasPulcetMenit !== null)
            // ? max(0, $batasPulcetMenit - $menitPulang)
            // : 0;

            // $item->jam_telat        = $formatJam($telat);
            // $item->jam_pulang_cepat = $formatJam($pulangCepat);
            // $item->jam_telat        = !empty($telatRulesRaw)  ? substr($telatRulesRaw[0], 0, 5)  : null;
            // $item->jam_pulang_cepat = !empty($pulcetRulesRaw) ? substr($pulcetRulesRaw[0], 0, 5) : null;
            // $item->jam_telat        = !empty($telatRulesRaw)  ? substr($telatRulesRaw[0], 0, 5)  : null;
            $item->jam_telat        = $formatJam($selisihTelat);
            $item->jam_pulang_cepat = $formatJam($pulangCepat);
            // $item->jam_pulang_cepat = $formatJam($selisihPulcet);
            $item->potongan_persen  = $totalPotongan;
            $item->potongan_nominal = $potonganNominal;
            $item->upah_bersih      = $upahBersih;

            // dump([
            //     'jam_masuk'   => $jamMasuk,
            //     'menit_masuk' => $menitMasuk,
            //     'telat_rules' => $telatRules, // isi array setelah decode
            //     'jumlah_rules' => count($telatRules),
            // ]);

            return $item;
        });

        return response()->json([
            'message' => 'Berhasil mendapatkan data petugas.',
            'data'    => $petugas
        ], 200);
    }

    public function potonganGaji(Request $request)
    {
        try {
            $search = $request->input('search');
            $perPage = $request->input('per_page', 50);
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift    = $request->input('shift');
            $korlap    = $request->input('korlap');
            $potongan = $request->input('potongan');

            $jumlah_hari = 0;

            if ($fromDate && $toDate) {
                $jumlah_hari = Carbon::parse($fromDate)
                    ->diffInDays(Carbon::parse($toDate)) + 1;
            }

            $pegawai = Pegawai::with([
                'kehadirans' => fn($q) => $q->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate   . ' 23:59:59',
                ]),
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'jabatan',
                'shift'
            ])
                ->select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'badgenumber', 'nama', 'no_rekening')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%')
                        ->where('id_department', '!=', 23);
                })
                ->when(Auth::user()->role === 'operator', function ($q) {
                    $q->where('id_department', Auth::user()->id_department);
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
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->where('id_shift', $shift);
                })
                ->when(!empty($korlap), function ($data) use ($korlap) {
                    $data->where('id_korlap', $korlap);
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->where('id_penugasan', $jabatan);
                })
                ->orderBy('nama')
                ->paginate($perPage);

            $pegawai->getCollection()->transform(function ($data) use ($jumlah_hari) {
                $hasil = $this->hitungPotongan($data, $jumlah_hari);

                return [
                    'id'                => $data->id,
                    'badgenumber'       => $data->badgenumber,
                    'no_rekening'       => $data->no_rekening,
                    'nama'              => $data->nama,
                    'department'        => $data->department?->DeptName ?: "-",
                    'jabatan'           => $data->jabatan?->nama,
                    'gaji'              => $hasil['gaji'],
                    'jumlah_hari'       => $jumlah_hari,
                    'jumlah_masuk'      => $hasil['jumlah_masuk'],
                    'potongan'          => $hasil['potongan'],
                    'upah_kotor'        => $data->jabatan?->gaji * $jumlah_hari,
                    'upah_bersih'       => $hasil['upah_bersih'],
                ];
            });

            $totalQuery = Pegawai::with([
                'kehadirans' => fn($q) => $q->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate   . ' 23:59:59',
                ]),
                'jabatan',
                'shift'
            ])
                ->select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'badgenumber', 'no_rekening', 'nama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%')
                        ->where('nama', 'not like', '%adm')
                        ->where('id_department', '!=', 23);
                })
                ->when(
                    Auth::user()->role === 'operator',
                    fn($q) =>
                    $q->where('id_department', Auth::user()->id_department)
                )
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($qq) use ($search) {
                        $qq->where('badgenumber', 'like', "{$search}%")
                            ->orWhere('nama', 'like', "{$search}%");
                    });
                })
                ->when(
                    empty($department) || (int) $department !== 23,
                    fn($q) =>
                    $q->where('id_department', '!=', 23)
                )
                ->when(
                    !empty($department),
                    fn($q) =>
                    $q->where('id_department', $department)
                )
                ->when(
                    !empty($shift),
                    fn($q) =>
                    $q->where('id_shift', $shift)
                )
                ->when(
                    !empty($korlap),
                    fn($q) =>
                    $q->where('id_korlap', $korlap)
                )
                ->when(
                    !empty($jabatan),
                    fn($q) =>
                    $q->where('id_penugasan', $jabatan)
                );

            $totalData = $totalQuery
                ->get()
                ->map(function ($data) use ($jumlah_hari) {
                    $hitung = $this->hitungPotongan($data, $jumlah_hari);

                    $gaji = $data->jabatan?->gaji ?: 0;

                    $jumlah_masuk = $data->kehadirans
                        ->groupBy(function ($item) {
                            $tanggal = Carbon::parse($item->check_time)->toDateString();
                            return $tanggal . "_" . $item->check_type;
                        })
                        ->count() / 2;

                    return [
                        'jumlah_masuk' => $jumlah_masuk,
                        'total_gaji_harian' => $gaji * $jumlah_hari,
                        'total_upah'  => $gaji * $jumlah_masuk,
                        'potongan' => $hitung['potongan'],
                        'upah_bersih' => $hitung['upah_bersih'],
                        'gaji' => $hitung['gaji'],
                    ];
                });

            $totalPotongan = $totalData->sum('potongan');
            $totalUpahBersih = $totalData->sum('upah_bersih');
            $totalGaji = $totalData->sum('total_gaji_harian');

            // $collection = $pegawai->getCollection();

            // $totalPotongan = $collection->sum('potongan');
            // $totalUpahBersih = $collection->sum('upah_bersih');
            // $totalGaji = $collection->sum('gaji');

            $totalPotonganFiltered = $totalPotongan;

            if ($potongan === 'ada') {
                $totalPotonganFiltered = $totalPotongan;
            } elseif ($potongan === 'tidak ada') {
                $totalPotonganFiltered = 0;
            }

            if (!empty($potongan)) {
                $filtered = $pegawai->getCollection()->filter(function ($item) use ($potongan) {
                    if ($potongan === 'ada') {
                        return $item['potongan'] > 0;
                    }

                    if ($potongan === 'tidak ada') {
                        return $item['potongan'] <= 0;
                    }

                    return true;
                });

                $pegawai->setCollection($filtered->values());
            }

            return response()->json([
                ...$pegawai->toArray(),
                'total_gaji_harian' => $totalGaji,
                'total_potongan' => $totalPotonganFiltered,
                'total_upah_bersih' => $totalUpahBersih,
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data gaji',
                // 'e' => $e->getMessage()
            ]);
        }
    }
}
