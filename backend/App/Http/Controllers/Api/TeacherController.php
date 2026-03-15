<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $pictureName = null;

        if ($request->hasFile('picture')) {
            $picture = $request->file('picture');
            $pictureName = time().'_'.$picture->getClientOriginalName();
            $picture->move(public_path('teachers'), $pictureName);
        }

        $id = DB::table('teachers')->insertGetId([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'shift' => $request->shift,
            'subjects' => $request->subjects,
            'picture' => $pictureName
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