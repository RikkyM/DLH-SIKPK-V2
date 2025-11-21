<?php

namespace App\Http\Controllers\Api\Sync;

use App\Http\Controllers\Controller;
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
    public function __invoke()
    {
        $chunkSize = 1000;
        DB::beginTransaction();
        try {
            Kehadiran_Iclock::orderBy('checktime')
                ->select('id', 'userid', 'checktime', 'checktype')
                ->chunk($chunkSize, function ($rows) {
                    $rows = $rows->unique(function ($row) {
                        return $row->userid . '|' . $row->checktype . '|' . Carbon::parse($row->checktime)->format('Y-m-d');
                    });

                    if ($rows->isEmpty()) return;

                    $userIds = $rows->pluck('userid')->unique()->values();

                    $pegawaiMap = Pegawai::with('department')
                        ->whereIn('old_id', $userIds)
                        ->get()
                        ->keyBy('old_id');

                    $payload = [];

                    foreach ($rows as $row) {
                        $pegawai = $pegawaiMap->get($row->userid);

                        if (!$pegawai) continue;

                        $payload[] = [
                            'old_id'          => $row->id,
                            'pegawai_id'      => $row->userid,
                            'nik'             => $pegawai->badgenumber ?? null,
                            'nama'            => $pegawai->nama ?? null,
                            'check_time'      => $row->checktime,
                            'check_type'      => $row->checktype,
                            'nama_department' => $pegawai->department->DeptName ?? null,
                            'jabatan'         => null,
                            'shift_kerja'     => null,
                            'keterangan'      => null,
                            'bukti_dukung'    => null,
                            'created_at'      => now(),
                            'updated_at'      => now(),
                        ];
                    }

                    if (!empty($payload)) {
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
                                'updated_at',
                            ]
                        );
                    }
                });

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil Sinkronisasi data kehadiran.'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Gagal menarik data.', [
                'error' => $e->getMessage(),
                'trage' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menarik data kehadiran.',
                'error' => $e->getMessage()
            ]);
        }
    }
}
