<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function classes()
    {
        $classes = DB::table('classes')
            ->select('class_id', 'class_name')
            ->orderBy('class_id')
            ->get();

        return response()->json($classes);
    }

    public function classSubjects($id)
    {
        $subjects = DB::table('class_subjects')
            ->join('subjects', 'class_subjects.subject_id', '=', 'subjects.subject_id')
            ->where('class_subjects.class_id', $id)
            ->select('subjects.subject_id', 'subjects.subject_name')
            ->orderBy('subjects.subject_id')
            ->get();

        return response()->json($subjects);
    }

    public function index()
    {
        $students = DB::table('students')
            ->join('classes', 'students.class_id', '=', 'classes.class_id')
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
            ->orderBy('classes.class_id')
            ->orderBy('students.shift')
            ->orderBy('students.roll')
            ->get();

        foreach ($students as $student) {
            $subjectNames = DB::table('class_subjects')
                ->join('subjects', 'class_subjects.subject_id', '=', 'subjects.subject_id')
                ->where('class_subjects.class_id', $student->class_id)
                ->pluck('subjects.subject_name');

            $student->subjects = $subjectNames;
        }

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'father_name' => 'nullable|string|max:100',
            'mother_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'class_id' => 'required|integer|exists:classes,class_id',
            'shift' => 'required|in:Morning,Day',
            'roll' => 'required|integer|min:1|max:10',
            'picture' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $section = ($request->roll >= 1 && $request->roll <= 5) ? 'A' : 'B';

        $exists = DB::table('students')
            ->where('class_id', $request->class_id)
            ->where('shift', $request->shift)
            ->where('roll', $request->roll)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This roll is already taken for the selected class and shift.'
            ], 422);
        }

        $pictureName = null;

        if ($request->hasFile('picture')) {
            $picture = $request->file('picture');
            $pictureName = time() . '_' . $picture->getClientOriginalName();
            $picture->move(public_path('students'), $pictureName);
        }

        $studentId = DB::table('students')->insertGetId([
            'name' => $request->name,
            'father_name' => $request->father_name,
            'mother_name' => $request->mother_name,
            'phone' => $request->phone,
            'address' => $request->address,
            'class_id' => $request->class_id,
            'shift' => $request->shift,
            'roll' => $request->roll,
            'section' => $section,
            'picture' => $pictureName,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Student added successfully',
            'student_id' => $studentId,
            'section' => $section,
        ]);
    }

    public function destroy($id)
    {
        $student = DB::table('students')->where('student_id', $id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        DB::table('students')->where('student_id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully'
        ]);
    }
}