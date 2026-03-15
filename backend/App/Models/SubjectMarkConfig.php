<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectMarkConfig extends Model
{
    protected $table = 'subject_mark_configs';

    protected $fillable = [
        'class_id',
        'subject_id',
        'exam_type_id',
        'written_full_mark',
        'mcq_full_mark',
        'practical_full_mark',
        'viva_full_mark',
        'assignment_full_mark',
        'class_test_full_mark',
        'total_full_mark',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class, 'exam_type_id');
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
}