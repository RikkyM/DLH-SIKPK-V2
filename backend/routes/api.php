<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Department\DepartmentController;
use App\Http\Controllers\Api\JenisKendaraan\JenisKendaraanController;
use App\Http\Controllers\Api\Kehadiran\KehadiranController;
use App\Http\Controllers\Api\Pegawai\PegawaiController;
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

        Route::get('/pegawai', [PegawaiController::class, 'index']);
        Route::post('/sync-pegawai', SyncPegawaiController::class);
        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::get('/kehadiran', [KehadiranController::class, 'index']);
        Route::post('/sync-kehadiran', SyncKehadiranController::class);
        Route::get('/jenis-kendaraan', [JenisKendaraanController::class, 'index']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
