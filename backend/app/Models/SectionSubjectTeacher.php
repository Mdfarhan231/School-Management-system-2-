<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SectionSubjectTeacher extends Model
{
    protected $table = 'section_subject_teachers';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'section_id',
        'subject_id',
        'teacher_id',
    ];

    protected $casts = [
        'section_id' => 'integer',
        'subject_id' => 'integer',
        'teacher_id' => 'integer',
    ];
}