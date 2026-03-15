<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentAuthController extends Controller
{
    public function signup(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'phone' => 'required|string',
            'roll' => 'required|integer',
            'password' => 'required|string|min:4',
            'confirm_password' => 'required|string|same:password',
        ]);

        $student = DB::table('students')
            ->where('student_id', $request->student_id)
            ->where('phone', $request->phone)
            ->where('roll', $request->roll)
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student information does not match admin records.'
            ], 422);
        }

        $existingAccount = DB::table('student_accounts')
            ->where('student_id', $request->student_id)
            ->exists();

        if ($existingAccount) {
            return response()->json([
                'success' => false,
                'message' => 'Account already exists for this student.'
            ], 422);
        }

        DB::table('student_accounts')->insert([
            'student_id' => $request->student_id,
            'password' => $request->password,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Student account created successfully.'
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'password' => 'required|string',
        ]);

        $student = DB::table('student_accounts')
            ->join('students', 'student_accounts.student_id', '=', 'students.student_id')
            ->join('classes', 'students.class_id', '=', 'classes.class_id')
            ->where('student_accounts.student_id', $request->student_id)
            ->where('student_accounts.password', $request->password)
            ->select(
                'students.student_id',
                'students.name',
                'students.father_name',
                'students.mother_name',
                'students.phone',
                'students.address',
                'students.shift',
                'students.roll',
                'students.section',
                'students.picture',
                'classes.class_id',
                'classes.class_name'
            )
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid student ID or password.'
            ], 401);
        }

        $subjects = DB::table('class_subjects')
            ->join('subjects', 'class_subjects.subject_id', '=', 'subjects.subject_id')
            ->where('class_subjects.class_id', $student->class_id)
            ->pluck('subjects.subject_name');

        $student->subjects = $subjects;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'student' => $student
        ]);
    }
}