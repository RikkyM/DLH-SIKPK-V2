<?php

namespace App\Http\Controllers\Api\Sync;

use App\Http\Controllers\Controller;
use App\Models\ChecktimeSikpk;
use App\Models\Kehadiran;
use App\Models\Kehadiran_Iclock;
use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Benchmark;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncKehadiranController extends Controller
{
    // public function __invoke()
    // {
    //     $chunkSize = 1000;
    //     $currentRow = null;
    //     DB::beginTransaction();
    //     try {
    //         Kehadiran_Iclock::orderBy('checktime')
    //             ->select('id', 'userid', 'checktime', 'checktype')
    //             ->chunk($chunkSize, function ($rows) use (&$currentRow) {
    //                 $rows = $rows->unique(function ($row) {
    //                     return $row->userid . '|' . $row->checktype . '|' . Carbon::parse($row->checktime)->format('Y-m-d');
    //                 });

    //                 if ($rows->isEmpty()) return;

    //                 $userIds = $rows->pluck('userid')->unique()->values();

    //                 $pegawaiMap = Pegawai::with('department')
    //                     ->whereIn('old_id', $userIds)
    //                     ->get()
    //                     ->keyBy('old_id');

    //                 $payload = [];

    //                 foreach ($rows as $row) {
    //                     $currentRow = $row;
    //                     $pegawai = $pegawaiMap->get($row->userid);

    //                     if (!$pegawai) continue;

    //                     $checkType = trim((string) $row->checktype);

    //                     // Debug: kalau bukan '0' atau '1', langsung dd
    //                     if (!in_array($checkType, ['0', '1'], true)) {
    //                         dd('CHECKTYPE TIDAK VALID', [
    //                             'raw'   => $row->checktype,
    //                             'after' => $checkType,
    //                             'row'   => $row,
    //                         ]);
    //                     }

    //                     $payload[] = [
    //                         'old_id'          => $row->id,
    //                         'pegawai_id'      => $row->userid,
    //                         'nik'             => $pegawai->badgenumber ?? null,
    //                         'nama'            => $pegawai->nama ?? null,
    //                         'check_time'      => $row->checktime,
    //                         'check_type'      => $row->checktype ?: null,
    //                         'nama_department' => $pegawai->department->DeptName ?? null,
    //                         'jabatan'         => null,
    //                         'shift_kerja'     => null,
    //                         'keterangan'      => null,
    //                         'bukti_dukung'    => null,
    //                         'created_at'      => now(),
    //                         'updated_at'      => now(),
    //                     ];
    //                 }

    //                 if (!empty($payload)) {
    //                     Kehadiran::upsert(
    //                         $payload,
    //                         ['pegawai_id', 'check_time', 'check_type'],
    //                         [
    //                             'old_id',
    //                             'nik',
    //                             'nama',
    //                             'nama_department',
    //                             'jabatan',
    //                             'shift_kerja',
    //                             'keterangan',
    //                             'bukti_dukung',
    //                             'updated_at',
    //                         ]
    //                     );
    //                 }
    //             });

    //         DB::commit();

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Berhasil Sinkronisasi data kehadiran.'
    //         ]);
    //     } catch (\Exception $e) {
    //         DB::rollback();
    //         dd($e);
    //         Log::error('Gagal menarik data.', [
    //             'error' => $e->getMessage(),
    //             'trage' => $e->getTraceAsString()
    //         ]);

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Gagal menarik data kehadiran.',
    //             'error' => $e->getMessage(),
    //         ]);
    //     }
    // }

    public function __invoke(Request $request)
    {
        $chunkSize = 5000;

        // $year  = (int) $request->input('year', now()->year);
        // $month = (int) $request->input('month', now()->month);

        // Range tanggal bulan tersebut
        // $startOfMonth = Carbon::create($year, $month, 1)->startOfDay();
        // $endOfMonth   = (clone $startOfMonth)->endOfMonth()->endOfDay();

        $startOfMonth = Carbon::create(now()->year, now()->month, 1)->startOfDay();
        $endOfMonth = (clone $startOfMonth)->endOfMonth()->endOfDay();

        try {
            $pegawaiMap = Pegawai::with('department')
                ->get()
                ->keyBy('old_id');

            // dd(Kehadiran_Iclock::get()->take(10));

            Kehadiran_Iclock::select('id', 'userid', 'checktime', 'checktype', 'verifycode', 'SN', 'sensorid', 'WorkCode', 'Reserved')
                ->whereBetween('checktime', [$startOfMonth, $endOfMonth])
                ->orderBy('checktime')
                ->chunk($chunkSize, function ($rows) use (&$pegawaiMap) {
                    $rows = $rows->unique(function ($row) {
                        return $row->userid . '|' . $row->checktype . '|' .
                            Carbon::parse($row->checktime)->format('Y-m-d');
                    });

                    if ($rows->isEmpty()) return;

                    $payload = [];
                    $checktime_sikpk = [];

                    foreach ($rows as $row) {
                        $pegawai = $pegawaiMap->get($row->userid);

                        if (!$pegawai) {
                            continue;
                        }

                        $payload[] = [
                            'old_id'          => $row->id,
                            'pegawai_id'      => $row->userid,
                            'nik'             => $pegawai->badgenumber ?? null,
                            'nama'            => $pegawai->nama ?? null,
                            'check_time'      => $row->checktime,
                            'check_type'      => $row->checktype,
                            'nama_department' => optional($pegawai->department)->DeptName,
                            'jabatan'         => null,
                            'shift_kerja'     => null,
                            'keterangan'      => null,
                            'bukti_dukung'    => null,
                            // 'created_at'      => now(),
                            // 'updated_at'      => now(),
                        ];

                        $checktime_sikpk[] = [
                            'old_id'     => $row->id,
                            'userid'     => $row->userid,
                            'checktime'  => $row->checktime,
                            'checktype'  => $row->checktype,
                            'verifycode' => $row->verifycode,
                            'SN'         => $row->SN,
                            'sensorid'   => $row->sensorid,
                            'WorkCode'   => $row->WorkCode,
                            'Reserved'   => $row->Reserved
                        ];
                    }

                    // return response()->json($payload);

                    if (!empty($payload)) {
                        Kehadiran::withoutTimestamps(function () use ($payload) {
                            Kehadiran::upsert(
                                $payload,
                                ['pegawai_id', 'check_time', 'check_type'],
                                [
                                    'old_id',
                                    'nik',
                                    'nama',
                                    'nama_department',
                                    'jabatan',
                                    'shift_kerja',
                                    'keterangan',
                                    'bukti_dukung',
                                    // 'updated_at',
                                ]
                            );
                        });
                    }

                    if (!empty($checktime_sikpk)) {
                        ChecktimeSikpk::insert($checktime_sikpk);
                        // ChecktimeSikpk::upsert(
                        //     $checktime_sikpk,
                        //     ['userid', 'checktime', 'checktype'], // kunci unik
                        //     ['verifycode', 'SN', 'sensorid', 'WorkCode', 'Reserved', 'old_id'] // kolom yang di-update
                        // );
                    }

                });

            return response()->json([
                'success' => true,
                'message' => 'Berhasil Sinkronisasi data kehadiran.'
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal menarik data kehadiran.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menarik data kehadiran.',
            ], 500);
        }
    }
}
