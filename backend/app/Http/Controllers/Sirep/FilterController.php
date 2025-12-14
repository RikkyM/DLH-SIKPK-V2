<?php

namespace App\Http\Controllers\Sirep;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Http\Request;

class FilterController extends Controller
{
    public function getKecamatan()
    {
        try {
            $kecamatan = Kecamatan::get();

            return response()->json([
                'status' => true,
                'data' => $kecamatan
            ], 200);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'status' => false,
                'message' => 'Gagal mendapatkan data kecamatan.'
            ], 500);
        }
    }

    public function getKelurahan()
    {
        try {
            $kelurahan = Kelurahan::get();
            
            return response()->json([
                'status' => true,
                'data' => $kelurahan
            ], 200);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'status' => false,
                'message' => 'Gagal mendapatkan data kelurahan.'
            ], 500);
        }
    }
}
