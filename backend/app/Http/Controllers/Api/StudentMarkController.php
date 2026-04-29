<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentMarkController extends Controller
{
    public function studentsByClass($classId)
    {
        $students = DB::table('students')
            ->where('class_id', $classId)
            ->select('student_id', 'name', 'roll', 'section', 'shift')
            ->orderBy('shift')
            ->orderBy('roll')
            ->get();

        return response()->json($students);
    }

    public function marksByFilter(Request $request)
    {
        $request->validate([
            'exam_id' => 'required|integer',
            'class_id' => 'required|integer',
            'subject_id' => 'required|integer',
        ]);

        $marks = DB::table('student_marks')
            ->where('exam_id', $request->exam_id)
            ->where('class_id', $request->class_id)
            ->where('subject_id', $request->subject_id)
            ->get();

        return response()->json($marks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'exam_id' => 'required|integer|exists:exams,exam_id',
            'class_id' => 'required|integer|exists:classes,class_id',
            'subject_id' => 'required|integer|exists:subjects,subject_id',
            'student_id' => 'required|integer|exists:students,student_id',
            'teacher_id' => 'required|integer|exists:teachers,teacher_id',

            'written_marks' => 'nullable|numeric|min:0|max:70',
            'mcq_marks' => 'nullable|numeric|min:0|max:10',
            'practical_marks' => 'nullable|numeric|min:0|max:10',
            'viva_marks' => 'nullable|numeric|min:0|max:5',
            'assignment_marks' => 'nullable|numeric|min:0|max:5',
            'class_test_marks' => 'nullable|numeric|min:0|max:5',
        ]);

        $written = (int) ($request->written_marks ?? 0);
        $mcq = (int) ($request->mcq_marks ?? 0);
        $practical = (int) ($request->practical_marks ?? 0);
        $viva = (int) ($request->viva_marks ?? 0);
        $assignment = (int) ($request->assignment_marks ?? 0);
        $classTest = (int) ($request->class_test_marks ?? 0);

        $total = $written + $mcq + $practical + $viva + $assignment + $classTest;

        $grade = 'F';
        $gpa = 0.00;

        if ($total >= 80) {
            $grade = 'A+';
            $gpa = 5.00;
        } elseif ($total >= 70) {
            $grade = 'A';
            $gpa = 4.00;
        } elseif ($total >= 60) {
            $grade = 'A-';
            $gpa = 3.50;
        } elseif ($total >= 50) {
            $grade = 'B';
            $gpa = 3.00;
        } elseif ($total >= 40) {
            $grade = 'C';
            $gpa = 2.00;
        } elseif ($total >= 33) {
            $grade = 'D';
            $gpa = 1.00;
        }

        $exists = DB::table('student_marks')
            ->where('exam_id', $request->exam_id)
            ->where('student_id', $request->student_id)
            ->where('subject_id', $request->subject_id)
            ->first();

        if ($exists) {
            DB::table('student_marks')
                ->where('id', $exists->id)
                ->update([
                    'teacher_id' => $request->teacher_id,
                    'class_id' => $request->class_id,
                    'written_marks' => $written,
                    'mcq_marks' => $mcq,
                    'practical_marks' => $practical,
                    'viva_marks' => $viva,
                    'assignment_marks' => $assignment,
                    'class_test_marks' => $classTest,
                    'total_marks' => $total,
                    'grade' => $grade,
                    'gpa' => $gpa,
                    'status' => 'pending',
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('student_marks')->insert([
                'exam_id' => $request->exam_id,
                'student_id' => $request->student_id,
                'class_id' => $request->class_id,
                'subject_id' => $request->subject_id,
                'teacher_id' => $request->teacher_id,
                'written_marks' => $written,
                'mcq_marks' => $mcq,
                'practical_marks' => $practical,
                'viva_marks' => $viva,
                'assignment_marks' => $assignment,
                'class_test_marks' => $classTest,
                'total_marks' => $total,
                'grade' => $grade,
                'gpa' => $gpa,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Marks saved and sent for admin approval.'
        ]);
    }

    public function pendingMarks()
    {
        $marks = DB::table('student_marks')
            ->join('students', 'student_marks.student_id', '=', 'students.student_id')
            ->join('classes', 'student_marks.class_id', '=', 'classes.class_id')
            ->join('subjects', 'student_marks.subject_id', '=', 'subjects.subject_id')
            ->join('exams', 'student_marks.exam_id', '=', 'exams.exam_id')
            ->leftJoin('teachers', 'student_marks.teacher_id', '=', 'teachers.teacher_id')
            ->where('student_marks.status', 'pending')
            ->select(
                'student_marks.id',
                'student_marks.exam_id',
                'student_marks.class_id',
                'student_marks.subject_id',
                'student_marks.student_id',
                'student_marks.teacher_id',
                'student_marks.written_marks',
                'student_marks.mcq_marks',
                'student_marks.practical_marks',
                'student_marks.viva_marks',
                'student_marks.assignment_marks',
                'student_marks.class_test_marks',
                'student_marks.total_marks',
                'student_marks.grade',
                'student_marks.gpa',
                'student_marks.status',
                'student_marks.updated_at',
                'students.name as student_name',
                'students.roll',
                'students.section',
                'classes.class_name',
                'subjects.subject_name',
                'exams.exam_name',
                'teachers.name as teacher_name'
            )
            ->orderBy('student_marks.updated_at', 'desc')
            ->get();

        return response()->json($marks);
    }

    public function pendingSummary()
    {
        $baseQuery = DB::table('student_marks')
            ->join('classes', 'student_marks.class_id', '=', 'classes.class_id')
            ->join('subjects', 'student_marks.subject_id', '=', 'subjects.subject_id')
            ->leftJoin('teachers', 'student_marks.teacher_id', '=', 'teachers.teacher_id')
            ->where('student_marks.status', 'pending');

        $totalPending = (clone $baseQuery)->count();

        $recentPending = (clone $baseQuery)
            ->select(
                'student_marks.id',
                'student_marks.status',
                'student_marks.updated_at',
                'classes.class_name',
                'subjects.subject_name',
                'teachers.name as teacher_name'
            )
            ->orderBy('student_marks.updated_at', 'desc')
            ->limit(2)
            ->get();

        return response()->json([
            'success' => true,
            'total_pending' => $totalPending,
            'recent_pending' => $recentPending,
        ]);
    }

    public function approve($id)
    {
        $mark = DB::table('student_marks')->where('id', $id)->first();

        if (!$mark) {
            return response()->json([
                'success' => false,
                'message' => 'Mark record not found.'
            ], 404);
        }

        DB::table('student_marks')
            ->where('id', $id)
            ->update([
                'status' => 'approved',
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Marks approved successfully.'
        ]);
    }

    public function reject($id)
    {
        $mark = DB::table('student_marks')->where('id', $id)->first();

        if (!$mark) {
            return response()->json([
                'success' => false,
                'message' => 'Mark record not found.'
            ], 404);
        }

        DB::table('student_marks')
            ->where('id', $id)
            ->update([
                'status' => 'rejected',
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Marks rejected.'
        ]);
    }

    public function approveAll()
    {
        $count = DB::table('student_marks')
            ->where('status', 'pending')
            ->count();

        DB::table('student_marks')
            ->where('status', 'pending')
            ->update([
                'status' => 'approved',
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => "All {$count} pending marks approved."
        ]);
    }

    public function approvedResultsByStudent($studentId)
    {
        $results = DB::table('student_marks')
            ->join('subjects', 'student_marks.subject_id', '=', 'subjects.subject_id')
            ->join('exams', 'student_marks.exam_id', '=', 'exams.exam_id')
            ->join('classes', 'student_marks.class_id', '=', 'classes.class_id')
            ->where('student_marks.student_id', $studentId)
            ->where('student_marks.status', 'approved')
            ->select(
                'student_marks.id',
                'student_marks.student_id',
                'student_marks.written_marks',
                'student_marks.mcq_marks',
                'student_marks.practical_marks',
                'student_marks.viva_marks',
                'student_marks.assignment_marks',
                'student_marks.class_test_marks',
                'student_marks.total_marks',
                'student_marks.grade',
                'student_marks.gpa',
                'student_marks.status',
                'subjects.subject_name',
                'exams.exam_name',
                'classes.class_name'
            )
            ->orderBy('student_marks.exam_id')
            ->orderBy('subjects.subject_name')
            ->get();

        return response()->json($results);
    }
}