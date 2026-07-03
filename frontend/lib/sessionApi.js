import apiRequest from './api';

/**
 * Session Management API Calls
 * All functions use the base apiRequest from api.js
 */

/**
 * Fetch all sessions from backend
 */
export const fetchSessions = async (token) => {
    try {
        const response = await apiRequest('/sessions', 'GET', null, token);
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch sessions:', error);
        return [];
    }
};

/**
 * Fetch current session
 */
export const fetchCurrentSession = async (token) => {
    try {
        const response = await apiRequest('/sessions/current', 'GET', null, token);
        return response.data || null;
    } catch (error) {
        console.error('Failed to fetch current session:', error);
        return null;
    }
};

/**
 * Create a new session
 * Expected body: { session_label, session_status, is_current, start_date, end_date }
 */
export const createSessionApi = async (sessionData, token) => {
    try {
        const response = await apiRequest('/sessions', 'POST', sessionData, token);
        return response.data;
    } catch (error) {
        console.error('Failed to create session:', error);
        throw error;
    }
};

/**
 * Update a session
 */
export const updateSessionApi = async (id, sessionData, token) => {
    try {
        const response = await apiRequest(`/sessions/${id}`, 'PUT', sessionData, token);
        return response.data;
    } catch (error) {
        console.error('Failed to update session:', error);
        throw error;
    }
};

/**
 * Delete a session
 */
export const deleteSessionApi = async (id, token) => {
    try {
        const response = await apiRequest(`/sessions/${id}`, 'DELETE', null, token);
        return response.data;
    } catch (error) {
        console.error('Failed to delete session:', error);
        throw error;
    }
};

/**
 * Set a session as current
 */
export const setCurrentSessionApi = async (id, token) => {
    try {
        const response = await apiRequest(`/sessions/${id}/set-current`, 'PATCH', null, token);
        return response.data;
    } catch (error) {
        console.error('Failed to set current session:', error);
        throw error;
    }
};