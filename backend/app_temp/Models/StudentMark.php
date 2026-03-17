<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentMark extends Model
{
    protected $table = 'student_marks';

    protected $fillable = [
        'student_id',
        'class_id',
        'subject_id',
        'exam_type_id',
        'teacher_id',
        'approved_by',
        'written_mark',
        'mcq_mark',
        'practical_mark',
        'viva_mark',
        'assignment_mark',
        'class_test_mark',
        'total_mark',
        'grade',
        'grade_point',
        'is_pass',
        'status',
        'teacher_submitted_at',
        'admin_approved_at',
        'admin_note',
    ];

    protected $casts = [
        'written_mark' => 'float',
        'mcq_mark' => 'float',
        'practical_mark' => 'float',
        'viva_mark' => 'float',
        'assignment_mark' => 'float',
        'class_test_mark' => 'float',
        'total_mark' => 'float',
        'grade_point' => 'float',
        'is_pass' => 'boolean',
        'teacher_submitted_at' => 'datetime',
        'admin_approved_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class, 'exam_type_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}