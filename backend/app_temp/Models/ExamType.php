<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamType extends Model
{
    protected $table = 'exam_types';

    protected $fillable = [
        'name',
    ];

    public function studentMarks(): HasMany
    {
        return $this->hasMany(StudentMark::class, 'exam_type_id');
    }

    public function markConfigs(): HasMany
    {
        return $this->hasMany(SubjectMarkConfig::class, 'exam_type_id');
    }
}