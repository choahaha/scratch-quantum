/**
 * Utility to save visualization images to Supabase
 */

import {supabase} from './supabase-client.js';
import dataURItoBlob from './data-uri-to-blob.js';

/**
 * Save a visualization image to Supabase Storage and record in database
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} type - Visualization type ('histogram' or 'circuit')
 * @param {string} imageData - Base64 data URI of the image
 * @returns {Promise<boolean>} - Success status
 */
export async function saveVisualizationToSupabase(userId, username, type, imageData) {
    if (!userId || !imageData) {
        console.warn('saveVisualization: Missing userId or imageData');
        return false;
    }

    try {
        // Convert data URI to blob
        const blob = dataURItoBlob(imageData);
        const timestamp = Date.now();
        const filePath = `visualizations/${userId}/${type}_${timestamp}.png`;

        console.log('saveVisualization: Uploading to:', filePath);

        // Upload to Supabase Storage
        const {data: uploadData, error: uploadError} = await supabase.storage
            .from('screenshots')
            .upload(filePath, blob, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            console.error('saveVisualization: Upload error:', uploadError);
            return false;
        }

        console.log('saveVisualization: Upload success:', uploadData);

        // Get public URL
        const {data: urlData} = supabase.storage
            .from('screenshots')
            .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;
        console.log('saveVisualization: Public URL:', imageUrl);

        // Insert record into database
        const {data: insertData, error: insertError} = await supabase
            .from('student_visualizations')
            .insert({
                user_id: userId,
                username: username,
                visualization_type: type,
                image_url: imageUrl
            });

        if (insertError) {
            console.error('saveVisualization: Insert error:', insertError);
            return false;
        }

        console.log('saveVisualization: Saved successfully:', type);
        return true;
    } catch (error) {
        console.error('saveVisualization: Error:', error);
        return false;
    }
}

export default saveVisualizationToSupabase;
