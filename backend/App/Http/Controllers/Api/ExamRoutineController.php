<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExamRoutineController extends Controller
{
    private function formatRoutineToDhaka($routine)
    {
        if ($routine->start_time && $routine->end_time) {
            $startUtc = Carbon::createFromFormat(
                'Y-m-d H:i:s',
                $routine->exam_date . ' ' . $routine->start_time,
                'UTC'
            );

            $endUtc = Carbon::createFromFormat(
                'Y-m-d H:i:s',
                $routine->exam_date . ' ' . $routine->end_time,
                'UTC'
            );

            $routine->exam_date = $startUtc
                ->copy()
                ->setTimezone('Asia/Dhaka')
                ->format('Y-m-d');

            $routine->start_time = $startUtc
                ->copy()
                ->setTimezone('Asia/Dhaka')
                ->format('h:i A');

            $routine->end_time = $endUtc
                ->copy()
                ->setTimezone('Asia/Dhaka')
                ->format('h:i A');
        }

        return $routine;
    }

    public function index()
    {
        $routines = DB::table('exam_routines')
            ->join('exams', 'exam_routines.exam_id', '=', 'exams.exam_id')
            ->join('classes', 'exam_routines.class_id', '=', 'classes.class_id')
            ->join('subjects', 'exam_routines.subject_id', '=', 'subjects.subject_id')
            ->select(
                'exam_routines.id',
                'exams.exam_name',
                'classes.class_name',
                'subjects.subject_name',
                'exam_routines.exam_date',
                'exam_routines.start_time',
                'exam_routines.end_time'
            )
            ->orderBy('exam_routines.exam_date')
            ->orderBy('exam_routines.start_time')
            ->get()
            ->map(fn ($routine) => $this->formatRoutineToDhaka($routine));

        return response()->json($routines);
    }

    public function store(Request $request)
    {
        $request->validate([
            'exam_id' => 'required|integer',
            'class_id' => 'required|integer',
            'subject_id' => 'required|integer',
            'exam_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $startUtc = Carbon::createFromFormat(
            'Y-m-d H:i',
            $request->exam_date . ' ' . $request->start_time,
            'Asia/Dhaka'
        )->setTimezone('UTC');

        $endUtc = Carbon::createFromFormat(
            'Y-m-d H:i',
            $request->exam_date . ' ' . $request->end_time,
            'Asia/Dhaka'
        )->setTimezone('UTC');

        DB::table('exam_routines')->insert([
            'exam_id' => $request->exam_id,
            'class_id' => $request->class_id,
            'subject_id' => $request->subject_id,
            'exam_date' => $startUtc->format('Y-m-d'),
            'start_time' => $startUtc->format('H:i:s'),
            'end_time' => $endUtc->format('H:i:s'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Exam routine added successfully'
        ]);
    }

    public function destroy($id)
    {
        DB::table('exam_routines')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Exam routine deleted'
        ]);
    }

    public function teacherRoutine($teacherId)
    {
        $teacher = DB::table('teachers')->where('teacher_id', $teacherId)->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher not found'
            ], 404);
        }

        $teacherSubjects = array_map('trim', explode(',', $teacher->subjects));

        $routines = DB::table('exam_routines')
            ->join('exams', 'exam_routines.exam_id', '=', 'exams.exam_id')
            ->join('classes', 'exam_routines.class_id', '=', 'classes.class_id')
            ->join('subjects', 'exam_routines.subject_id', '=', 'subjects.subject_id')
            ->whereIn('subjects.subject_name', $teacherSubjects)
            ->select(
                'exam_routines.id',
                'exams.exam_name',
                'classes.class_name',
                'subjects.subject_name',
                'exam_routines.exam_date',
                'exam_routines.start_time',
                'exam_routines.end_time'
            )
            ->orderBy('exam_routines.exam_date')
            ->orderBy('exam_routines.start_time')
            ->get()
            ->map(fn ($routine) => $this->formatRoutineToDhaka($routine));

        return response()->json($routines);
    }

    public function studentRoutine($studentId)
    {
        $student = DB::table('students')->where('student_id', $studentId)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $routines = DB::table('exam_routines')
            ->join('exams', 'exam_routines.exam_id', '=', 'exams.exam_id')
            ->join('classes', 'exam_routines.class_id', '=', 'classes.class_id')
            ->join('subjects', 'exam_routines.subject_id', '=', 'subjects.subject_id')
            ->where('exam_routines.class_id', $student->class_id)
            ->select(
                'exam_routines.id',
                'exams.exam_name',
                'classes.class_name',
                'subjects.subject_name',
                'exam_routines.exam_date',
                'exam_routines.start_time',
                'exam_routines.end_time'
            )
            ->orderBy('exam_routines.exam_date')
            ->orderBy('exam_routines.start_time')
            ->get()
            ->map(fn ($routine) => $this->formatRoutineToDhaka($routine));

        return response()->json($routines);
    }
}