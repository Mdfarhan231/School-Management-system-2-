<?php

namespace App\Services;

class MarkCalculationService
{
    public static function calculate(array $data): array
    {
        $written = (float) ($data['written_mark'] ?? 0);
        $mcq = (float) ($data['mcq_mark'] ?? 0);
        $practical = (float) ($data['practical_mark'] ?? 0);
        $viva = (float) ($data['viva_mark'] ?? 0);
        $assignment = (float) ($data['assignment_mark'] ?? 0);
        $classTest = (float) ($data['class_test_mark'] ?? 0);

        $total = $written + $mcq + $practical + $viva + $assignment + $classTest;

        $grade = 'F';
        $gradePoint = 0.00;
        $isPass = false;

        if ($total >= 80) {
            $grade = 'A+';
            $gradePoint = 5.00;
            $isPass = true;
        } elseif ($total >= 70) {
            $grade = 'A';
            $gradePoint = 4.00;
            $isPass = true;
        } elseif ($total >= 60) {
            $grade = 'A-';
            $gradePoint = 3.50;
            $isPass = true;
        } elseif ($total >= 50) {
            $grade = 'B';
            $gradePoint = 3.00;
            $isPass = true;
        } elseif ($total >= 40) {
            $grade = 'C';
            $gradePoint = 2.00;
            $isPass = true;
        } elseif ($total >= 33) {
            $grade = 'D';
            $gradePoint = 1.00;
            $isPass = true;
        }

        return [
            'total_mark' => round($total, 2),
            'grade' => $grade,
            'grade_point' => $gradePoint,
            'is_pass' => $isPass,
        ];
    }
}