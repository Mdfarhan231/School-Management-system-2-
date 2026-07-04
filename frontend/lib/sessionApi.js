import { apiRequest } from './api';

/**
 * Session Management API Calls
 * No token required - using session-based auth
 */

/**
 * Fetch all sessions from backend
 */
export const fetchSessions = async () => {
    try {
        const response = await apiRequest('/sessions', 'GET');
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch sessions:', error);
        return [];
    }
};

/**
 * Fetch current session
 */
export const fetchCurrentSession = async () => {
    try {
        const response = await apiRequest('/sessions/current', 'GET');
        return response.data || null;
    } catch (error) {
        console.error('Failed to fetch current session:', error);
        return null;
    }
};

/**
 * Create a new session
 */
export const createSessionApi = async (sessionData) => {
    try {
        const response = await apiRequest('/sessions', 'POST', sessionData);
        return response.data;
    } catch (error) {
        console.error('Failed to create session:', error);
        throw error;
    }
};

/**
 * Update a session
 */
export const updateSessionApi = async (id, sessionData) => {
    try {
        const response = await apiRequest(`/sessions/${id}`, 'PUT', sessionData);
        return response.data;
    } catch (error) {
        console.error('Failed to update session:', error);
        throw error;
    }
};

/**
 * Delete a session
 */
export const deleteSessionApi = async (id) => {
    try {
        const response = await apiRequest(`/sessions/${id}`, 'DELETE');
        return response.data;
    } catch (error) {
        console.error('Failed to delete session:', error);
        throw error;
    }
};

/**
 * Set a session as current
 */
export const setCurrentSessionApi = async (id) => {
    try {
        const response = await apiRequest(`/sessions/${id}/set-current`, 'PATCH');
        return response.data;
    } catch (error) {
        console.error('Failed to set current session:', error);
        throw error;
    }
};

/**
 * Restore a soft-deleted session
 */
export const restoreSessionApi = async (id) => {
    try {
        const response = await apiRequest(`/sessions/${id}/restore`, 'PATCH');
        return response.data;
    } catch (error) {
        console.error('Failed to restore session:', error);
        throw error;
    }
};