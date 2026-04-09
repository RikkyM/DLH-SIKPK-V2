<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 50);
            $search     = $request->input('search');

            $datas = User::with('department')
                ->when(Auth::user()->role !== 'superadmin', function ($data) {
                    $data->where('username', 'not like', '%superadmin%');
                })
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

    public function store(Request $request)
    {
        $payload = $request->validate([
            'id_department' => 'sometimes|nullable|numeric',
            'username'      => 'required|string',
            'role'          => 'required|string|in:superadmin,admin,operator,keuangan,viewer',
            'password'      => 'nullable|confirmed',
        ], [
            'username.required'  => 'Username wajib diisi.',
            'role.required'      => 'Role wajib diisi.',
            'role.in'            => 'Role tidak valid.',
            'password.confirmed' => 'Password konfirmasi tidak sama',
        ]);

        User::create($payload);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'id_department' => 'sometimes|nullable|numeric',
            'username'      => 'required|string',
            'role'          => 'required|string|in:superadmin,admin,operator,keuangan,viewer',
            'password'      => 'nullable|confirmed',
        ], [
            'username.required'  => 'Username wajib diisi.',
            'role.required'      => 'Role wajib diisi.',
            'role.in'            => 'Role tidak valid.',
            'password.confirmed' => 'Password konfirmasi tidak sama',
        ]);

        $user = User::findOrFail($id);

        $payload = Arr::only($validated, ['id_department', 'username', 'role']);
        $payload['id_department'] = $payload['id_department'] ?? null;

        if (!empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);

        return response()->json($request->all());

        // dd($);

        // dd($user);
    }
}
