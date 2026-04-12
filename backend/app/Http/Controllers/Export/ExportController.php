<?php

namespace App\Http\Controllers\Export;

use App\Exports\Gaji\SPJUpahKerjaExport;
use App\Exports\Kehadiran\FingerExport;
use App\Exports\Kehadiran\KehadiranExport;
use App\Exports\Kehadiran\KehadiranPerTanggalExport;
use App\Exports\Kehadiran\RekapTanggalHadirExport;
use App\Exports\Pegawai\PegawaiExport;
use App\Http\Controllers\Controller;
use App\Models\Departments;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Writer\Pdf;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\Writer\PDF\DomPDF;
use Symfony\Component\Process\Process;

class ExportController extends Controller
{
    protected function fileName($prefix = '')
    {
        $user = Auth::user();
        $deptSlug = null;

        if ($user->role === 'operator') {
            $deptName = optional(Departments::find($user->id_department))->DeptName;

            $deptSlug = $deptName ? Str::slug($deptName, '-') : null;
        }

        $date = now()->format('d-m-Y');

        return $deptSlug
            ? "{$prefix}-{$deptSlug}-{$date}.xlsx"
            : "{$prefix}-{$date}.xlsx";
    }

    public function getPegawaiData()
    {
        
    }

    public function pegawaiExport(Request $request)
    {
        return Excel::download(new PegawaiExport($request), $this->fileName('petugas'));
    }

