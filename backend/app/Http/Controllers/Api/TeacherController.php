<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class TeacherController extends Controller
{
    // Get all teachers
    public function index()
    {
        $teachers = DB::table('teachers')->get();
        return response()->json($teachers);
    }

    // Add teacher
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required',
            'phone' => 'required',
            'subjects' => 'required',
        ]);

        $pictureUrl = null;

        // ✅ Upload to Supabase Storage
        if ($request->hasFile('picture')) {

            $file = $request->file('picture');

            $extension = $file->getClientOriginalExtension();
            $fileName = time() . '_' . uniqid() . '.' . $extension;
            $filePath = 'teachers/' . $fileName;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('SUPABASE_KEY'),
                'Content-Type' => $file->getMimeType(),
            ])->put(
                env('SUPABASE_URL') . '/storage/v1/object/' . env('SUPABASE_BUCKET') . '/' . $filePath,
                file_get_contents($file)
            );

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image upload failed'
                ], 500);
            }

            // ✅ Public URL
            $pictureUrl = env('SUPABASE_URL') . '/storage/v1/object/public/' . env('SUPABASE_BUCKET') . '/' . $filePath;
        }

        $id = DB::table('teachers')->insertGetId([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'shift' => $request->shift,
            'subjects' => $request->subjects,
            'picture' => $pictureUrl // ✅ store full URL
        ]);

        return response()->json([
            'success' => true,
            'teacher_id' => $id
        ]);
    }

    // Delete teacher
    public function destroy($id)
    {
        DB::table('teachers')->where('teacher_id', $id)->delete();

        return response()->json([
            'success' => true
        ]);
    }
}