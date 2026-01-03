<?php

namespace App\Jobs;

use App\Services\KehadiranSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;

class SyncKehadiranJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 1200;
    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(public string $date) {}

    public function middleware(): array
    {
        return [new WithoutOverlapping('sync-kehadiran' . $this->date)];
    }

    /**
     * Execute the job.
     */
    public function handle(KehadiranSyncService $service): void
    {
        $service->syncTanggal($this->date);
    }
}
