<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Department\DepartmentController;
use App\Http\Controllers\Api\Jabatan\JabatanController;
use App\Http\Controllers\Api\JenisKendaraan\JenisKendaraanController;
use App\Http\Controllers\Api\Kehadiran\KehadiranController;
use App\Http\Controllers\Api\Kendaraan\KendaraanController;
use App\Http\Controllers\Api\Pegawai\PegawaiController;
use App\Http\Controllers\Api\ShiftKerja\ShiftKerjaController;
use App\Http\Controllers\Api\Sync\SyncKehadiranController;
use App\Http\Controllers\Api\Sync\SyncPegawaiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::prefix('/v1')->middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return response()->json(Auth::user());
        });
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/pegawai', [PegawaiController::class, 'index']);
        Route::get('/finger', [KehadiranController::class, 'finger']);
        Route::get('/kehadiran', [KehadiranController::class, 'index']);
        Route::get('/gaji', [PegawaiController::class, 'gaji']);

        // master-data
        Route::get('/shift-kerja', [ShiftKerjaController::class, 'index']);
        Route::get('/unit-kerja', [DepartmentController::class, 'unitKerja']);
        Route::get('/jenis-kendaraan', [JenisKendaraanController::class, 'index']);
        Route::get('/kendaraan', [KendaraanController::class, 'index']);
        Route::get('/jabatan', [JabatanController::class, 'index']);

        // filter data
        Route::get('/departments', [DepartmentController::class, 'index']);

        Route::post('/sync-pegawai', SyncPegawaiController::class);
        Route::post('/sync-kehadiran', SyncKehadiranController::class);
    });
});
