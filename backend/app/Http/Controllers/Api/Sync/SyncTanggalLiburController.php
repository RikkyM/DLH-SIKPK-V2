<?php

namespace App\Http\Controllers\Api\Sync;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncTanggalLiburController extends Controller
{
    private const API_URL = 'https://libur.deno.dev/api';

    public function sync(): JsonResponse
    {
        $response = Http::timeout(15)->get(self::API_URL);

        if ($response->failed()) {
            Log::error('HolidaySync: Gagal fetch API', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dari API.'
            ], 502);
        }

        $holidays = $response->json();

        if (empty($holidays) || !is_array($holidays)) {
            return response()->json([
                'success' => false,
                'message' => 'Data dari API kosong atau tidak valid.',
            ], 422);
        }

        $inserted = 0;
        $updated  = 0;

        foreach ($holidays as $item) {
            if (empty($item['date']) || empty($item['name'])) {
                continue;
            }

            $result = Holiday::updateOrCreate(
                ['date' => $item['date']],
                ['name' => $item['name']]
            );

            $result->wasRecentlyCreated ? $inserted++ : $updated++;
        }

        return response()->json([
            'success' => true,
            'message' => 'Sinkronisasi selesai.',
            'data'    => [
                'total'     => count($holidays),
                'inserted'  => $inserted,
                'updated'   => $updated
            ]
        ]);
    }
}
