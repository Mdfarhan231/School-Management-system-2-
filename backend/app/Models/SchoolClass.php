<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SchoolClass extends Model
{
    protected $table = 'classes';

    protected $primaryKey = 'class_id';

    public $timestamps = false;

    protected $fillable = [
        'class_name',
    ];

    public static function normalizeName(string $name): string
    {
        return mb_convert_encoding(trim($name), 'UTF-8', 'UTF-8');
    }

    public static function nameExists(string $className, $ignoreClassId = null): bool
    {
        $query = self::query()
            ->whereRaw('LOWER(class_name) = LOWER(?)', [$className]);

        if ($ignoreClassId) {
            $query->where('class_id', '!=', $ignoreClassId);
        }

        return $query->exists();
    }

    public function dependencyList(): array
    {
        $dependencies = [];

        if (DB::table('students')->where('class_id', $this->class_id)->exists()) {
            $dependencies[] = 'students';
        }

        if (DB::table('class_subjects')->where('class_id', $this->class_id)->exists()) {
            $dependencies[] = 'subject mappings';
        }

        if (DB::table('exam_routines')->where('class_id', $this->class_id)->exists()) {
            $dependencies[] = 'exam routines';
        }

        if (DB::table('student_marks')->where('class_id', $this->class_id)->exists()) {
            $dependencies[] = 'student marks';
        }

        if (DB::table('student_attendances')->where('class_id', $this->class_id)->exists()) {
            $dependencies[] = 'student attendance records';
        }

        return $dependencies;
    }
}