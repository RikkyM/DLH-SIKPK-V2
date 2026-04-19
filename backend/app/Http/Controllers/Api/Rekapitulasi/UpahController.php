<?php

namespace App\Http\Controllers\Api\Rekapitulasi;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use App\Models\Kehadiran;
use Carbon\Carbon;
use Illuminate\Http\Request;

class UpahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $department = Departments::with(['pegawai.jabatan'])
            ->where('DeptName', '!=', 'Our Company')
            ->get()
            ->map(function ($q) {

                $groupDept = $q->pegawai
                    ->groupBy(fn($p) => $p->jabatan->nama ?? "Tidak Ada")
                    ->map(fn($items, $jabatan) => [
                        'nama_jabatan' => $jabatan,
                        'jumlah'       => $items->count()
                    ]);

                return [
                    'DeptID'   => $q->DeptID,
                    'DeptName' => $q->DeptName,
                    'pegawai'  => $q->pegawai->count(),
                    'jabatan'  => $groupDept
                ];
            });

        return response()->json([
            'datas' => $department
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
