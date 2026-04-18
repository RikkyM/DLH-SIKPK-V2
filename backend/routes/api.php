<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\Department\DepartmentController;
use App\Http\Controllers\Api\Jabatan\JabatanController;
use App\Http\Controllers\Api\JenisKendaraan\JenisKendaraanController;
use App\Http\Controllers\Api\Kehadiran\KehadiranController;
use App\Http\Controllers\Api\Kendaraan\KendaraanController;
use App\Http\Controllers\Api\Pegawai\PegawaiController;
use App\Http\Controllers\Api\PegawaiASN\AsnController;
use App\Http\Controllers\Api\ShiftKerja\ShiftKerjaController;
use App\Http\Controllers\Api\Sync\SyncKehadiranController;
use App\Http\Controllers\Api\Sync\SyncPegawaiController;
use App\Http\Controllers\Export\ExportController;
use App\Http\Controllers\Sirep\FilterController;
use App\Http\Controllers\Storage\PrivateController;
use App\Http\Controllers\User\UserController;
use App\Models\Kehadiran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::prefix('/v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', fn() =>  response()->json(Auth::user()));
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/pegawai', [PegawaiController::class, 'index']);
        Route::get('/check-type', [KehadiranController::class, 'checkType']);
        Route::get('/kehadiran', [KehadiranController::class, 'index'])->middleware('web');
        Route::get('/rekap-kehadiran', [KehadiranController::class, 'rekapKehadiran'])->middleware('web');
        Route::get('/data-kehadiran', [KehadiranController::class, 'dataKehadiran']);
        Route::prefix('rekap-tanggal-hadir')->group(function () {
            Route::get('/', [KehadiranController::class, 'rekapTanggalHadir']);
            Route::get('/petugas', [PegawaiController::class, 'getPetugas']);
        });

        Route::controller(PegawaiController::class)
            ->middleware('web')
            ->group(function () {
                Route::get('/gaji', 'gaji');
                Route::get('/gaji-petugas', 'getGajiPetugas');
                Route::get('/potongan-gaji', 'potonganGaji');
            });

        // master-data
        Route::get('/shift-kerja', [ShiftKerjaController::class, 'index']);
        Route::get('/unit-kerja', [DepartmentController::class, 'unitKerja']);
        Route::get('/jenis-kendaraan', [JenisKendaraanController::class, 'index']);
        Route::get('/kendaraan', [KendaraanController::class, 'index']);
        Route::get('/jabatan', [JabatanController::class, 'index']);
        Route::prefix('pegawai-asn')
            ->controller(AsnController::class)
            ->group(function () {
                Route::get('/', 'index');
                Route::post('/', 'store');
                Route::put('/{id}', 'update');
            });
        Route::get('/data-user', [UserController::class, 'index']);

        // filter data
        Route::get('/kategori-kerja', [ShiftKerjaController::class, 'kategoriKerja']);
        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::get('/penugasan', [JabatanController::class, 'penugasan']);
        Route::get('/korlap', [AsnController::class, 'filterAsn']);
        Route::get('/kecamatan', [FilterController::class, 'getKecamatan']);
        Route::get('/kelurahan', [FilterController::class, 'getKelurahan']);
        Route::get('/petugas-kehadiran', [PegawaiController::class, 'searchKehadiranPetugas']);
        Route::get('/petugas-kehadiran/{id}', [PegawaiController::class, 'searchKehadiranPetugasDetail']);
        Route::get('/kehadiran-petugas', [PegawaiController::class, 'getDataKehadiranPetugas'])->middleware('web');

        Route::post('/data-user', [UserController::class, 'store']);
        Route::post('/sync-pegawai', SyncPegawaiController::class);
        Route::post('/sync-kehadiran', SyncKehadiranController::class);
        Route::post('/kehadiran', [KehadiranController::class, 'store']);
        Route::post('/kehadiran-data', [KehadiranController::class, 'updateKehadiran']);
        Route::post('/shift-kerja', [ShiftKerjaController::class, 'add']);
        Route::post('/penugasan', [JabatanController::class, 'store']);

        // export data

        Route::put('/pegawai/{id}', [PegawaiController::class, 'updatePegawai']);
        Route::put('/jenis-kendaraan/{id}', [JenisKendaraanController::class, 'update']);
        Route::put('/data-user/{id}', [UserController::class, 'update']);
        Route::put('/shift-kerja/{id}', [ShiftKerjaController::class, 'edit']);
        Route::put('/penugasan/{id}', [JabatanController::class, 'update']);

        Route::patch('/kehadiran/{id}/status', [KehadiranController::class, 'patch']);

        Route::middleware('web')->group(function () {
            Route::controller(ExportController::class)->group(function () {
                Route::get('/export-pegawai', 'pegawaiExport');
                Route::get('/export-pegawai-pdf/{id}', 'pegawaiExportPdf');
                Route::get('/export-kehadiran/{name}', 'kehadiranExport');
                Route::get('/export-kehadiran-per-tanggal', 'kehadiranPerTanggalExport');
                Route::get('/export-rekap-tanggal-hadir', 'rekapTanggalHadirExport');
                Route::get('/export-finger', 'fingerExport');
                Route::get('/export-gaji', 'spjUpahKerjaExport');
            });

            Route::get('/petugas/{id}/image/{type}', [PrivateController::class, 'getPetugasImage']);
            Route::get('/kehadiran/{id}', [PrivateController::class, 'getKehadiranFile']);
        });
    });
});
