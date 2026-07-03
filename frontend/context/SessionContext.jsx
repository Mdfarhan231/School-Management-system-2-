"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Context ──
const SessionContext = createContext();

// ── Provider ──
export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Load sessions from localStorage ──
  const loadSessions = useCallback(() => {
    if (typeof window === 'undefined') return [];
    
    const saved = localStorage.getItem("gks_sessions");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch { 
        return [];
      }
    }
    
    // Default sessions if none exist
    return [
      { id: "2026-27", label: "2026-27", status: "Active", isCurrent: true },
      { id: "2025-26", label: "2025-26", status: "Archived", isCurrent: false },
      { id: "2024-25", label: "2024-25", status: "Archived", isCurrent: false },
    ];
  }, []);

  // ── Save sessions to localStorage ──
  const saveSessions = useCallback((newSessions) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("gks_sessions", JSON.stringify(newSessions));
    }
  }, []);

  // ── Initialize sessions ──
  useEffect(() => {
    const initialSessions = loadSessions();
    setSessions(initialSessions);
    
    // Find saved selection or current session
    const savedSelection = typeof window !== 'undefined' 
      ? localStorage.getItem("gks_selected_session") 
      : null;
    
    const current = initialSessions.find(s => s.isCurrent);
    const selected = savedSelection || current?.id || initialSessions[0]?.id || null;
    
    setSelectedSessionId(selected);
    setIsLoading(false);
  }, [loadSessions]);

  // ── Create new session ──
  const createSession = useCallback((newSession) => {
    let updatedSessions = [...sessions];
    
    if (newSession.isCurrent) {
      updatedSessions = updatedSessions.map((s) => ({
        ...s,
        isCurrent: false,
        status: s.status === "Active" ? "Archived" : s.status,
      }));
    }
    
    updatedSessions = [newSession, ...updatedSessions];
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
    setSelectedSessionId(newSession.id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("gks_selected_session", newSession.id);
    }
    
    return newSession;
  }, [sessions, saveSessions]);

  // ── Select session ──
  const selectSession = useCallback((sessionId) => {
    setSelectedSessionId(sessionId);
    if (typeof window !== 'undefined') {
      localStorage.setItem("gks_selected_session", sessionId);
    }
  }, []);

  // ── Get current session ──
  const getCurrentSession = useCallback(() => {
    return sessions.find(s => s.id === selectedSessionId) || null;
  }, [sessions, selectedSessionId]);

  // ── Get session by ID ──
  const getSession = useCallback((sessionId) => {
    return sessions.find(s => s.id === sessionId) || null;
  }, [sessions]);

  // ── Update session ──
  const updateSession = useCallback((sessionId, updates) => {
    const updatedSessions = sessions.map((s) => {
      if (s.id === sessionId) {
        return { ...s, ...updates };
      }
      // If this session is being set as current, update others
      if (updates.isCurrent && s.id !== sessionId) {
        return { ...s, isCurrent: false, status: s.status === "Active" ? "Archived" : s.status };
      }
      return s;
    });
    
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  }, [sessions, saveSessions]);

  // ── Delete session ──
  const deleteSession = useCallback((sessionId) => {
    if (sessions.length <= 1) {
      console.warn("Cannot delete the last session");
      return false;
    }
    
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
    
    if (selectedSessionId === sessionId) {
      const newSelection = updatedSessions[0]?.id || null;
      setSelectedSessionId(newSelection);
      if (typeof window !== 'undefined') {
        localStorage.setItem("gks_selected_session", newSelection);
      }
    }
    
    return true;
  }, [sessions, selectedSessionId, saveSessions]);

  // ── Context value ──
  const value = {
    sessions,
    selectedSessionId,
    selectedSession: getCurrentSession(),
    isLoading,
    createSession,
    selectSession,
    getCurrentSession,
    getSession,
    updateSession,
    deleteSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// ── Hook ──
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}