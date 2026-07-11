<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TeacherController extends Controller
{
    public function index()
    {
        try {
            $teachers = DB::table('teachers')
                ->orderBy('teacher_id')
                ->get();

            $teacherIds = $teachers->pluck('teacher_id')->toArray();

            $interests = empty($teacherIds)
                ? collect()
                : DB::table('teacher_subject_interests')
                    ->join('subjects', 'teacher_subject_interests.subject_id', '=', 'subjects.subject_id')
                    ->whereIn('teacher_subject_interests.teacher_id', $teacherIds)
                    ->select(
                        'teacher_subject_interests.teacher_id',
                        'subjects.subject_id',
                        'subjects.subject_name',
                        'subjects.subject_code'
                    )
                    ->orderBy('subjects.subject_id')
                    ->get()
                    ->groupBy('teacher_id');

            $teachers = $teachers->map(function ($teacher) use ($interests) {
                $teacherInterests = $interests->get($teacher->teacher_id, collect());

                $teacher->interest_subject_ids = $teacherInterests
                    ->pluck('subject_id')
                    ->map(fn ($id) => (int) $id)
                    ->values();

                $teacher->interest_subjects = $teacherInterests
                    ->map(function ($item) {
                        return [
                            'subject_id' => $item->subject_id,
                            'subject_name' => $item->subject_name,
                            'subject_code' => $item->subject_code,
                        ];
                    })
                    ->values();

                return $teacher;
            });

            return response()->json($teachers);
        } catch (\Throwable $e) {
            Log::error('Teacher index failed', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teachers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $rawSubjectIds = $request->input('subject_ids', []);

            if (!is_array($rawSubjectIds)) {
                $decoded = json_decode($rawSubjectIds, true);

                if (is_array($decoded)) {
                    $rawSubjectIds = $decoded;
                } else {
                    $rawSubjectIds = explode(',', (string) $rawSubjectIds);
                }
            }

            $subjectIds = collect($rawSubjectIds)
                ->filter(fn ($id) => $id !== null && $id !== '' && is_numeric($id))
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values()
                ->toArray();

            $request->merge([
                'subject_ids' => $subjectIds,
            ]);

            $validated = $request->validate([
                'name' => 'required|string|max:150',
                'email' => 'required|string|email|max:150',
                'phone' => 'required|string|max:50',
                'shift' => 'nullable|string|max:50',
                'subject_ids' => 'required|array|min:1',
                'subject_ids.*' => 'integer|exists:subjects,subject_id',
                'designation' => 'nullable|string|max:100',
                'joiningDate' => 'nullable|date',
                'picture' => 'nullable|image|max:2048',
            ]);

            $pictureUrl = null;

            if ($request->hasFile('picture')) {
                $file = $request->file('picture');

                $extension = $file->getClientOriginalExtension();
                $fileName = time() . '_' . uniqid() . '.' . $extension;
                $filePath = 'teachers/' . $fileName;

                $fileContent = file_get_contents($file->getRealPath());

                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . env('SUPABASE_KEY'),
                    'Content-Type' => $file->getMimeType(),
                ])->withBody($fileContent, $file->getMimeType())->put(
                    env('SUPABASE_URL') . '/storage/v1/object/' . env('SUPABASE_BUCKET') . '/' . $filePath
                );

                if ($response->failed()) {
                    Log::error('Supabase upload failed', [
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

            $subjectNames = DB::table('subjects')
                ->whereIn('subject_id', $validated['subject_ids'])
                ->orderBy('subject_id')
                ->pluck('subject_name')
                ->toArray();

            DB::beginTransaction();

            $id = DB::table('teachers')->insertGetId([
                'name' => mb_convert_encoding(trim((string) $validated['name']), 'UTF-8', 'UTF-8'),
                'email' => mb_convert_encoding(trim((string) $validated['email']), 'UTF-8', 'UTF-8'),
                'phone' => mb_convert_encoding(trim((string) $validated['phone']), 'UTF-8', 'UTF-8'),
                'shift' => !empty($validated['shift'])
                    ? mb_convert_encoding(trim((string) $validated['shift']), 'UTF-8', 'UTF-8')
                    : null,
                'subjects' => mb_convert_encoding(implode(',', $subjectNames), 'UTF-8', 'UTF-8'),
                'designation' => !empty($validated['designation'])
                    ? mb_convert_encoding(trim((string) $validated['designation']), 'UTF-8', 'UTF-8')
                    : null,
                'joining_date' => $validated['joiningDate'] ?? null,
                'picture' => $pictureUrl,
            ], 'teacher_id');

            $interestRows = collect($validated['subject_ids'])
                ->map(function ($subjectId) use ($id) {
                    return [
                        'teacher_id' => $id,
                        'subject_id' => $subjectId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                })
                ->toArray();

            DB::table('teacher_subject_interests')->insert($interestRows);

            DB::commit();

            return response()->json([
                'success' => true,
                'teacher_id' => $id,
                'picture' => $pictureUrl,
                'interest_subject_ids' => $validated['subject_ids'],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Teacher store failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Teacher add failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::table('teachers')->where('teacher_id', $id)->delete();

            return response()->json([
                'success' => true,
            ]);
        } catch (\Throwable $e) {
            Log::error('Teacher delete failed', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Delete failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function testSupabaseUpload()
    {
        try {
            $content = 'hello from render';
            $fileName = 'teachers/test_' . time() . '.txt';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('SUPABASE_KEY'),
                'Content-Type' => 'text/plain',
            ])->put(
                env('SUPABASE_URL') . '/storage/v1/object/' . env('SUPABASE_BUCKET') . '/' . $fileName,
                $content
            );

            return response()->json([
                'success' => $response->successful(),
                'status' => $response->status(),
                'response_body' => $response->body(),
                'public_url' => env('SUPABASE_URL') . '/storage/v1/object/public/' . env('SUPABASE_BUCKET') . '/' . $fileName,
            ]);
        } catch (\Throwable $e) {
            Log::error('Supabase test upload failed', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}