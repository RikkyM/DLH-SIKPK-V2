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
        $kehadiran = Kehadiran_Iclock::orderBy('checktime')
            ->get()
            ->unique(function ($row) {
                return $row->userid . '|' . $row->checktype . '|' . Carbon::parse($row->checktime)->format('Y-m-d');
            })
            ->sortBy('id')
            ->values();

        DB::beginTransaction();
        try {
            // $inserted = 0;
            // $skipped = 0;
            $chunks = 500;

            foreach ($kehadiran->chunk($chunks) as $chunk) {
                foreach ($chunk as $row) {

                    $pegawai = Pegawai::where('old_id', $row->userid)->first();

                    $data = [
                        'old_id'           => $row->id,
                        'pegawai_id'       => $row->userid,
                        'nik'              => $pegawai->badgenumber ?? null,
                        'nama'             => $pegawai->nama ?? null,
                        'check_time'       => $row->checktime,
                        'check_type'       => $row->checktype,
                        'nama_department'  => $pegawai->department->DeptName ?? null,
                        'jabatan'          => null,
                        'shift_kerja'      => null,
                        'keterangan'       => null,
                        'bukti_dukung'     => null
                    ];

                    Kehadiran::updateOrCreate(
                        [
                            'pegawai_id' => $data['pegawai_id'],
                            'check_time' => $data['check_time'],
                            'check_type' => $data['check_type'],
                        ],
                        $data
                    );
                    // $inserted++;
                }
            }

            DB::commit();

            // return response()->json([
            //     'success' => true,
            //     'message' => 'Berhasil sinkronisasi data kehadiran.',
            // ]);
            return response()->json([
                'success' => true,
                'message' => 'Berhasil sinkronisasi data kehadiran.',
                // 'stats' => [
                //     'total_sumber_setelah_filter' => $kehadiran->count(),
                //     'inserted' => $inserted,
                //     'skipped'  => $skipped,
                // ],
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            dd($e);
            Log::error('Gagal menarik data.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menarik data kehadiran.'
            ]);
        }
    }
}
