<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'password' => 'required|string',
            ]);

            $admin = DB::table('users')
                ->where('name', $request->name)
                ->where('password', $request->password)
                ->first();

            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid username or password'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'admin' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                ]
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}