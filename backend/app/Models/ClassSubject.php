<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassSubject extends Model
{
    protected $table = 'class_subjects';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'class_id',
        'subject_id',
        'teacher_id',
    ];

    protected $casts = [
        'class_id' => 'integer',
        'subject_id' => 'integer',
        'teacher_id' => 'integer',
    ];
}