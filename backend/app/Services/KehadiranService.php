<?php

namespace App\Services;

use Carbon\Carbon;

class KehadiranService
{
    public function diffMenit($jam1, $jam2)
    {
        if (!$jam1 || !$jam2) return 0;

        $fromTime = Carbon::createFromTimeString( $jam1);
        $toTime = Carbon::createFromTimeString( $jam2);

        return $fromTime->diffInMinutes($toTime, false);

        // return Carbon::createFromFormat('H:i', $jam1)
        //     ->diffInMinutes(Carbon::createFromFormat('H:i', $jam2), false);
    }

    public function formatDiff(Carbon $from, Carbon $to): string
    {
        $diff = $from->diff($to);
        return sprintf('%02d:%02d', $diff->h, $diff->i);
    }

    public function hitungJamTelat(?string $jamMasuk, ?string $jamShift): string
    {
        if (!$jamMasuk || !$jamShift) return '-';

        $masuk = Carbon::createFromTimeString($jamMasuk);
        $shift = Carbon::createFromTimeString($jamShift);

        if ($masuk->lessThanOrEqualTo($shift)) {
            return '-';
        }

        return $this->formatDiff($shift, $masuk);
    }

    public function hitungJamPulangCepat(?string $jamPulang, ?string $jamShift): string
    {
        if (!$jamPulang || !$jamShift) return '-';

        $pulang = Carbon::createFromTimeString($jamPulang);
        $shift = Carbon::createFromTimeString($jamShift);

        if ($pulang->greaterThanOrEqualTo($shift)) {
            return '-';
        }

        return $this->formatDiff($pulang, $shift);
    }

    public function hitungPotonganGaji(
        ?string $jamMasuk,
        ?string $jamPulang,
        $shift,
        float $gaji
    ) {
        if (!$shift) return 0;

        $potongan = 0;
        $kenaTelat = 0;

        if ($jamMasuk && $shift->jam_masuk && !empty($shift->telat)) {

            $menitTelat = max(
                0,
                $this->diffMenit(substr($shift->jam_masuk, 0, 5), $jamMasuk)
            );

            $telatRules = collect($shift->telat)->count();

            if ($menitTelat > 0) {
                $kenaTelat = min(1, $telatRules);
            }

            $bobotTelat = 0.5 / $telatRules;
            $potongan += $gaji * ($kenaTelat * $bobotTelat);
        }

        if (
            $jamPulang &&
            !empty($shift->pulang_cepat) &&
            $shift->jam_keluar
        ) {
            $jamKeluarShift = substr($shift->jam_keluar, 0, 5);

            $pulangRules = collect($shift->pulang_cepat)
                ->map(fn($j) => substr($j, 0, 5))
                ->push($jamKeluarShift) //
                ->unique()
                ->sortDesc()
                ->values();

            $jumlahPulangRules = $pulangRules->count() - 1;

            $bobotPulang = 0.5 / $jumlahPulangRules;
            $kenaPulang = 0;

            foreach ($pulangRules as $jamRule) {
                if ($this->diffMenit($jamPulang, $jamRule) > 0) {
                    $kenaPulang++;
                } else {
                    break;
                }
            }

            $potongan += $gaji * ($kenaPulang * $bobotPulang);
        }
        return round($potongan, 0);
    }
}
