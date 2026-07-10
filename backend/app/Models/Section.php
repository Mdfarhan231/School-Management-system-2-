<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $table = 'sections';

    protected $primaryKey = 'section_id';

    public $timestamps = true;

    protected $fillable = [
        'class_id',
        'section_name',
        'student_limit',
    ];

    protected $casts = [
        'class_id' => 'integer',
        'student_limit' => 'integer',
    ];

    public static function normalizeName(string $name): string
    {
        return mb_convert_encoding(strtoupper(trim($name)), 'UTF-8', 'UTF-8');
    }

    public static function nameExistsForClass($classId, string $sectionName, $ignoreSectionId = null): bool
    {
        $query = self::query()
            ->where('class_id', $classId)
            ->whereRaw('LOWER(section_name) = LOWER(?)', [$sectionName]);

        if ($ignoreSectionId) {
            $query->where('section_id', '!=', $ignoreSectionId);
        }

        return $query->exists();
    }
}