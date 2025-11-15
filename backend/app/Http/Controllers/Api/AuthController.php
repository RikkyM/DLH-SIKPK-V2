<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Dotenv\Exception\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required',
            'password' => 'required'
        ]);

        try {
            if (Auth::attempt($validated)) {
                $request->session()->regenerate();
                return response()->json([
                    'message' => 'Login successful',
                    'user' => Auth::user()
                ]);
            }

            return response()->json([
                'message' => 'Username atau password yang Anda masukkan salah.'
            ], 401);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'message' => 'Terjadi gangguan pada server. Coba beberapa saat lagi.'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }
}
