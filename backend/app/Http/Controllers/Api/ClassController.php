<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClassController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::query()
            ->select('class_id', 'class_name')
            ->orderBy('class_id')
            ->get();

        return response()->json($classes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_name' => 'required|string|max:100',
        ]);

        try {
            $className = SchoolClass::normalizeName($validated['class_name']);

            if (SchoolClass::nameExists($className)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This class already exists.',
                ], 422);
            }

            $schoolClass = SchoolClass::create([
                'class_name' => $className,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Class created successfully.',
                'class' => [
                    'class_id' => $schoolClass->class_id,
                    'class_name' => $schoolClass->class_name,
                ],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Class create failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Class create failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'class_name' => 'required|string|max:100',
        ]);

        try {
            $schoolClass = SchoolClass::query()
                ->where('class_id', $id)
                ->first();

            if (!$schoolClass) {
                return response()->json([
                    'success' => false,
                    'message' => 'Class not found.',
                ], 404);
            }

            $className = SchoolClass::normalizeName($validated['class_name']);

            if (SchoolClass::nameExists($className, $id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Another class with this name already exists.',
                ], 422);
            }

            $schoolClass->update([
                'class_name' => $className,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Class updated successfully.',
                'class' => [
                    'class_id' => $schoolClass->class_id,
                    'class_name' => $schoolClass->class_name,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Class update failed', [
                'class_id' => $id,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Class update failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $schoolClass = SchoolClass::query()
                ->where('class_id', $id)
                ->first();

            if (!$schoolClass) {
                return response()->json([
                    'success' => false,
                    'message' => 'Class not found.',
                ], 404);
            }

            $dependencies = $schoolClass->dependencyList();

            if (!empty($dependencies)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This class cannot be deleted because it is already used in: ' . implode(', ', $dependencies) . '.',
                    'dependencies' => $dependencies,
                ], 409);
            }

            $schoolClass->delete();

            return response()->json([
                'success' => true,
                'message' => 'Class deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Class delete failed', [
                'class_id' => $id,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Class delete failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}