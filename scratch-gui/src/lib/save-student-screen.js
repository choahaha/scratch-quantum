/**
 * Utility to capture the current stage + block code and save them to the
 * admin dashboard (student_screens). Shared by the manual "send screen"
 * button and the automatic green-flag save.
 */

import {supabase} from './supabase-client.js';
import dataURItoBlob from './data-uri-to-blob.js';
import captureBlocksAsImage from './blocks-to-image.js';

/**
 * Capture the stage snapshot and block code image, upload both to Supabase
 * Storage, and insert a row into student_screens.
 * @param {object} params - Parameters
 * @param {VM} params.vm - The scratch-vm instance (needs a renderer)
 * @param {string} params.userId - User ID
 * @param {string} params.username - Username
 * @returns {Promise<boolean>} - Whether the screen was saved successfully
 */
const saveStudentScreen = ({vm, userId, username}) => {
    if (!vm || !vm.renderer || !userId) {
        console.warn('saveStudentScreen: Missing renderer or userId');
        return Promise.resolve(false);
    }

    return new Promise(resolve => {
        vm.renderer.requestSnapshot(async dataURI => {
            try {
                const blob = dataURItoBlob(dataURI);
                const timestamp = Date.now();
                const filePath = `${userId}/${timestamp}.png`;

                const {error: uploadError} = await supabase.storage
                    .from('screenshots')
                    .upload(filePath, blob, {
                        contentType: 'image/png',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('saveStudentScreen: Upload error:', uploadError);
                    resolve(false);
                    return;
                }

                const {data: urlData} = supabase.storage
                    .from('screenshots')
                    .getPublicUrl(filePath);

                // Capture block code image (best-effort; not required)
                let blocksImageUrl = null;
                try {
                    const blocksBlob = await captureBlocksAsImage();
                    if (blocksBlob) {
                        const blocksFilePath = `${userId}/blocks_${timestamp}.png`;
                        const {error: blocksUploadError} = await supabase.storage
                            .from('screenshots')
                            .upload(blocksFilePath, blocksBlob, {
                                contentType: 'image/png',
                                upsert: true
                            });

                        if (blocksUploadError) {
                            console.warn('saveStudentScreen: Blocks upload error:', blocksUploadError);
                        } else {
                            const {data: blocksUrlData} = supabase.storage
                                .from('screenshots')
                                .getPublicUrl(blocksFilePath);
                            blocksImageUrl = blocksUrlData.publicUrl;
                        }
                    }
                } catch (blocksError) {
                    console.warn('saveStudentScreen: Could not capture blocks image:', blocksError);
                }

                const {error: insertError} = await supabase.from('student_screens').insert({
                    user_id: userId,
                    username: username,
                    screenshot_url: urlData.publicUrl,
                    blocks_image_url: blocksImageUrl
                });

                if (insertError) {
                    console.error('saveStudentScreen: Insert error:', insertError);
                    resolve(false);
                    return;
                }

                resolve(true);
            } catch (error) {
                console.error('saveStudentScreen: Error:', error);
                resolve(false);
            }
        });
        vm.renderer.draw();
    });
};

export {saveStudentScreen};
export default saveStudentScreen;
