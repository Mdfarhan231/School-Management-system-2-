<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSubject;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::query()
            ->select(
                'subject_id',
                'subject_name',
                'subject_code',
                'created_at',
                'updated_at'
            )
            ->orderBy('subject_id')
            ->get();

        return response()->json($subjects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_name' => 'required|string|max:100',
            'subject_code' => 'required|string|max:50',
        ]);

        try {
            $subjectName = Subject::normalizeName($validated['subject_name']);
            $subjectCode = Subject::normalizeCode($validated['subject_code']);

            if (Subject::nameExists($subjectName)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This subject name already exists.',
                ], 422);
            }

            if (Subject::codeExists($subjectCode)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This subject code already exists.',
                ], 422);
            }

            $subject = Subject::create([
                'subject_name' => $subjectName,
                'subject_code' => $subjectCode,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subject created successfully.',
                'subject' => [
                    'subject_id' => $subject->subject_id,
                    'subject_name' => $subject->subject_name,
                    'subject_code' => $subject->subject_code,
                    'created_at' => $subject->created_at,
                    'updated_at' => $subject->updated_at,
                ],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Subject create failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Subject create failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $subject = Subject::query()
                ->where('subject_id', $id)
                ->first();

            if (!$subject) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subject not found.',
                ], 404);
            }

            $dependencies = [];

            if (DB::table('class_subjects')->where('subject_id', $id)->exists()) {
                $dependencies[] = 'class subject mappings';
            }

            if (DB::table('exam_routines')->where('subject_id', $id)->exists()) {
                $dependencies[] = 'exam routines';
            }

            if (DB::table('student_marks')->where('subject_id', $id)->exists()) {
                $dependencies[] = 'student marks';
            }

            if (!empty($dependencies)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This subject cannot be deleted because it is already used in: ' . implode(', ', $dependencies) . '.',
                    'dependencies' => $dependencies,
                ], 409);
            }

            $subject->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subject deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Subject delete failed', [
                'subject_id' => $id,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Subject delete failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

  public function classSubjects($classId)
{
    $class = \App\Models\SchoolClass::query()
        ->where('class_id', $classId)
        ->first();

    if (!$class) {
        return response()->json([
            'success' => false,
            'message' => 'Class not found.',
        ], 404);
    }

    $subjects = \Illuminate\Support\Facades\DB::table('class_subjects')
        ->join('subjects', 'class_subjects.subject_id', '=', 'subjects.subject_id')
        ->leftJoin('teachers', 'class_subjects.teacher_id', '=', 'teachers.teacher_id')
        ->where('class_subjects.class_id', $classId)
        ->select(
            'class_subjects.id as class_subject_id',
            'class_subjects.class_id',
            'class_subjects.subject_id',
            'class_subjects.teacher_id',
            'subjects.subject_name',
            'subjects.subject_code',
            'teachers.name as teacher_name',
            'teachers.email as teacher_email'
        )
        ->orderBy('subjects.subject_id')
        ->get()
        ->map(function ($item) {
            $hasTeacher = !empty($item->teacher_id);

            $item->teacher_status = $hasTeacher ? 'assigned' : 'not_assigned';
            $item->teacher_label = $hasTeacher
                ? $item->teacher_name
                : 'No teacher assigned yet';

            $item->available_teachers = $hasTeacher
                ? [[
                    'teacher_id' => $item->teacher_id,
                    'name' => $item->teacher_name,
                    'email' => $item->teacher_email,
                ]]
                : [];

            return $item;
        });

    return response()->json([
        'success' => true,
        'message' => $subjects->count() > 0
            ? 'Class subjects loaded successfully.'
            : 'Create subject first.',
        'subjects' => $subjects,
    ]);
}
    public function assignSubjectToClass(Request $request, $classId)
    {
        $validated = $request->validate([
            'subject_id' => 'required|integer|exists:subjects,subject_id',
            'teacher_id' => 'nullable|integer|exists:teachers,teacher_id',
        ]);

        try {
            $class = SchoolClass::query()
                ->where('class_id', $classId)
                ->first();

            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Class not found.',
                ], 404);
            }

            $exists = ClassSubject::query()
                ->where('class_id', $classId)
                ->where('subject_id', $validated['subject_id'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'This subject is already assigned to this class.',
                ], 422);
            }

            $mapping = ClassSubject::create([
                'class_id' => $classId,
                'subject_id' => $validated['subject_id'],
                'teacher_id' => $validated['teacher_id'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subject assigned to class successfully.',
                'mapping' => [
                    'id' => $mapping->id,
                    'class_id' => $mapping->class_id,
                    'subject_id' => $mapping->subject_id,
                    'teacher_id' => $mapping->teacher_id,
                    'created_at' => $mapping->created_at,
                    'updated_at' => $mapping->updated_at,
                ],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Class subject assign failed', [
                'class_id' => $classId,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Subject assignment failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateClassSubjectTeacher(Request $request, $classId, $subjectId)
    {
        $validated = $request->validate([
            'teacher_id' => 'nullable|integer|exists:teachers,teacher_id',
        ]);

        try {
            $mapping = ClassSubject::query()
                ->where('class_id', $classId)
                ->where('subject_id', $subjectId)
                ->first();

            if (!$mapping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Class subject mapping not found.',
                ], 404);
            }

            $mapping->update([
                'teacher_id' => $validated['teacher_id'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Teacher assignment updated successfully.',
                'mapping' => [
                    'id' => $mapping->id,
                    'class_id' => $mapping->class_id,
                    'subject_id' => $mapping->subject_id,
                    'teacher_id' => $mapping->teacher_id,
                    'created_at' => $mapping->created_at,
                    'updated_at' => $mapping->updated_at,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Teacher assignment update failed', [
                'class_id' => $classId,
                'subject_id' => $subjectId,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Teacher assignment update failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function removeSubjectFromClass($classId, $subjectId)
    {
        try {
            $mapping = ClassSubject::query()
                ->where('class_id', $classId)
                ->where('subject_id', $subjectId)
                ->first();

            if (!$mapping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Class subject mapping not found.',
                ], 404);
            }

            $dependencies = [];

            if (
                DB::table('exam_routines')
                    ->where('class_id', $classId)
                    ->where('subject_id', $subjectId)
                    ->exists()
            ) {
                $dependencies[] = 'exam routines';
            }

            if (
                DB::table('student_marks')
                    ->where('class_id', $classId)
                    ->where('subject_id', $subjectId)
                    ->exists()
            ) {
                $dependencies[] = 'student marks';
            }

            if (!empty($dependencies)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This subject mapping cannot be removed because it is already used in: ' . implode(', ', $dependencies) . '.',
                    'dependencies' => $dependencies,
                ], 409);
            }

            $mapping->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subject removed from class successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Class subject remove failed', [
                'class_id' => $classId,
                'subject_id' => $subjectId,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Subject remove failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}