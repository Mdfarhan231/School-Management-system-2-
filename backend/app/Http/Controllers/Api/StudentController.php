<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    public function index()
    {
        try {
            $students = DB::table('students')
                ->join('classes', 'students.class_id', '=', 'classes.class_id')
                ->leftJoin('sections', 'students.section_id', '=', 'sections.section_id')
                ->select(
                    'students.student_id',
                    'students.name',
                    'students.father_name',
                    'students.mother_name',
                    'students.parents_phone',
                    'students.address',
                    'students.gender',
                    'students.dob',
                    'students.email',
                    'students.parent_name',
                    'students.phone',
                    'students.alt_phone',
                    'students.shift',
                    'students.roll',
                    'students.section',
                    'students.section_id',
                    'students.academic_session',
                    'students.picture',
                    'classes.class_id',
                    'classes.class_name',
                    'sections.section_name',
                    'sections.student_limit'
                )
                ->orderBy('classes.class_id')
                ->orderBy('sections.section_name')
                ->orderBy('students.roll')
                ->get();

            return response()->json([
                'success' => true,
                'students' => $students,
            ]);
        } catch (\Throwable $e) {
            Log::error('Student index failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch students.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'father_name' => 'required|string|max:100',
                'mother_name' => 'required|string|max:100',
                'parents_phone' => 'required|string|max:20',
                'address' => 'required|string',
                'gender' => 'nullable|in:Male,Female,Other',
                'dob' => 'nullable|date',
                'email' => 'nullable|email|max:150',

                'parent_name' => 'required|string|max:100',
                'phone' => 'required|string|max:20',
                'alt_phone' => 'nullable|string|max:20',

                'class_id' => 'required|integer|exists:classes,class_id',
                'section_id' => 'required|integer|exists:sections,section_id',
                'roll' => 'required|integer|min:1',
                'academic_session' => 'nullable|string|max:50',

                'picture' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
                'picture_url' => 'nullable|string',
            ]);

            $section = DB::table('sections')
                ->where('section_id', $validated['section_id'])
                ->where('class_id', $validated['class_id'])
                ->first();

            if (!$section) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected section does not belong to the selected class.',
                ], 422);
            }

            $rollQuery = DB::table('students')
                ->where('class_id', $validated['class_id'])
                ->where('section_id', $validated['section_id'])
                ->where('roll', $validated['roll']);

            if (!empty($validated['academic_session'])) {
                $rollQuery->where('academic_session', $validated['academic_session']);
            }

            if ($rollQuery->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This roll number is already taken for the selected class and section.',
                ], 422);
            }

            if (!empty($section->student_limit)) {
                $capacityQuery = DB::table('students')
                    ->where('class_id', $validated['class_id'])
                    ->where('section_id', $validated['section_id']);

                if (!empty($validated['academic_session'])) {
                    $capacityQuery->where('academic_session', $validated['academic_session']);
                }

                $currentCount = $capacityQuery->count();

                if ($currentCount >= (int) $section->student_limit) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This section has reached its student limit.',
                    ], 422);
                }
            }

            $pictureUrl = $validated['picture_url'] ?? null;

            if ($request->hasFile('picture')) {
                $pictureUrl = $this->uploadStudentPicture($request->file('picture'));
            }

            $studentId = DB::table('students')->insertGetId([
                'name' => $this->clean($validated['name']),
                'father_name' => $this->clean($validated['father_name']),
                'mother_name' => $this->clean($validated['mother_name']),
                'parents_phone' => $this->clean($validated['parents_phone']),
                'address' => $this->clean($validated['address']),

                'gender' => $validated['gender'] ?? null,
                'dob' => $validated['dob'] ?? null,
                'email' => !empty($validated['email']) ? $this->clean($validated['email']) : null,

                'parent_name' => $this->clean($validated['parent_name']),
                'phone' => $this->clean($validated['phone']),
                'alt_phone' => !empty($validated['alt_phone']) ? $this->clean($validated['alt_phone']) : null,

                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'],
                'section' => $section->section_name,
                'roll' => $validated['roll'],
                'academic_session' => $validated['academic_session'] ?? null,

                'shift' => null,
                'picture' => $pictureUrl,

                'created_at' => now(),
                'updated_at' => now(),
            ], 'student_id');

            return response()->json([
                'success' => true,
                'message' => 'Student added successfully.',
                'student_id' => $studentId,
                'section_id' => $validated['section_id'],
                'section' => $section->section_name,
                'picture' => $pictureUrl,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Student store failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Student add failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $student = DB::table('students')
                ->where('student_id', $id)
                ->first();

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found.',
                ], 404);
            }

            DB::table('students')
                ->where('student_id', $id)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Student delete failed', [
                'student_id' => $id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Delete failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function uploadStudentPicture($file): string
    {
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

            throw new \Exception('Image upload failed.');
        }

        return env('SUPABASE_URL') . '/storage/v1/object/public/' . env('SUPABASE_BUCKET') . '/' . $filePath;
    }

    private function clean($value): string
    {
        return mb_convert_encoding(trim((string) $value), 'UTF-8', 'UTF-8');
    }
}