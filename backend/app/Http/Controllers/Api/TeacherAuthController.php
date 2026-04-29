<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherAuthController extends Controller
{
    public function signup(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|integer',
            'email' => 'required|email',
            'phone' => 'required|string',
            'password' => 'required|string|min:4',
            'confirm_password' => 'required|string|same:password',
        ]);

        $teacher = DB::table('teachers')
            ->where('teacher_id', $request->teacher_id)
            ->where('email', $request->email)
            ->where('phone', $request->phone)
            ->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher information does not match admin records.'
            ], 422);
        }

        $existingAccount = DB::table('teacher_accounts')
            ->where('teacher_id', $request->teacher_id)
            ->orWhere('email', $request->email)
            ->exists();

        if ($existingAccount) {
            return response()->json([
                'success' => false,
                'message' => 'Account already exists for this teacher.'
            ], 422);
        }

        DB::table('teacher_accounts')->insert([
            'teacher_id' => $request->teacher_id,
            'email' => $request->email,
            'password' => $request->password,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Teacher account created successfully.'
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $account = DB::table('teacher_accounts')
            ->join('teachers', 'teacher_accounts.teacher_id', '=', 'teachers.teacher_id')
            ->where('teacher_accounts.email', $request->email)
            ->where('teacher_accounts.password', $request->password)
            ->select(
                'teachers.teacher_id',
                'teachers.name',
                'teachers.email',
                'teachers.phone',
                'teachers.shift',
                'teachers.subjects',
                'teachers.picture',
                'teachers.designation'
            )
            ->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'teacher' => $account
        ]);
    }
}