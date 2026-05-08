<?php

namespace App\Services;

use App\Models\ChecktimeSikpk;
use App\Models\Kehadiran;
use App\Models\Kehadiran_Iclock;
use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class KehadiranSyncService
{
    public function syncTanggal(string $dateYmd): void
    {
        $chunkSize = 5000;

        $start = Carbon::createFromFormat('Y-m-d', $dateYmd, 'Asia/Jakarta')->startOfDay();
        $end = (clone $start)->endOfDay();

        $pegawaiMap = Pegawai::with('department')->get()->keyBy('old_id');

        Kehadiran_Iclock::select('id', 'userid', 'checktime', 'checktype', 'verifycode', 'SN', 'sensorid', 'WorkCode', 'Reserved')
            ->whereBetween('checktime', [$start, $end])
            ->orderBy('checktime')
            ->chunk($chunkSize, function ($rows) use ($pegawaiMap) {
                $rows = $rows->unique(function ($row) {
                    return $row->userid . '|' . $row->checktype . '|' .
                        Carbon::parse($row->checktime)->format('Y-m-d');
                });

                if ($rows->isEmpty()) return;

                $payload = [];
                $checktime_sikpk = [];

                foreach ($rows as $row) {
                    $pegawai = $pegawaiMap->get($row->userid);
                    if (!$pegawai) continue;

                    Log::info($pegawai);

                    $payload[] = [
                        'old_id'          => $row->id,
                        'pegawai_id'      => $row->userid,
                        'nik'             => $pegawai->badgenumber ?? null,
                        'nama'            => $pegawai->nama ?? null,
                        'check_time'      => $row->checktime,
                        'check_type'      => $row->checktype,
                        'nama_department' => optional($pegawai->department)->DeptName,
                        'jabatan'         => optional($pegawai->jabatan)->nama ?? null,
                        'shift_kerja'     => optional($pegawai->shift)->jadwal ?? null,
                        'upah_kerja'      => optional($pegawai->jabatan)->gaji ?? null,
                        'keterangan'      => null,
                        'bukti_dukung'    => null,
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

                if (!empty($payload)) {
                    Kehadiran::withoutTimestamps(function () use ($payload) {
                        Kehadiran::upsert(
                            $payload,
                            ['pegawai_id', 'check_time', 'check_type'],
                            ['old_id', 'nik', 'nama', 'nama_department', 'jabatan', 'shift_kerja', 'upah_kerja', 'keterangan', 'bukti_dukung']
                        );
                    });
                }

                if (!empty($checktime_sikpk)) {
                    ChecktimeSikpk::upsert(
                        $checktime_sikpk,
                        ['userid', 'checktime', 'checktype'],
                        ['verifycode', 'SN', 'sensorid', 'WorkCode', 'Reserved', 'old_id']
                    );
                }
            });
    }
}
