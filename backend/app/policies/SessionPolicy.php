<?php

namespace App\Policies;

use App\Models\User;
use App\Models\AcademicSession;

class SessionPolicy
{
    /**
     * Determine if the user can update the session.
     */
    public function update(User $user, AcademicSession $session): bool
    {
        // Only allow updates if session is Active or Upcoming
        return in_array($session->session_status, ['Active', 'Upcoming']);
    }

    /**
     * Determine if the user can delete the session.
     */
    public function delete(User $user, AcademicSession $session): bool
    {
        // Don't allow deletion of Archived sessions
        return $session->session_status !== 'Archived';
    }

    /**
     * Determine if the user can create data for this session.
     */
    public function modifyData(User $user, AcademicSession $session): bool
    {
        // Only allow data modification for current or active sessions
        return $session->is_current === true || $session->session_status === 'Active';
    }
}