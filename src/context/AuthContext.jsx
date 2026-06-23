/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useEffect, useCallback, useReducer } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const initialState = {
    user: null,
    isAuthModalOpen: false,
    loading: true
};

function authReducer(state, action) {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload, loading: false };
        case 'LOGOUT':
            return { ...state, user: null, loading: false };
        case 'SET_AUTH_MODAL':
            return { ...state, isAuthModalOpen: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    
    const { user, isAuthModalOpen, loading } = state;

    useEffect(() => {
        // Handle initial session
        if (!supabase) {
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                dispatch({ type: 'SET_USER', payload: session.user });
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            dispatch({ type: 'SET_USER', payload: session?.user || null });
        });

        return () => subscription?.unsubscribe();
    }, []);

    const openAuthModal = useCallback(() => dispatch({ type: 'SET_AUTH_MODAL', payload: true }), []);
    const closeAuthModal = useCallback(() => dispatch({ type: 'SET_AUTH_MODAL', payload: false }), []);

    const login = useCallback(async (email, password) => {
        if (!supabase) return { success: false, message: 'Supabase not initialized' };
        dispatch({ type: 'SET_LOADING', payload: true });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            return { success: false, message: error.message };
        }
        
        return { success: true };
    }, []);

    const signup = useCallback(async (data) => {
        if (!supabase) return { success: false, message: 'Supabase not initialized' };
        dispatch({ type: 'SET_LOADING', payload: true });
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name
                }
            }
        });
        
        if (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            return { success: false, message: error.message };
        }

        return { success: true };
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const updateProfile = useCallback(async (updates) => {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });
        if (!error) {
            dispatch({ type: 'SET_USER', payload: data.user });
        }
    }, []);

    const value = useMemo(() => ({ 
        user, 
        loading, 
        login, 
        signup, 
        logout, 
        updateProfile,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal
    }), [
        user, 
        loading, 
        login, 
        signup, 
        logout, 
        updateProfile, 
        isAuthModalOpen, 
        openAuthModal, 
        closeAuthModal
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
