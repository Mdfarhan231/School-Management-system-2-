"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    fetchSessions, 
    createSessionApi, 
    deleteSessionApi,
    updateSessionApi,
    setCurrentSessionApi
} from '@/lib/sessionApi';
import { getToken } from '@/lib/auth';

const SessionContext = createContext();

export function SessionProvider({ children }) {
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    // ── Get auth token ──
    const getAuthToken = useCallback(() => {
        try {
            const admin = localStorage.getItem('admin');
            if (admin) {
                const parsed = JSON.parse(admin);
                return parsed?.token || parsed?.access_token || null;
            }
            return null;
        } catch {
            return null;
        }
    }, []);

    // ── Load sessions from API ──
    const loadSessions = useCallback(async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.warn('No auth token found, using localStorage fallback');
                loadFromLocalStorage();
                return;
            }

            const result = await fetchSessions(token);
            
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
                
                setSessions(mappedSessions);
                setIsOffline(false);
                
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
            
            // If no sessions from API, try localStorage
            loadFromLocalStorage();
            
        } catch (error) {
            console.warn('API failed, using localStorage fallback:', error);
            loadFromLocalStorage();
            setIsOffline(true);
        }
    }, [getAuthToken]);

    // ── Load from localStorage fallback ──
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
    }, [loadSessions]);

    // ── Create session ──
    const createSession = useCallback(async (newSession) => {
        try {
            const token = getAuthToken();
            
            if (token && !isOffline) {
                // ── Prepare data for API ──
                const apiData = {
                    session_label: newSession.session_label || newSession.label,
                    session_status: newSession.session_status || newSession.status || 'Active',
                    is_current: false, // Always false by default
                    start_date: newSession.start_date || null,
                    end_date: newSession.end_date || null,
                };
                
                const result = await createSessionApi(apiData, token);
                
                if (result) {
                    // ── Reload sessions from API ──
                    await loadSessions();
                    return result;
                }
            }
            
            // ── Fallback to localStorage ──
            console.warn('API failed, saving to localStorage only');
            let updatedSessions = [...sessions];
            
            // Auto-archive: if new session is set as current, archive others
            if (newSession.isCurrent || newSession.is_current) {
                updatedSessions = updatedSessions.map((s) => ({
                    ...s,
                    isCurrent: false,
                    is_current: false,
                    status: s.status === 'Active' ? 'Archived' : s.status,
                    session_status: s.session_status === 'Active' ? 'Archived' : s.session_status,
                }));
            }
            
            // Create new session object
            const sessionToAdd = {
                id: newSession.id || newSession.session_label?.toLowerCase().replace(/\s+/g, '-') || Date.now().toString(),
                session_label: newSession.session_label || newSession.label,
                label: newSession.session_label || newSession.label,
                session_status: newSession.session_status || newSession.status || 'Active',
                status: newSession.session_status || newSession.status || 'Active',
                is_current: newSession.is_current || newSession.isCurrent || false,
                isCurrent: newSession.is_current || newSession.isCurrent || false,
                start_date: newSession.start_date || null,
                end_date: newSession.end_date || null,
                created_at: new Date().toISOString(),
            };
            
            updatedSessions = [sessionToAdd, ...updatedSessions];
            setSessions(updatedSessions);
            localStorage.setItem('gks_sessions', JSON.stringify(updatedSessions));
            setSelectedSessionId(sessionToAdd.id);
            localStorage.setItem('gks_selected_session', sessionToAdd.id);
            
            return sessionToAdd;
            
        } catch (error) {
            console.error('Failed to create session:', error);
            throw error;
        }
    }, [sessions, isOffline, loadSessions, getAuthToken]);

    // ── Delete session ──
    const deleteSession = useCallback(async (sessionId) => {
        if (sessions.length <= 1) {
            alert('Cannot delete the last session');
            return false;
        }

        try {
            const token = getAuthToken();
            
            if (token && !isOffline) {
                await deleteSessionApi(sessionId, token);
                await loadSessions();
                return true;
            }
            
            // ── Fallback to localStorage ──
            console.warn('API failed, deleting from localStorage only');
            const updatedSessions = sessions.filter(s => s.id !== sessionId);
            setSessions(updatedSessions);
            localStorage.setItem('gks_sessions', JSON.stringify(updatedSessions));
            
            if (selectedSessionId === sessionId) {
                const newSelection = updatedSessions[0]?.id || null;
                setSelectedSessionId(newSelection);
                localStorage.setItem('gks_selected_session', newSelection);
            }
            return true;
            
        } catch (error) {
            console.error('Failed to delete session:', error);
            return false;
        }
    }, [sessions, selectedSessionId, isOffline, loadSessions, getAuthToken]);

    // ── Select session ──
    const selectSession = useCallback(async (sessionId) => {
        setSelectedSessionId(sessionId);
        localStorage.setItem('gks_selected_session', sessionId);
        
        // Optional: Update backend to set this as current
        try {
            const token = getAuthToken();
            if (token && !isOffline) {
                await setCurrentSessionApi(sessionId, token);
                await loadSessions(); // Refresh to get updated statuses
            }
        } catch (error) {
            console.warn('Failed to set current session on backend:', error);
        }
    }, [isOffline, loadSessions, getAuthToken]);

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
        isOffline,
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