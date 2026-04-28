<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NoticeController extends Controller
{
    public function index()
    {
        try {
            $notices = DB::table('notices')
                ->orderBy('created_at', 'desc')
                ->get();
                
            foreach ($notices as $notice) {
                // Parse PostgreSQL array string like "{Students,Teachers}" into an actual PHP array
                if (is_string($notice->target_audience)) {
                    $trimmed = trim($notice->target_audience, '{}');
                    // Ensure quotes are handled if any
                    $trimmed = str_replace('"', '', $trimmed);
                    $notice->targetAudience = $trimmed ? explode(',', $trimmed) : [];
                } else {
                    $notice->targetAudience = [];
                }
            }
            
            return response()->json($notices);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'category' => 'required|string',
            'priority' => 'required|string',
            'status' => 'required|string',
            'targetAudience' => 'nullable|array',
        ]);

        try {
            $audienceArray = $request->input('targetAudience', []);
            // Format for Postgres TEXT[]
            $pgArray = '{' . implode(',', $audienceArray) . '}';

            $id = (string) Str::uuid();

            DB::table('notices')->insert([
                'id' => $id,
                'title' => $request->title,
                'content' => $request->content,
                'category' => $request->category,
                'priority' => $request->priority,
                'status' => $request->status,
                'date' => $request->date ?? now(),
                'author' => $request->author ?? 'Admin',
                'target_audience' => $pgArray,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'message' => 'Notice created successfully',
                'id' => $id
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'category' => 'required|string',
            'priority' => 'required|string',
            'status' => 'required|string',
            'targetAudience' => 'nullable|array',
        ]);

        try {
            $audienceArray = $request->input('targetAudience', []);
            $pgArray = '{' . implode(',', $audienceArray) . '}';

            DB::table('notices')->where('id', $id)->update([
                'title' => $request->title,
                'content' => $request->content,
                'category' => $request->category,
                'priority' => $request->priority,
                'status' => $request->status,
                'date' => $request->date ?? now(),
                'author' => $request->author ?? 'Admin',
                'target_audience' => $pgArray,
                'updated_at' => now()
            ]);

            return response()->json([
                'message' => 'Notice updated successfully',
                'id' => $id
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::table('notices')->where('id', $id)->delete();
            return response()->json(['message' => 'Notice deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
