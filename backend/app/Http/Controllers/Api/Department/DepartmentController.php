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
                ->orderBy('DeptName', 'asc')
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
}
