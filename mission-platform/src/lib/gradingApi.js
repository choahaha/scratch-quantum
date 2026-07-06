const API_URL = import.meta.env.VITE_GRADING_API_URL?.replace(/\/$/, '') || '';

/**
 * Submit a circuit for grading.
 * @param {string} accessToken - Supabase access token
 * @param {number} missionId
 * @param {Array} blocks - circuit block list from the embed bridge
 * @param {string|null} projectJson - vm.toJSON() snapshot
 * @returns {Promise<{passed: boolean, checks: Array, counts: object|null}>}
 */
export const submitMission = async (accessToken, missionId, blocks, projectJson) => {
    const response = await fetch(`${API_URL}/api/grading/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            mission_id: missionId,
            blocks,
            project_json: projectJson
        })
    });

    if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        if (response.status === 403) {
            throw new Error('이전 미션을 먼저 통과해야 해요.');
        }
        throw new Error(detail.detail || `채점 요청 실패 (${response.status})`);
    }
    return response.json();
};
