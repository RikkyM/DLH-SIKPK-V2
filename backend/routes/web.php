<?php

use App\Http\Controllers\Import\ImportController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::controller(ImportController::class)->group(function () {
    Route::get('/import-kendaraan',  'importKendaraan')->name('import-kendaraan');
    Route::post('/import-kendaraan', 'importKendaraanProcess');
    Route::get('/import-asn', 'importAsn')->name('import-asn');
    Route::post('/import-asn', 'importAsnProcess');
});
