<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 50);
            $search     = $request->input('search');

            $datas = User::with('department')
                ->when($search, function ($data) use ($search) {
                    $data->where('username', 'like', "%{$search}%");
                })
                ->paginate($perPage);

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data pengguna.'
            ]);
        }
    }
}
