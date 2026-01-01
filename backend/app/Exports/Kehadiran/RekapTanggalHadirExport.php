<?php

namespace App\Exports\Kehadiran;

use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RekapTanggalHadirExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithEvents
{

    private Request $request;

    private Carbon $from;
    private Carbon $to;

    /** @var Carbon[] */
    private array $dates = [];

    /** @var array<int, array<string, array{masuk:string, pulang:string}>> */
    private array $absensi = [];

    /** @var array<int,int> */
    private array $jumlahHariKerja = [];

    private int $no = 0;
    private int $parafsCols = 1;

    public function __construct(Request $request)
    {
        $this->request = $request;

        // WIB biar konsisten
        $tz = 'Asia/Jakarta';

        $fromDate = $request->input('from_date');
        $toDate   = $request->input('to_date');

        if (!$fromDate && !$toDate) {
            $this->to   = Carbon::today($tz)->startOfDay();
            $this->from = (clone $this->to)->subDays(6)->startOfDay();
        } else {
            if ($fromDate && $toDate) {
                $this->from = Carbon::parse($fromDate, $tz)->startOfDay();
                $this->to   = Carbon::parse($toDate, $tz)->startOfDay();
            } elseif ($fromDate && !$toDate) {
                $this->from = Carbon::parse($fromDate, $tz)->startOfDay();
                $this->to   = (clone $this->from);
            } else { // !$fromDate && $toDate
                $this->to   = Carbon::parse($toDate, $tz)->startOfDay();
                $this->from = (clone $this->to);
            }
        }

        if ($this->from->gt($this->to)) {
            [$this->from, $this->to] = [$this->to, $this->from];
        }

        $diffDays = $this->from->diffInDays($this->to);
        if ($diffDays > 30) {
            abort(422, 'Rentang tanggal maksimal 30 hari.');
        }

        // build dates list (inklusif)
        $cursor = $this->from->copy();
        while ($cursor->lte($this->to)) {
            $this->dates[] = $cursor->copy();
            $cursor->addDay();
        }
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection(): Collection
    {
        $perPage    = (int) $this->request->input('per_page', 50); // tidak dipakai di export, tapi aman
        $search     = $this->request->input('search');
        $department = $this->request->input('department');
        $jabatan    = $this->request->input('jabatan');
        $shift      = $this->request->input('shift');
        $korlap     = $this->request->input('korlap');

        $canSeeAll = in_array(Auth::user()->role, ['superadmin', 'admin', 'keuangan', 'viewer'], true);

        $datas = Pegawai::with([
            'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
            'kehadirans' => fn($q) => $q
                ->whereBetween('check_time', [
                    $this->from->copy()->startOfDay(),
                    $this->to->copy()->endOfDay(),
                ])
                ->orderBy('check_time'),
            'shift',
            'jabatan',
        ])
            ->where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', '%admin%');
            })
            ->when(
                empty($department) || (int) $department !== 23,
                fn($data) => $data->where('id_department', '!=', 23)
            )
            ->when(!$canSeeAll, fn($data) => $data->where('id_department', Auth::user()->id_department))
            ->when(!empty($department) && $canSeeAll, fn($data) => $data->where('id_department', $department))
            ->when(!empty($jabatan), fn($data) => $data->where('id_penugasan', $jabatan))
            ->when(!empty($shift), fn($data) => $data->where('id_shift', $shift))
            ->when(!empty($korlap), fn($data) => $data->where('id_korlap', $korlap))
            ->when($search, function ($data) use ($search) {
                $data->where(function ($d) use ($search) {
                    $d->where('nama', 'like', "%{$search}%")
                        ->orWhere('badgenumber', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama', 'asc')
            ->get();

        // Build lookup absensi + hitung jumlah hari kerja
        foreach ($datas as $p) {
            $pid = (int) $p->id;

            // init default
            foreach ($this->dates as $d) {
                $k = $d->format('Y-m-d');
                $this->absensi[$pid][$k] = ['masuk' => '-', 'pulang' => '-'];
            }

            // isi dari kehadirans
            foreach ($p->kehadirans as $h) {
                $tgl = Carbon::parse($h->check_time)->format('Y-m-d');
                if (!isset($this->absensi[$pid][$tgl])) continue;

                $time = Carbon::parse($h->check_time)->format('H:i');

                // Sesuaikan check_type kamu:
                // biasanya "I" untuk masuk, "O" untuk pulang.
                $type = (int) $h->check_type; // 0 masuk, 1 pulang

                if ($type === 0) {
                    $curr = $this->absensi[$pid][$tgl]['masuk'];
                    if ($curr === '-' || $time < $curr) {
                        $this->absensi[$pid][$tgl]['masuk'] = $time;
                    }
                }

                if (
                    $type === 1
                ) {
                    $curr = $this->absensi[$pid][$tgl]['pulang'];
                    if ($curr === '-' || $time > $curr) {
                        $this->absensi[$pid][$tgl]['pulang'] = $time;
                    }
                }
            }

            // jumlah hari kerja: minimal salah satu tidak '-'
            $count = 0;
            foreach ($this->dates as $d) {
                $k = $d->format('Y-m-d');
                $m = $this->absensi[$pid][$k]['masuk'] ?? '-';
                $o = $this->absensi[$pid][$k]['pulang'] ?? '-';
                if ($m !== '-' || $o !== '-') $count++;
            }
            $this->jumlahHariKerja[$pid] = $count;
        }

        return $datas;
    }


    public function headings(): array
    {
        // row 1
        $h1 = ['#', 'NIK', 'Nama Lengkap', 'Unit Kerja', 'Penugasan', "Jumlah\nHari\nKerja"];
        foreach ($this->dates as $d) {
            $h1[] = $d->translatedFormat('d M Y');
            $h1[] = '';
        }

        $h1[] = 'Paraf';

        // row 2
        $h2 = ['', '', '', '', '', ''];
        foreach ($this->dates as $d) {
            $h2[] = 'Masuk';
            $h2[] = 'Pulang';
        }

        $h2[] = '';

        return [$h1, $h2];
    }

    public function map($p): array
    {
        $this->no++;
        $pid = (int) $p->id;

        $unitKerja = $p->department->DeptName ?? '-';

        // sesuaikan nama field di relasi jabatan/penugasan kamu
        $penugasan = $p->jabatan->nama
            ?? $p->jabatan->PenugasanName
            ?? '-';

        $row = [
            $this->no,
            (string) ("'" . $p->badgenumber ?? '-'),
            (string) ($p->nama ?? '-'),
            (string) $unitKerja,
            (string) $penugasan,
            (int) ($this->jumlahHariKerja[$pid] ?? 0),
        ];

        foreach ($this->dates as $d) {
            $k = $d->format('Y-m-d');
            $row[] = $this->absensi[$pid][$k]['masuk'] ?? '-';
            $row[] = $this->absensi[$pid][$k]['pulang'] ?? '-';
        }

        $row[] = '';

        return $row;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // freeze header 2 baris
                $sheet->freezePane('A3');

                // merge kolom tetap (A-F) row 1-2
                foreach (['A', 'B', 'C', 'D', 'E', 'F'] as $c) {
                    $sheet->mergeCells("{$c}1:{$c}2");
                }

                // merge tanggal (mulai kolom G = 7)
                $startCol = 7;
                $col = $startCol;
                foreach ($this->dates as $d) {
                    $from = $this->colLetter($col) . '1';
                    $to   = $this->colLetter($col + 1) . '1';
                    $sheet->mergeCells("{$from}:{$to}");
                    $col += 2;
                }

                $lastCol = $this->colLetter(6 + (count($this->dates) * 2) + 1);
                $headerRange = "A1:{$lastCol}2";

                $parafCol = $lastCol;
                $sheet->mergeCells("{$parafCol}1:{$parafCol}2");
                $sheet->getColumnDimension($parafCol)->setWidth(18);

                // style header
                $sheet->getStyle($headerRange)->getFont()->setBold(true);
                $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle($headerRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle($headerRange)->getAlignment()->setWrapText(true);

                $sheet->getStyle('F1:F2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('F1:F2')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

                $sheet->getRowDimension(1)->setRowHeight(22);
                $sheet->getRowDimension(2)->setRowHeight(20);

                // border seluruh tabel
                $lastRow = $sheet->getHighestRow();

                $sheet->getStyle("F3:F{$lastRow}")
                ->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle("F3:F{$lastRow}")
                ->getAlignment()
                ->setVertical(Alignment::VERTICAL_CENTER);

                $tableRange = "A1:{$lastCol}{$lastRow}";
                $sheet->getStyle($tableRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            },
        ];
    }

    private function colLetter(int $colNumber): string
    {
        $letter = '';
        while ($colNumber > 0) {
            $temp = ($colNumber - 1) % 26;
            $letter = chr($temp + 65) . $letter;
            $colNumber = (int)(($colNumber - $temp - 1) / 26);
        }
        return $letter;
    }
}
