<?php

namespace App\Http\Controllers\Storage;

use App\Http\Controllers\Controller;
use App\Models\KehadiranDraft;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PrivateController extends Controller
{
    public function getKehadiranFile($id)
    {
        $kehadiran = KehadiranDraft::findOrFail($id);

        abort_unless($kehadiran->bukti_dukung, 404);
        abort_unless(Storage::disk('local')->exists($kehadiran->bukti_dukung), 404);

        return response()->file(
            Storage::disk('local')->path($kehadiran->bukti_dukung)
        );
    }

    public function getPetugasImage($id, $type)
    {
        $petugas = Pegawai::findOrFail($id);

        $images = [
            'ktp' => 'upload_ktp',
            'kk' => 'upload_kk',
            'pas_foto' => 'upload_pas_foto',
            'foto_lapangan' => 'foto_lapangan'
        ];

        abort_unless(isset($images[$type]), 404);

        $path = $petugas->{$images[$type]};

        abort_unless($path, 404);
        abort_unless(Storage::disk('local')->exists($path), 404);

        return response()->file(
            Storage::disk('local')->path($path)
        );
    }
}
