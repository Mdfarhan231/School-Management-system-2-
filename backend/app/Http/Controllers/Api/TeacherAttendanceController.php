<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TeacherAttendanceController extends Controller
{
    public function studentsByClassShift(Request $request)
    {
        $request->validate([
            'class_id' => 'required|integer|exists:classes,class_id',
            'shift' => 'required|in:Morning,Day',
        ]);

        $students = DB::table('students')
            ->where('class_id', $request->class_id)
            ->where('shift', $request->shift)
            ->select('student_id', 'name', 'roll', 'shift')
            ->orderBy('roll')
            ->get();

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|integer|exists:teachers,teacher_id',
            'class_id' => 'required|integer|exists:classes,class_id',
            'shift' => 'required|in:Morning,Day',
            'attendance_date' => 'required|date',
            'timer_expired' => 'required|boolean',
            'attendance' => 'required|array|min:1',
            'attendance.*.student_id' => 'required|integer|exists:students,student_id',
            'attendance.*.status' => 'required|string|in:present,absent,late',
        ]);

        DB::beginTransaction();

        try {
            foreach ($request->attendance as $row) {
                $studentId = (int) $row['student_id'];
                $status = strtolower(trim($row['status']));

                if (!$request->timer_expired && !in_array($status, ['present', 'absent'], true)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Before timer ends, only present or absent is allowed.'
                    ], 422);
                }

                if ($request->timer_expired && $status !== 'late') {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'After timer ends, only late is allowed.'
                    ], 422);
                }

                $student = DB::table('students')
                    ->where('student_id', $studentId)
                    ->where('class_id', $request->class_id)
                    ->where('shift', $request->shift)
                    ->first();

                if (!$student) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Student does not belong to the selected class and shift.'
                    ], 422);
                }

                DB::table('student_attendances')->updateOrInsert(
                    [
                        'student_id' => $studentId,
                        'class_id' => $request->class_id,
                        'shift' => $request->shift,
                        'attendance_date' => $request->attendance_date,
                    ],
                    [
                        'teacher_id' => $request->teacher_id,
                        'status' => $status,
                        'marked_at' => Carbon::now('Asia/Dhaka')->format('H:i:s'),
                        'late_time' => $status === 'late'
                            ? Carbon::now('Asia/Dhaka')->format('H:i:s')
                            : null,
                        'updated_at' => now(),
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attendance saved successfully.'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function history(Request $request)
    {
        $query = DB::table('student_attendances')
            ->join('students', 'student_attendances.student_id', '=', 'students.student_id')
            ->join('classes', 'student_attendances.class_id', '=', 'classes.class_id')
            ->select(
                'student_attendances.id',
                'student_attendances.attendance_date',
                'student_attendances.status',
                'student_attendances.shift',
                'student_attendances.late_time',
                'students.student_id',
                'students.name',
                'students.roll',
                'classes.class_id',
                'classes.class_name'
            );

        if ($request->filled('class_id')) {
            $query->where('student_attendances.class_id', $request->class_id);
        }

        if ($request->filled('shift')) {
            $query->where('student_attendances.shift', $request->shift);
        }

        if ($request->filled('roll')) {
            $query->where('students.roll', $request->roll);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('student_attendances.attendance_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('student_attendances.attendance_date', '<=', $request->date_to);
        }

        $history = $query
            ->orderBy('student_attendances.attendance_date', 'desc')
            ->orderBy('students.roll')
            ->get()
            ->map(function ($row) {
                if ($row->late_time) {
                    $row->late_time = Carbon::createFromFormat('H:i:s', $row->late_time, 'Asia/Dhaka')
                        ->format('h:i A');
                }

                return $row;
            });

        return response()->json($history);
    }

    public function studentHistory($studentId)
    {
        $student = DB::table('students')->where('student_id', $studentId)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found.'
            ], 404);
        }

        $history = DB::table('student_attendances')
            ->join('classes', 'student_attendances.class_id', '=', 'classes.class_id')
            ->where('student_attendances.student_id', $studentId)
            ->where('student_attendances.class_id', $student->class_id)
            ->where('student_attendances.shift', $student->shift)
            ->select(
                'student_attendances.id',
                'student_attendances.attendance_date',
                'student_attendances.status',
                'student_attendances.shift',
                'student_attendances.late_time',
                'classes.class_name'
            )
            ->orderBy('student_attendances.attendance_date', 'desc')
            ->get()
            ->map(function ($row) {
                if ($row->late_time) {
                    $row->late_time = Carbon::createFromFormat('H:i:s', $row->late_time, 'Asia/Dhaka')
                        ->format('h:i A');
                }

                return $row;
            });

        return response()->json($history);
    }
}