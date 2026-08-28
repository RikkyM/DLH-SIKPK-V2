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

        $pegawaiMap = Pegawai::with(['department', 'jabatan', 'shift'])->get()->keyBy('old_id');

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

                

                    $shift = $pegawai->shift;

                    $exist = Kehadiran::where('pegawai_id', $row->userid)
                        ->where('check_time', $row->checktime)
                        ->where('check_type', $row->checktype)
                        ->first();

                    $payload[] = [
                        'old_id'          => $row->id,
                        'pegawai_id'      => $row->userid,
                        'nik'             => $pegawai->badgenumber ?? null,
                        'nama'            => $pegawai->nama,
                        'check_time'      => $row->checktime,
                        'check_type'      => $row->checktype,
                        'nama_department' => $exist?->nama_department ?: optional($pegawai->department)->DeptName,
                        'jabatan'         => $exist?->jabatan ?: optional($pegawai->jabatan)?->nama,
                        'gaji'            => $exist?->gaji ?: optional($pegawai->jabatan)->gaji,
                        'shift_kerja'     => $exist?->shift_kerja ?: optional($pegawai->shift)->jadwal,
                        'jam_masuk'       => $exist?->jam_masuk ?: optional($pegawai->shift)->jam_masuk,
                        'jam_keluar'      => $exist?->jam_keluar ?: optional($pegawai->shift)->jam_keluar,
                        // 'jam_kerja' => $exist?->jam_kerja
                        //     ?: (
                        //         $shift?->jam_masuk && $shift?->jam_keluar
                        //         ? $shift->jam_masuk . ' - ' . $shift->jam_keluar
                        //         : null
                        //     ),
                        'telat'           => $exist?->telat ? json_encode($exist?->telat) : ($pegawai->shift?->telat !== null ? json_encode($pegawai->shift?->telat) : null),
                        'pulang_cepat'    => $exist?->pulang_cepat ? json_encode($exist?->pulang_cepat) : ($pegawai->shift?->pulang_cepat !== null ? json_encode($pegawai->shift?->pulang_cepat) : null),
                        'upah_kerja'      => $exist?->upah_kerja ?: optional($pegawai->jabatan)->gaji,
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
                            // ['old_id'],
                            ['old_id', 'nik', 'nama', 'nama_department', 'jabatan', 'gaji', 'shift_kerja', 'jam_masuk', 'jam_keluar', 'telat', 'pulang_cepat', 'keterangan', 'bukti_dukung']
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
