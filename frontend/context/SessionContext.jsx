"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    fetchSessions, 
    createSessionApi, 
    deleteSessionApi,
    setCurrentSessionApi
} from '@/lib/sessionApi';

const SessionContext = createContext();

export function SessionProvider({ children }) {
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUsingApi, setIsUsingApi] = useState(false);

    // ── Load sessions from API or localStorage ──
    const loadSessions = useCallback(async () => {
        try {
            console.log('🟢 Loading sessions from API...');
            const result = await fetchSessions();
            console.log('🟢 API Response:', result);
            
            if (result && result.length > 0) {
                // ── Map backend fields to frontend fields ──
                const mappedSessions = result.map(s => ({
                    id: s.id,
                    session_label: s.session_label,
                    label: s.session_label,
                    session_status: s.session_status,
                    status: s.session_status,
                    is_current: s.is_current,
                    isCurrent: s.is_current,
                    start_date: s.start_date,
                    end_date: s.end_date,
                    created_at: s.created_at,
                    updated_at: s.updated_at,
                }));
                
                console.log('🟢 Mapped sessions:', mappedSessions);
                setSessions(mappedSessions);
                setIsUsingApi(true);
                
                // Save to localStorage as backup
                localStorage.setItem('gks_sessions', JSON.stringify(mappedSessions));
                
                // Set selected session
                const savedSelection = localStorage.getItem('gks_selected_session');
                const current = mappedSessions.find(s => s.is_current);
                const selected = savedSelection || current?.id || mappedSessions[0]?.id || null;
                setSelectedSessionId(selected);
                if (selected) {
                    localStorage.setItem('gks_selected_session', selected);
                }
                
                setIsLoading(false);
                return;
            }
            
            // ── If no sessions from API, try localStorage ──
            console.log('🟡 No sessions from API, using localStorage fallback');
            loadFromLocalStorage();
            
        } catch (error) {
            console.error('🔴 API failed, using localStorage fallback:', error);
            loadFromLocalStorage();
            setIsUsingApi(false);
        }
    }, []);

    // ── Load from localStorage ──
    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem('gks_sessions');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSessions(parsed);
                const savedSelection = localStorage.getItem('gks_selected_session');
                const current = parsed.find(s => s.is_current || s.isCurrent);
                const selected = savedSelection || current?.id || parsed[0]?.id || null;
                setSelectedSessionId(selected);
                if (selected) {
                    localStorage.setItem('gks_selected_session', selected);
                }
            } catch (e) {
                setSessions([]);
            }
        } else {
            // Default sessions
            const defaults = [
                { id: '2026-27', label: '2026-27', status: 'Active', isCurrent: true },
                { id: '2025-26', label: '2025-26', status: 'Archived', isCurrent: false },
            ];
            setSessions(defaults);
            localStorage.setItem('gks_sessions', JSON.stringify(defaults));
            setSelectedSessionId('2026-27');
        }
        setIsLoading(false);
    };

    // ── Initial load ──
    useEffect(() => {
        loadSessions();
    }, []);

    // ── Create session ──
    const createSession = useCallback(async (newSession) => {
        console.log('🟢 Creating session:', newSession);
        
        try {
            // ── Prepare data for API ──
            const apiData = {
                session_label: newSession.session_label || newSession.label,
                session_status: 'Active',
                is_current: false,
                start_date: newSession.start_date || null,
                end_date: newSession.end_date || null,
            };
            
            console.log('🟢 Sending to API:', apiData);
            
            // ── Try API first ──
            try {
                const result = await createSessionApi(apiData);
                console.log('🟢 API Success:', result);
                
                if (result) {
                    // ── Reload sessions from API ──
                    await loadSessions();
                    console.log('🟢 Sessions reloaded from API');
                    return result;
                }
            } catch (apiError) {
                console.warn('🟡 API create failed, using localStorage:', apiError);
            }
            
            // ── Fallback to localStorage ──
            console.log('🟢 Saving to localStorage fallback');
            return createSessionLocal(newSession);
            
        } catch (error) {
            console.error('🔴 Create failed:', error);
            throw error;
        }
    }, [loadSessions]);

    // ── Create session in localStorage (fallback) ──
    const createSessionLocal = (newSession) => {
        const sessionToAdd = {
            id: newSession.session_label?.toLowerCase().replace(/\s+/g, '-') || Date.now().toString(),
            session_label: newSession.session_label || newSession.label,
            label: newSession.session_label || newSession.label,
            session_status: 'Active',
            status: 'Active',
            is_current: false,
            isCurrent: false,
            start_date: newSession.start_date || null,
            end_date: newSession.end_date || null,
            created_at: new Date().toISOString(),
        };
        
        const updatedSessions = [sessionToAdd, ...sessions];
        setSessions(updatedSessions);
        localStorage.setItem('gks_sessions', JSON.stringify(updatedSessions));
        setSelectedSessionId(sessionToAdd.id);
        localStorage.setItem('gks_selected_session', sessionToAdd.id);
        
        console.log('🟢 Local session created:', sessionToAdd);
        return sessionToAdd;
    };
   // ── Delete session ──