    public function pegawaiExportPdf($id)
    {
        $pegawai = Pegawai::with('department', 'korlap', 'shift', 'jabatan')->findOrFail($id);

        // dd($pegawai);

        if (!$pegawai) {
            abort(404, 'Pegawai tidak ditemukan');
        }

        $templatePath = Storage::disk('local')->path('template/template-petugas.docx');
        $outputDir = Storage::disk('local')->path('template/generated');

        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0777, true);
        }

        $timestamp = now()->format('dmY_His');
        $baseFileName = "pegawai-{$pegawai->id}-{$timestamp}";
        $docxOutput = $outputDir . "/{$baseFileName}.docx";

        $jadwal = preg_replace('/\bKategori\s*/i', 'K', $pegawai->shift?->jadwal);

        $template = new TemplateProcessor($templatePath);
        $template->setValue('nik', $pegawai->badgenumber ?? "-");
        $template->setValue('nama', Str::title($pegawai->nama));
        $template->setValue('tempat_lahir', $pegawai->tempat_lahir ?? "-");
        $template->setValue('tanggal_lahir', $pegawai->tanggal_lahir ? Carbon::parse($pegawai->tanggal_lahir)->format('d-m-Y') : "-");
        $template->setValue('jenis_kelamin', $pegawai->jenis_kelamin ? Str::title($pegawai->jenis_kelamin) : "-");
        $template->setValue('agama', $pegawai->agama ? Str::title($pegawai->agama) : "-");
        $template->setValue('gol_darah', $pegawai->gol_darah ?? "-");
        $template->setValue('alamat', $pegawai->alamat ? Str::title($pegawai->alamat) : "-");
        $template->setValue('status_perkawinan', $pegawai->status_perkawinan ? Str::title($pegawai->status_perkawinan) : "-");
        $template->setValue('rt', $pegawai->rt ?? "-");
        $template->setValue('rw', $pegawai->rw ?? "-");
        $template->setValue('kecamatan', $pegawai->kecamatan ? Str::title($pegawai->kecamatan) : "-");
        $template->setValue('kelurahan', $pegawai->kelurahan ? Str::title($pegawai->kelurahan) : "-");
        $template->setValue('kota', $pegawai->kota ? Str::title($pegawai->kota) : "-");
        $template->setValue('department', $pegawai->department ? Str::title($pegawai->department->DeptName) : "-");
        $template->setValue('jabatan', $pegawai->jabatan ? Str::title($pegawai->jabatan->nama) : "-");
        $template->setValue('shift', $pegawai->shift ? Str::title($jadwal) . ' ' .  Carbon::parse($pegawai->shift?->jam_masuk)->format('H:i') . ' s.d ' . Carbon::parse($pegawai->shift?->jam_keluar)->format("H:i") : "-");
        $template->setValue('korlap', $pegawai->korlap ? Str::title($pegawai->korlap->nama) : "-");
        $template->setValue('rute_kerja', $pegawai->rute_kerja ?? "-");

        if (!empty($pegawai->upload_ktp)) {
            $pathKtp = Storage::disk('local')->path($pegawai->upload_ktp);

            if (file_exists($pathKtp)) {
                $template->setImageValue('ktp', [
                    'path' => $pathKtp,
                    'width' => 323,  // 3 cm
                    'height' => 204, // 4 cm
                    'ratio' => false // set true jika ingin maintain aspect ratio
                ]);
            } else {
                $template->setValue('ktp', 'Tidak ada gambar');
            }
        } else {
            $template->setValue('ktp', 'Tidak ada gambar');
        }

        if (!empty($pegawai->upload_pas_foto)) {
            $pathPasFoto = Storage::disk('local')->path($pegawai->upload_pas_foto);

            if (file_exists($pathPasFoto)) {
                $template->setImageValue('pas_foto', [
                    'path' => $pathPasFoto,
                    'width' => 3 * 360000 / 9525,  // 3 cm = ~113.39
                    'height' => 4 * 360000 / 9525,
                    'ratio' => false,
                ]);
            } else {
                $template->setValue('pas_foto', 'Tidak ada gambar');
            }
        } else {
            $template->setValue('pas_foto', 'Tidak ada gambar');
        }

        if (!empty($pegawai->foto_lapangan)) {
            $pathLapangan = Storage::disk('local')->path($pegawai->foto_lapangan);

            if (file_exists($pathLapangan)) {
                $template->setImageValue('foto_lapangan', [
                    'path' => $pathLapangan,
                    'width' => 323,
                    'height' => 204,
                    'ratio' => false,
                ]);
            } else {
                $template->setValue('foto_lapangan', 'Tidak ada gambar');
            }
        } else {
            $template->setValue('foto_lapangan', 'Tidak ada gambar');
        }

        $template->saveAs($docxOutput);

        $sofficePath = 'D:\\Aplikasi\\LibreOffice\\program\\soffice.exe';
        // $sofficePath = 'D:\\Aplikasi All\\LibreOffice\\program\\soffice.exe';

        if (!file_exists($sofficePath)) {
            throw new \RuntimeException('LibreOffice tidak ditemukan');
        }

        if (!file_exists($docxOutput)) {
            throw new \RuntimeException('File DOCX tidak berhasil dibuat');
        }

        // Gunakan shell_exec untuk konversi
        $command = sprintf(
            '"%s" --headless --convert-to pdf --outdir "%s" "%s" 2>&1',
            $sofficePath,
            $outputDir,
            $docxOutput
        );

        $output = shell_exec($command);

        // Tunggu file dibuat
        // sleep(2);

        $pdfPath = $outputDir . "/{$baseFileName}.pdf";

        if (!file_exists($pdfPath)) {
            // Coba cari file PDF yang baru dibuat
            $files = glob($outputDir . "/*.pdf");
            usort($files, function ($a, $b) {
                return filemtime($b) - filemtime($a);
            });

            if (count($files) > 0) {
                $pdfPath = $files[0];
            } else {
                if (file_exists($docxOutput)) {
                    unlink($docxOutput);
                }
                throw new \RuntimeException("File PDF tidak berhasil dibuat. Output: {$output}");
            }
        }

        // Hapus file DOCX
        if (file_exists($docxOutput)) {
            unlink($docxOutput);
        }

        // Tampilkan PDF di browser (inline)
        // return response()->file($pdfPath, [
        //     'Content-Type' => 'application/pdf',
        //     'Content-Disposition' => 'inline; filename="pegawai-' . $pegawai->id . '.pdf"'
        // ]);

        // Atau jika ingin auto delete file setelah ditampilkan (opsional):
        return response()->file($pdfPath)->deleteFileAfterSend(true);
    }

    public function fingerExport(Request $request)
    {
        return Excel::download(new FingerExport($request), $this->filename('log-kehadiran'));
    }

    public function kehadiranExport(Request $request, $name)
    {
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $exists = Kehadiran::with('pegawai')
            ->when($fromDate && $toDate, function ($data) use ($fromDate, $toDate) {
                $data->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate   . ' 23:59:59',
                ]);
            })->exists();

        if (! $exists) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data kehadiran untuk filter yang dipilih'
            ], 422);
        }

        return Excel::download(new KehadiranExport($request), $this->filename('kehadiran'));
    }

    public function kehadiranPerTanggalExport(Request $request)
    {
        return Excel::download(new KehadiranPerTanggalExport($request), $this->filename('kehadiran-per-tanggal'));
    }

    public function rekapTanggalHadirExport(Request $request)
    {
        return Excel::download(new RekapTanggalHadirExport($request), $this->filename('rekap-tanggal-hadir'));
    }

    public function spjUpahKerjaExport(Request $request)
    {
        return Excel::download(new SPJUpahKerjaExport($request), $this->fileName('spj_upah_kerja'));
    }
}
