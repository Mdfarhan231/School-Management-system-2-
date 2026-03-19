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
            $teachers = DB::table('teachers')->get();

            return response()->json($teachers);
        } catch (\Throwable $e) {
            Log::error('Teacher index failed', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teachers',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'email' => 'required|string',
                'phone' => 'required|string',
                'shift' => 'nullable|string',
                'subjects' => 'required|string',
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

            $id = DB::table('teachers')->insertGetId([
                'name' => mb_convert_encoding(trim((string) $request->name), 'UTF-8', 'UTF-8'),
                'email' => mb_convert_encoding(trim((string) $request->email), 'UTF-8', 'UTF-8'),
                'phone' => mb_convert_encoding(trim((string) $request->phone), 'UTF-8', 'UTF-8'),
                'shift' => $request->shift ? mb_convert_encoding(trim((string) $request->shift), 'UTF-8', 'UTF-8') : null,
                'subjects' => mb_convert_encoding(trim((string) $request->subjects), 'UTF-8', 'UTF-8'),
                'picture' => $pictureUrl,
            ], 'teacher_id');

            return response()->json([
                'success' => true,
                'teacher_id' => $id,
                'picture' => $pictureUrl,
            ]);
        } catch (\Throwable $e) {
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