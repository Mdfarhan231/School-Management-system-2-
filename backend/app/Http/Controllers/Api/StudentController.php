<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        try {
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

            $pictureUrl = null;

            if ($request->hasFile('picture')) {
                $file = $request->file('picture');

                $extension = $file->getClientOriginalExtension();
                $fileName = time() . '_' . uniqid() . '.' . $extension;
                $filePath = 'students/' . $fileName;

                $fileContent = file_get_contents($file->getRealPath());

                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . env('SUPABASE_KEY'),
                    'Content-Type' => $file->getMimeType(),
                ])->withBody($fileContent, $file->getMimeType())->put(
                    env('SUPABASE_URL') . '/storage/v1/object/' . env('SUPABASE_BUCKET') . '/' . $filePath
                );

                if ($response->failed()) {
                    Log::error('Student image upload failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Image upload failed',
                        'status' => $response->status(),
                    ], 500);
                }

                $pictureUrl = env('SUPABASE_URL') . '/storage/v1/object/public/' . env('SUPABASE_BUCKET') . '/' . $filePath;
            }

            $studentId = DB::table('students')->insertGetId([
                'name' => mb_convert_encoding(trim((string) $request->name), 'UTF-8', 'UTF-8'),
                'father_name' => $request->father_name ? mb_convert_encoding(trim((string) $request->father_name), 'UTF-8', 'UTF-8') : null,
                'mother_name' => $request->mother_name ? mb_convert_encoding(trim((string) $request->mother_name), 'UTF-8', 'UTF-8') : null,
                'phone' => $request->phone ? mb_convert_encoding(trim((string) $request->phone), 'UTF-8', 'UTF-8') : null,
                'address' => $request->address ? mb_convert_encoding(trim((string) $request->address), 'UTF-8', 'UTF-8') : null,
                'class_id' => $request->class_id,
                'shift' => mb_convert_encoding(trim((string) $request->shift), 'UTF-8', 'UTF-8'),
                'roll' => $request->roll,
                'section' => $section,
                'picture' => $pictureUrl,
                'created_at' => now(),
                'updated_at' => now(),
            ], 'student_id');

            return response()->json([
                'success' => true,
                'message' => 'Student added successfully',
                'student_id' => $studentId,
                'section' => $section,
                'picture' => $pictureUrl,
            ]);
        } catch (\Throwable $e) {
            Log::error('Student store failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Student add failed',
                'error' => $e->getMessage(),
            ], 500);
        }
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