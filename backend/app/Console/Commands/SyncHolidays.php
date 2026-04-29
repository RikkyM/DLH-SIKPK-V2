<?php

namespace App\Console\Commands;

use App\Models\Holiday;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncHolidays extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:sync {year? : Tahun yang ingin di sync (default: tahun ini)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi data hari libur nasional dari libur.deno.dev';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $year = $this->argument('year') ?? now()->year;
        $url  = "https://libur.deno.dev/api?year={$year}";

        $this->info("Mengambil data hari libur tahun {$year}...");

        $response = Http::timeout(15)->get($url);

        if ($response->failed()) {
            $this->error("Gagal fetch API. Status: {$response->status()}");
            Log::error('HolidaySync: Gagal fetch API', [
                'url'    => $url,
                'status' => $response->status(),
            ]);

            return self::FAILURE;
        }

        $holidays = $response->json();

        if (empty($holidays) || !is_array($holidays)) {
            $this->warn('Data dari API kosong atau tidak valid.');
            return self::FAILURE;
        }

        $inserted = 0;
        $updated  = 0;

        $this->withProgressBar($holidays, function (array $item) use (&$inserted, &$updated) {
            if (empty($item['date']) || empty($item['name'])) {
                return;
            }

            $result = Holiday::updateOrCreate(
                ['date' => $item['date']],
                ['name' => $item['name']],
            );

            $result->wasRecentlyCreated ? $inserted++ : $updated++;
        });

        $this->newLine(2);
        $this->table(
            ['Keterangan', 'Jumlah'],
            [
                ['Total dari API', count($holidays)],
                ['Inserted (baru)', $inserted],
                ['Updated (diperbarui)', $updated],
            ]
        );

        $this->info('Sinkronisasi selesai!');

        Log::info('HolidaySync: Selesai', [
            'year'     => $year,
            'total'    => count($holidays),
            'inserted' => $inserted,
            'updated'  => $updated,
        ]);

        return self::SUCCESS;
    }
}
