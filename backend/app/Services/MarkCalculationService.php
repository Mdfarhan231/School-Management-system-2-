<?php

namespace App\Services;

/**
 * MarkCalculationService
 *
 * Official school grading scale (marks out of 100):
 *
 *  Mark Range | Letter Grade | Grade Point
 *  -----------+--------------+------------
 *   80 – 100  |     A+       |    4.00
 *   75 –  79  |     A        |    3.75
 *   70 –  74  |     A-       |    3.50
 *   65 –  69  |     B+       |    3.25
 *   60 –  64  |     B        |    3.00
 *   55 –  59  |     B-       |    2.75
 *   50 –  54  |     C+       |    2.50
 *   45 –  49  |     C        |    2.25
 *   40 –  44  |     D        |    2.00
 *    0 –  39  |     F        |    0.00
 */
class MarkCalculationService
{
    public static function calculate(array $data): array
    {
        $written    = (float) ($data['written_mark']    ?? 0);
        $mcq        = (float) ($data['mcq_mark']        ?? 0);
        $practical  = (float) ($data['practical_mark']  ?? 0);
        $viva       = (float) ($data['viva_mark']       ?? 0);
        $assignment = (float) ($data['assignment_mark'] ?? 0);
        $classTest  = (float) ($data['class_test_mark'] ?? 0);

        $total = $written + $mcq + $practical + $viva + $assignment + $classTest;

        [$grade, $gradePoint, $isPass] = self::resolveGrade($total);

        return [
            'total_mark'  => round($total, 2),
            'grade'       => $grade,
            'grade_point' => $gradePoint,
            'is_pass'     => $isPass,
        ];
    }

    /**
     * Map a total mark to [letterGrade, gradePoint, isPassed].
     */
    private static function resolveGrade(float $total): array
    {
        return match (true) {
            $total >= 80 => ['A+', 4.00, true],
            $total >= 75 => ['A',  3.75, true],
            $total >= 70 => ['A-', 3.50, true],
            $total >= 65 => ['B+', 3.25, true],
            $total >= 60 => ['B',  3.00, true],
            $total >= 55 => ['B-', 2.75, true],
            $total >= 50 => ['C+', 2.50, true],
            $total >= 45 => ['C',  2.25, true],
            $total >= 40 => ['D',  2.00, true],
            default      => ['F',  0.00, false],
        };
    }
}