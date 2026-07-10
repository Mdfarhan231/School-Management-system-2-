<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $table = 'subjects';

    protected $primaryKey = 'subject_id';

    public $timestamps = true;

    protected $fillable = [
        'subject_name',
        'subject_code',
    ];

    public static function normalizeName(string $name): string
    {
        return mb_convert_encoding(trim($name), 'UTF-8', 'UTF-8');
    }

    public static function normalizeCode(string $code): string
    {
        return mb_convert_encoding(strtoupper(trim($code)), 'UTF-8', 'UTF-8');
    }

    public static function nameExists(string $subjectName, $ignoreSubjectId = null): bool
    {
        $query = self::query()
            ->whereRaw('LOWER(subject_name) = LOWER(?)', [$subjectName]);

        if ($ignoreSubjectId) {
            $query->where('subject_id', '!=', $ignoreSubjectId);
        }

        return $query->exists();
    }

    public static function codeExists(string $subjectCode, $ignoreSubjectId = null): bool
    {
        $query = self::query()
            ->whereRaw('LOWER(subject_code) = LOWER(?)', [$subjectCode]);

        if ($ignoreSubjectId) {
            $query->where('subject_id', '!=', $ignoreSubjectId);
        }

        return $query->exists();
    }
}