// ── Delete session ──
const deleteSession = useCallback(async (sessionId) => {
    console.log('🟢 Deleting session:', sessionId);
    console.log('🟢 Session ID type:', typeof sessionId);
    
    // Prevent deleting the last session
    if (sessions.length <= 1) {
        alert('Cannot delete the last session. You need at least one session.');
        return false;
    }

    try {
        // ── Check if this session exists in the state ──
        const sessionToDelete = sessions.find(s => s.id == sessionId); // Use == for type coercion
        if (!sessionToDelete) {
            console.warn('🟡 Session not found in state:', sessionId);
            return false;
        }

        console.log('🟢 Session to delete:', sessionToDelete);

        // ── Try API delete first ──
        try {
            await deleteSessionApi(sessionId);
            console.log('🟢 API delete successful');
            
            // ── Reload sessions from API ──
            await loadSessions();
            console.log('🟢 Sessions reloaded after delete');
            return true;
            
        } catch (apiError) {
            console.warn('🟡 API delete failed, using localStorage:', apiError);
            
            // ── Check if this is a local-only session (numeric ID or no UUID) ──
            const isLocalOnly = typeof sessionId === 'number' || 
                               !sessionId.includes('-') || 
                               sessionId.length < 20;
            
            if (isLocalOnly) {
                console.log('🟢 Local-only session, deleting from localStorage');
                // Remove from localStorage
                const updatedSessions = sessions.filter(s => s.id != sessionId); // Use != for type coercion
                setSessions(updatedSessions);
                localStorage.setItem('gks_sessions', JSON.stringify(updatedSessions));
                
                // Update selected session if needed
                if (selectedSessionId == sessionId) {
                    const newSelection = updatedSessions[0]?.id || null;
                    setSelectedSessionId(newSelection);
                    localStorage.setItem('gks_selected_session', newSelection);
                }
                return true;
            }
            
            throw apiError; // Re-throw if not local-only
        }
        
    } catch (error) {
        console.error('🔴 Delete failed:', error);
        alert('Failed to delete session. Please try again.');
        return false;
    }
}, [sessions, selectedSessionId, loadSessions]);
    // ── Select session ──
    const selectSession = useCallback(async (sessionId) => {
        console.log('🟢 Selecting session:', sessionId);
        
        setSelectedSessionId(sessionId);
        localStorage.setItem('gks_selected_session', sessionId);
        
        // ── Try API to set as current ──
        try {
            await setCurrentSessionApi(sessionId);
            await loadSessions(); // Refresh to get updated statuses
            console.log('🟢 Session set as current on API');
        } catch (apiError) {
            console.warn('🟡 API set-current failed, using localStorage:', apiError);
            // Update localStorage to reflect current session
            const updatedSessions = sessions.map(s => ({
                ...s,
                is_current: s.id === sessionId,
                isCurrent: s.id === sessionId,
            }));
            setSessions(updatedSessions);
            localStorage.setItem('gks_sessions', JSON.stringify(updatedSessions));
        }
    }, [sessions, loadSessions]);

    // ── Refresh sessions ──
    const refreshSessions = useCallback(async () => {
        await loadSessions();
    }, [loadSessions]);

    // ── Get current session ──
    const getCurrentSession = useCallback(() => {
        return sessions.find(s => s.id === selectedSessionId) || null;
    }, [sessions, selectedSessionId]);

    const value = {
        sessions,
        selectedSessionId,
        selectedSession: getCurrentSession(),
        isLoading,
        isUsingApi,
        createSession,
        deleteSession,
        selectSession,
        refreshSessions,
        getCurrentSession,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}