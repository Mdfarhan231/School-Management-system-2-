<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherAuthController;
use App\Http\Controllers\Api\StudentAuthController;
use App\Http\Controllers\Api\ExamRoutineController;
use App\Http\Controllers\Api\StudentMarkController;
use App\Http\Controllers\Api\TeacherAttendanceController;

// use App\Http\Controllers\Api\MarkSetupController;
// use App\Http\Controllers\Api\MarkDistributionController;


// use App\Http\Controllers\Api\Admin\AdminMarkApprovalController;
// use App\Http\Controllers\Api\Admin\SubjectMarkConfigController;
// use App\Http\Controllers\Api\Common\ExamTypeController;
// use App\Http\Controllers\Api\Student\StudentResultController;
// use App\Http\Controllers\Api\Teacher\TeacherMarkController;

Route::post('/admin/login', [AdminAuthController::class, 'login']);

Route::get('/teachers', [TeacherController::class, 'index']);
Route::post('/teachers', [TeacherController::class, 'store']);
Route::delete('/teachers/{id}', [TeacherController::class, 'destroy']);

Route::get('/classes', [StudentController::class, 'classes']);
Route::get('/classes/{id}/subjects', [StudentController::class, 'classSubjects']);
Route::get('/students', [StudentController::class, 'index']);
Route::post('/students', [StudentController::class, 'store']);
Route::delete('/students/{id}', [StudentController::class, 'destroy']);

Route::post('/teacher/signup', [TeacherAuthController::class, 'signup']);
Route::post('/teacher/login', [TeacherAuthController::class, 'login']);

Route::post('/student/signup', [StudentAuthController::class, 'signup']);
Route::post('/student/login', [StudentAuthController::class, 'login']);

Route::get('/exam-routines', [ExamRoutineController::class, 'index']);
Route::post('/exam-routines', [ExamRoutineController::class, 'store']);
Route::delete('/exam-routines/{id}', [ExamRoutineController::class, 'destroy']);

Route::get('/exams', function () {
    return DB::table('exams')->get();
});

Route::get('/subjects', function () {
    return DB::table('subjects')->get();
});

Route::get('/teacher/exam-routines/{teacherId}', [ExamRoutineController::class, 'teacherRoutine']);

Route::get('/student/exam-routines/{studentId}', [ExamRoutineController::class, 'studentRoutine']);

// Route::get('/mark-setups', [MarkSetupController::class, 'index']);
// Route::post('/mark-setups', [MarkSetupController::class, 'store']);
// Route::delete('/mark-setups/{id}', [MarkSetupController::class, 'destroy']);

// Route::get('/mark-distributions', [MarkDistributionController::class, 'index']);
// Route::post('/mark-distributions', [MarkDistributionController::class, 'store']);
// Route::delete('/mark-distributions/{id}', [MarkDistributionController::class, 'destroy']);

// Route::get('/students/by-class/{classId}', [StudentMarkController::class, 'studentsByClass']);
// Route::post('/student-marks/filter', [StudentMarkController::class, 'marksByFilter']);
// Route::post('/student-marks', [StudentMarkController::class, 'store']);

Route::get('/students/by-class/{classId}', [StudentMarkController::class, 'studentsByClass']);
Route::post('/student-marks/filter', [StudentMarkController::class, 'marksByFilter']);
Route::post('/student-marks', [StudentMarkController::class, 'store']);

Route::get('/student-marks/pending', [StudentMarkController::class, 'pendingMarks']);
Route::post('/student-marks/{id}/approve', [StudentMarkController::class, 'approve']);

Route::get('/student-results/{studentId}', [StudentMarkController::class, 'approvedResultsByStudent']);


Route::post('/attendance/students', [TeacherAttendanceController::class, 'studentsByClassShift']);
Route::post('/attendance/store', [TeacherAttendanceController::class, 'store']);
Route::post('/attendance/history', [TeacherAttendanceController::class, 'history']);
Route::get('/student/attendance/{studentId}', [TeacherAttendanceController::class, 'studentHistory']);

