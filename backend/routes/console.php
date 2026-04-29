<?php

use App\Jobs\SyncKehadiranJob;
use Carbon\Carbon;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule::call(function () {
//     $today = Carbon::now('Asia/Jakarta')->toDateString();

// //     Log::info('SCHED TICK', [
// //         'time' => now('Asia/Jakarta')->toDateTimeString(),
// //         'date' => $today,
// //     ]);

//     SyncKehadiranJob::dispatch($today)
//         ->onQueue('sync-kehadiran');
// })
//     ->everyMinute()
//     ->name('sync-kehadiran-test')
//     ->withoutOverlapping();

Schedule::command('holidays:sync')->yearlyOn(1, 1, '00:05');

Schedule::call(function () {
    $today = Carbon::now('Asia/Jakarta')->toDateString();
    SyncKehadiranJob::dispatch($today)->onQueue('sync-kehadiran');
})
    ->timezone('Asia/Jakarta')
    ->everyTenMinutes()
    ->between('06:00', '10:00')
    ->name('sync-kehadiran-pagi')
    ->withoutOverlapping();

// malam 23:00 - 23:59
Schedule::call(function () {
    $today = Carbon::now('Asia/Jakarta')->toDateString();
    SyncKehadiranJob::dispatch($today)->onQueue('sync-kehadiran');
})
    ->timezone('Asia/Jakarta')
    ->everyTenMinutes()
    ->between('23:00', '23:59')
    ->name('sync-kehadiran-malam')
    ->withoutOverlapping();

// tambahan tepat jam 00:00 (biar “11 sampai 12” benar-benar kena sampai 12)
Schedule::call(function () {
    $today = Carbon::now('Asia/Jakarta')->toDateString();
    SyncKehadiranJob::dispatch($today)->onQueue('sync-kehadiran');
})
    ->timezone('Asia/Jakarta')
    ->dailyAt('00:00')
    ->name('sync-kehadiran-tengah-malam')
    ->withoutOverlapping();
