<?php

namespace App\Http\Controllers\Api\Department;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        try {
            $departments = Departments::with('pegawai')
                ->select('DeptID', 'DeptName')
                ->where('DeptName', '!=', 'Our Company')
                ->orderBy('DeptID', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $departments,
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendapatkan data department'
            ]);
        }
    }

    public function unitKerja(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 25);
            $search  = $request->input('search');

            $datas = Departments::select('DeptID', 'DeptName')
                ->when($search, function ($data) use ($search) {
                    $data->where('DeptName', 'like', "%{$search}%");
                })->paginate($perPage);

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data unit kerja.'
            ]);
        }
    }
}
