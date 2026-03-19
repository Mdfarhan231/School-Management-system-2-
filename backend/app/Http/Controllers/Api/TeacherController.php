<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = DB::table('teachers')->get();
        return response()->json($teachers);
    }

    public function store(Request $request)
    {
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

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('SUPABASE_KEY'),
                'Content-Type' => $file->getMimeType(),
            ])->put(
                env('SUPABASE_URL') . '/storage/v1/object/' . env('SUPABASE_BUCKET') . '/' . $filePath,
                file_get_contents($file->getRealPath())
            );

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image upload failed',
                    'error' => $response->body(),
                ], 500);
            }

            $pictureUrl = env('SUPABASE_URL') . '/storage/v1/object/public/' . env('SUPABASE_BUCKET') . '/' . $filePath;
        }

        $id = DB::table('teachers')->insertGetId([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'shift' => $request->shift,
            'subjects' => $request->subjects,
            'picture' => $pictureUrl,
        ], 'teacher_id');

        return response()->json([
            'success' => true,
            'teacher_id' => $id,
        ]);
    }

    public function destroy($id)
    {
        DB::table('teachers')->where('teacher_id', $id)->delete();

        return response()->json([
            'success' => true
        ]);
    }
}