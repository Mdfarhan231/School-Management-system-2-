<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    /**
     * Get all sessions
     */
    public function index()
    {
        try {
            $sessions = AcademicSession::orderBy('is_current', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch sessions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sessions'
            ], 500);
        }
    }

    /**
     * Get current session
     */
    public function current()
    {
        try {
            $session = AcademicSession::where('is_current', true)->first();
            
            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'No current session found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $session
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch current session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch current session'
            ], 500);
        }
    }

    /**
     * Create a new session
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'session_label' => 'required|string|max:50|unique:academic_sessions,session_label',
                'session_status' => 'sometimes|in:Active,Upcoming,Archived',
                'is_current' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // ── Generate UUID for new session ──
            $session = AcademicSession::create([
                'id' => (string) Str::uuid(), // ✅ Generate proper UUID
                'session_label' => $request->session_label,
                'session_status' => $request->session_status ?? 'Active',
                'is_current' => $request->is_current ?? false,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'created_by' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Session created successfully',
                'data' => $session
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a session
     */
    public function update(Request $request, $id)
    {
        try {
            // ── Find by ID (works with both UUID and numeric) ──
            $session = AcademicSession::where('id', $id)->first();
            
            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'session_label' => 'sometimes|string|max:50|unique:academic_sessions,session_label,' . $id . ',id',
                'session_status' => 'sometimes|in:Active,Upcoming,Archived',
                'is_current' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // If setting as current, auto-archive the previous current
            if ($request->has('is_current') && $request->is_current === true) {
                AcademicSession::where('is_current', true)
                    ->where('id', '!=', $id)
                    ->update([
                        'is_current' => false,
                        'session_status' => 'Archived'
                    ]);
            }

            $session->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Session updated successfully',
                'data' => $session
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a session (Hard Delete)
     */
    public function destroy($id)
    {
        try {
            // ── Find by ID (works with both UUID and numeric) ──
            $session = AcademicSession::where('id', $id)->first();
            
            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found'
                ], 404);
            }
            
            // ── Prevent deleting the last session ──
            if (AcademicSession::count() <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the last session'
                ], 422);
            }

            // ── If deleting the current session, make another session current ──
            if ($session->is_current) {
                $nextSession = AcademicSession::where('id', '!=', $id)->first();
                if ($nextSession) {
                    $nextSession->update([
                        'is_current' => true,
                        'session_status' => 'Active'
                    ]);
                }
            }

            // ── Hard delete ──
            $session->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Session deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set a session as current
     */
    public function setCurrent($id)
    {
        try {
            // ── Find by ID (works with both UUID and numeric) ──
            $session = AcademicSession::where('id', $id)->first();
            
            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found'
                ], 404);
            }

            // ── Auto-archive the previous current session ──
            $previousCurrent = AcademicSession::where('is_current', true)
                ->where('id', '!=', $id)
                ->first();
            
            if ($previousCurrent) {
                $previousCurrent->update([
                    'is_current' => false,
                    'session_status' => 'Archived'
                ]);
            }

            // ── Set this session as current ──
            $session->update([
                'is_current' => true,
                'session_status' => 'Active'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Session set as current successfully',
                'data' => $session
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to set current session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to set current session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft-deleted session
     */
    public function restore($id)
    {
        try {
            $session = AcademicSession::withTrashed()->where('id', $id)->first();
            
            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found'
                ], 404);
            }
            
            $session->restore();

            return response()->json([
                'success' => true,
                'message' => 'Session restored successfully',
                'data' => $session
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to restore session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore session: ' . $e->getMessage()
            ], 500);
        }
    }
}