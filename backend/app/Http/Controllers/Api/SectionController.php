<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSubject;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\SectionSubjectTeacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SectionController extends Controller
{
    public function index()
    {
        try {
            $sections = Section::query()
                ->leftJoin('classes', 'sections.class_id', '=', 'classes.class_id')
                ->select(
                    'sections.section_id',
                    'sections.class_id',
                    'sections.section_name',
                    'sections.student_limit',
                    'sections.created_at',
                    'sections.updated_at',
                    'classes.class_name'
                )
                ->orderBy('classes.class_id')
                ->orderBy('sections.section_name')
                ->get()
                ->map(function ($section) {
                    return $this->formatSection($section);
                });

            return response()->json([
                'success' => true,
                'sections' => $sections,
            ]);
        } catch (\Throwable $e) {
            Log::error('Section list failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load sections.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|integer|exists:classes,class_id',
            'section_name' => 'required|string|max:50',
            'student_limit' => 'required|integer|min:1|max:200',
            'subject_teachers' => 'nullable|array',
            'subject_teachers.*.subject_id' => 'required_with:subject_teachers|integer|exists:subjects,subject_id',
            'subject_teachers.*.teacher_id' => 'nullable|integer|exists:teachers,teacher_id',
        ]);

        DB::beginTransaction();

        try {
            $sectionName = Section::normalizeName($validated['section_name']);
            $classId = $validated['class_id'];

            if (Section::nameExistsForClass($classId, $sectionName)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This section already exists for the selected class.',
                ], 422);
            }

            $section = Section::create([
                'class_id' => $classId,
                'section_name' => $sectionName,
                'student_limit' => $validated['student_limit'],
            ]);

            $this->syncSectionSubjectTeachers(
                $section->section_id,
                $classId,
                $validated['subject_teachers'] ?? []
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Section created successfully.',
                'section' => $this->formatSection(
                    DB::table('sections')
                        ->leftJoin('classes', 'sections.class_id', '=', 'classes.class_id')
                        ->select(
                            'sections.section_id',
                            'sections.class_id',
                            'sections.section_name',
                            'sections.student_limit',
                            'sections.created_at',
                            'sections.updated_at',
                            'classes.class_name'
                        )
                        ->where('sections.section_id', $section->section_id)
                        ->first()
                ),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Section create failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Section create failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'class_id' => 'required|integer|exists:classes,class_id',
            'section_name' => 'required|string|max:50',
            'student_limit' => 'required|integer|min:1|max:200',
            'subject_teachers' => 'nullable|array',
            'subject_teachers.*.subject_id' => 'required_with:subject_teachers|integer|exists:subjects,subject_id',
            'subject_teachers.*.teacher_id' => 'nullable|integer|exists:teachers,teacher_id',
        ]);

        DB::beginTransaction();

        try {
            $section = Section::query()
                ->where('section_id', $id)
                ->first();

            if (!$section) {
                return response()->json([
                    'success' => false,
                    'message' => 'Section not found.',
                ], 404);
            }

            if ((int) $section->class_id !== (int) $validated['class_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parent class cannot be changed after section creation.',
                ], 422);
            }

            $sectionName = Section::normalizeName($validated['section_name']);

            if (Section::nameExistsForClass($section->class_id, $sectionName, $section->section_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Another section with this name already exists for this class.',
                ], 422);
            }

            $section->update([
                'section_name' => $sectionName,
                'student_limit' => $validated['student_limit'],
            ]);

            $this->syncSectionSubjectTeachers(
                $section->section_id,
                $section->class_id,
                $validated['subject_teachers'] ?? []
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Section updated successfully.',
                'section' => $this->formatSection(
                    DB::table('sections')
                        ->leftJoin('classes', 'sections.class_id', '=', 'classes.class_id')
                        ->select(
                            'sections.section_id',
                            'sections.class_id',
                            'sections.section_name',
                            'sections.student_limit',
                            'sections.created_at',
                            'sections.updated_at',
                            'classes.class_name'
                        )
                        ->where('sections.section_id', $section->section_id)
                        ->first()
                ),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Section update failed', [
                'section_id' => $id,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Section update failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $section = Section::query()
                ->where('section_id', $id)
                ->first();

            if (!$section) {
                return response()->json([
                    'success' => false,
                    'message' => 'Section not found.',
                ], 404);
            }

            $dependencies = [];

            if (Schema::hasColumn('students', 'section_id')) {
                if (DB::table('students')->where('section_id', $id)->exists()) {
                    $dependencies[] = 'students';
                }
            }

            if (Schema::hasColumn('student_attendances', 'section_id')) {
                if (DB::table('student_attendances')->where('section_id', $id)->exists()) {
                    $dependencies[] = 'student attendance records';
                }
            }

            if (Schema::hasColumn('student_marks', 'section_id')) {
                if (DB::table('student_marks')->where('section_id', $id)->exists()) {
                    $dependencies[] = 'student marks';
                }
            }

            if (!empty($dependencies)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This section cannot be deleted because it is already used in: ' . implode(', ', $dependencies) . '.',
                    'dependencies' => $dependencies,
                ], 409);
            }

            $section->delete();

            return response()->json([
                'success' => true,
                'message' => 'Section deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Section delete failed', [
                'section_id' => $id,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Section delete failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function syncSectionSubjectTeachers($sectionId, $classId, array $subjectTeachers): void
    {
        $validClassSubjectIds = ClassSubject::query()
            ->where('class_id', $classId)
            ->pluck('subject_id')
            ->map(fn ($value) => (int) $value)
            ->toArray();

        $classSubjectTeachers = ClassSubject::query()
            ->where('class_id', $classId)
            ->pluck('teacher_id', 'subject_id');

        SectionSubjectTeacher::query()
            ->where('section_id', $sectionId)
            ->delete();

        foreach ($subjectTeachers as $item) {
            $subjectId = isset($item['subject_id']) ? (int) $item['subject_id'] : null;
            $teacherId = $item['teacher_id'] ?? null;

            if (!$subjectId) {
                continue;
            }

            if (!in_array($subjectId, $validClassSubjectIds, true)) {
                throw new \Exception('One or more selected subjects are not mapped to this class.');
            }

            if (!$teacherId) {
                continue;
            }

            $classLevelTeacherId = $classSubjectTeachers[$subjectId] ?? null;

            if (!$classLevelTeacherId) {
                throw new \Exception('Assign a teacher to this subject in Manage Subjects first, then assign section-wise teacher.');
            }

            SectionSubjectTeacher::create([
                'section_id' => $sectionId,
                'subject_id' => $subjectId,
                'teacher_id' => $teacherId,
            ]);
        }
    }

    private function formatSection($section): array
    {
        $subjectTeachers = DB::table('section_subject_teachers')
            ->join('subjects', 'section_subject_teachers.subject_id', '=', 'subjects.subject_id')
            ->leftJoin('teachers', 'section_subject_teachers.teacher_id', '=', 'teachers.teacher_id')
            ->where('section_subject_teachers.section_id', $section->section_id)
            ->select(
                'section_subject_teachers.id',
                'section_subject_teachers.section_id',
                'section_subject_teachers.subject_id',
                'section_subject_teachers.teacher_id',
                'subjects.subject_name',
                'subjects.subject_code',
                'teachers.name as teacher_name',
                'teachers.email as teacher_email'
            )
            ->orderBy('subjects.subject_id')
            ->get();

        return [
            'section_id' => $section->section_id,
            'id' => $section->section_id,
            'class_id' => $section->class_id,
            'class_name' => $section->class_name ?? null,
            'section_name' => $section->section_name,
            'name' => $section->section_name,
            'student_limit' => $section->student_limit,
            'studentLimit' => $section->student_limit,
            'created_at' => $section->created_at ?? null,
            'updated_at' => $section->updated_at ?? null,
            'subject_teachers' => $subjectTeachers,
        ];
    }
}