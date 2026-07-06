import {supabase} from './supabase-client.js';

/**
 * Fetch a user's profile row from the `users` table.
 * Shared by AuthManagerHOC (login flow) and EmbedBridgeHOC (session
 * handoff from the mission platform).
 * @param {string} userId - Supabase auth user id
 * @returns {Promise<object|null>} profile row or null on error
 */
const fetchProfile = async userId => {
    try {
        const {data, error} = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Profile fetch error:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Profile fetch error:', error);
        return null;
    }
};

export default fetchProfile;
