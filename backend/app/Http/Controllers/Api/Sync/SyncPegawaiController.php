<?php

namespace App\Http\Controllers\Api\Sync;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\Pegawai_Iclock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncPegawaiController extends Controller
{
    public function __invoke()
    {
        DB::beginTransaction();
        try {
            $chunks = 500;

            $stats = [
                'ditambah' => 0,
                'diupdate' => 0,
                'gagal'    => 0,
            ];

            Pegawai_Iclock::select('userid', 'badgenumber', 'defaultdeptid', 'name')
                ->whereNotNull('userid')
                ->orderBy('userid')
                ->chunk($chunks, function ($oldDataChunk) use (&$stats) {
                    $data = [];

                    $chuckStats = [
                        'ditambah' => 0,
                        'diupdate' => 0,
                        'gagal'    => 0,
                    ];

                    $oldIds = $oldDataChunk->pluck('userid')->filter()->all();

                    $pegawaiExisting = Pegawai::whereIn('old_id', $oldIds)
                        ->get()
                        ->keyBy('old_id');

                    foreach ($oldDataChunk as $iclock) {
                        try {
                            if (empty($iclock->userid)) {
                                Log::warning('Data iclock dengan ID kosong dilewati', ['data' => $iclock]);
                                $chuckStats['gagal']++;
                                continue;
                            }

                            $pegawai = $pegawaiExisting[$iclock->userid] ?? null;

                            $payload = [
                                'old_id'        => $iclock->userid,
                                'department_id' => $iclock->defaultdeptid,
                                'badgenumber'   => $iclock->badgenumber,
                                'nama'          => trim($iclock->name)
                            ];

                            if ($pegawai) {
                                $changed =
                                    ($pegawai->department_id != $payload['department_id']) ||
                                    ($pegawai->badgenumber   != $payload['badgenumber']) ||
                                    ($pegawai->nama          != $payload['nama']);

                                if (!$changed) {
                                    continue;
                                }

                                $chuckStats['diupdate']++;
                                $payload['updated_at'] = now();
                            } else {
                                $chuckStats['ditambah']++;
                                $payload['created_at'] = now();
                                $payload['updated_at'] = now();
                            }

                            $data[] = $payload;
                        } catch (\Exception $e) {
                            Log::error('Error memproses data iclock', [
                                'userid' => $iclock->userid ?: 'unknown',
                                'error'  => $e->getMessage()
                            ]);
                            $chuckStats['gagal']++;
                        }
                    }

                    if (!empty($data)) {
                        try {
                            Pegawai::upsert(
                                $data,
                                ['old_id'],
                                ['department_id', 'badgenumber', 'nama', 'updated_at']
                            );

                            $stats['ditambah'] += $chuckStats['ditambah'];
                            $stats['diupdate'] += $chuckStats['diupdate'];
                            $stats['gagal']    += $chuckStats['gagal'];
                        } catch (\Exception $e) {
                            Log::error('Error saat batch upsert', [
                                'error'       => $e->getMessage(),
                                'jumlah_data' => count($data)
                            ]);
                            $stats['gagal'] += (
                                $chuckStats['ditambah'] +
                                $chuckStats['diupdate'] +
                                $chuckStats['gagal']
                            );
                        }
                    }

                    unset($data);
                }, $columns = 'userid');

            DB::commit();

            return response()->json([
                'success'   => true,
                'message'   => 'Tarik data berhasil',
                'data'      => [
                    'ditambah' => $stats['ditambah'],
                    'diupdate' => $stats['diupdate'],
                    'gagal'    => $stats['gagal']
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Gagal menarik data.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menarik data pegawai.',
            ]);
        }
    }
}
