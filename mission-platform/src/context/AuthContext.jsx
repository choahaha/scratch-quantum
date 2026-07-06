/* eslint-disable react-refresh/only-export-components */
import {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../lib/supabaseClient';

// Same account system as the Scratch editor: usernames are mapped to
// fake emails (see scratch-gui/src/lib/auth-manager-hoc.jsx).
const usernameToEmail = username => `${username}@scratch-quantum.local`;

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({data}) => {
            setSession(data.session);
            setLoading(false);
        });

        const {data: {subscription}} = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                setSession(newSession);
                // MissionPage listens for this to re-send MISSION_INIT with
                // fresh tokens to the embedded editor.
                if (event === 'TOKEN_REFRESHED' && newSession) {
                    window.dispatchEvent(new CustomEvent('sq-token-refreshed', {
                        detail: {session: newSession}
                    }));
                }
            }
        );
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!session?.user) {
            setProfile(null);
            return;
        }
        supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({data}) => setProfile(data));
    }, [session?.user?.id]);

    const login = async (username, password) => {
        const {data, error} = await supabase.auth.signInWithPassword({
            email: usernameToEmail(username),
            password
        });
        if (error) {
            throw new Error(
                error.message === 'Invalid login credentials'
                    ? 'Incorrect username or password.'
                    : error.message
            );
        }
        return data;
    };

    const register = async (username, password) => {
        const {data, error} = await supabase.auth.signUp({
            email: usernameToEmail(username),
            password
        });
        if (error) {
            if (error.message.includes('already registered')) {
                throw new Error('That username is already taken.');
            }
            throw new Error(error.message);
        }
        if (!data.user) throw new Error('Sign up failed.');

        const {error: profileError} = await supabase.from('users').insert({
            id: data.user.id,
            username,
            display_name: username,
            role: 'student'
        });
        if (profileError && profileError.code !== '23505') {
            throw new Error('Failed to create your profile.');
        }
        return data;
    };

    const logout = () => supabase.auth.signOut();

    return (
        <AuthContext.Provider value={{session, profile, loading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
