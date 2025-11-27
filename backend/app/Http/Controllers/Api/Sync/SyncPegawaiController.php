<?php

namespace App\Http\Controllers\Api\Sync;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\Pegawai_Iclock;
use Carbon\Carbon;
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

            Pegawai_Iclock::whereNotNull('userid')
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
                            dd($iclock);
                            if (empty($iclock->userid)) {
                                Log::warning('Data iclock dengan ID kosong dilewati', ['data' => $iclock]);
                                $chuckStats['gagal']++;
                                continue;
                            }

                            // dd($iclock);

                            $pegawai = $pegawaiExisting[$iclock->userid] ?? null;

                            $payload = [
                                'old_id'        => $iclock->userid,
                                'id_department' => $iclock->defaultdeptid,
                                'id_shift'      => $iclock->shiftkerja ?: null,
                                'badgenumber'   => $iclock->badgenumber,
                                'nama'          => trim($iclock->name),
                                'tanggal_lahir' => Carbon::parse($iclock->tgllahir)->format('Y-m-d'),
                                'alamat'        => $iclock?->alamat ?: null,
                                'kecamatan'     => $iclock?->kecamatan ?: null,
                                'kelurahan'     => $iclock?->kelurahan ?: null,
                                'kota'          => $iclock?->kota ?: null,
                                'rute_kerja'    => $iclock?->rutekerja ?: null
                            ];

                            dd($payload);

                            // dd($payload);

                            if ($pegawai) {
                                $changed =
                                    ($pegawai->id_department != $payload['id_department']) ||
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
                                ['id_department', 'id_shift', 'badgenumber', 'nama', 'tanggal_lahir', 'alamat', 'kecamatan', 'kelurahan', 'kota', 'rute_kerja', 'updated_at']
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
                'p' => $e->getMessage()
            ]);
        }
    }
}
