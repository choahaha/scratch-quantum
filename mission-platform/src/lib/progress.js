/**
 * Compute unlock states for the sequential stage map.
 *
 * @param {Array} chapters - rows ordered by order_index
 * @param {Array} missions - rows (any order); each has chapter_id, order_index
 * @param {Array} progressRows - the user's mission_progress rows
 * @returns {Array} chapters with .missions, each mission carrying
 *   .state: 'locked' | 'available' | 'passed'
 */
export const computeUnlocks = (chapters, missions, progressRows) => {
    const progressByMission = new Map(progressRows.map(row => [row.mission_id, row]));
    const chapterOrder = new Map(chapters.map(chapter => [chapter.id, chapter.order_index]));

    const ordered = [...missions].sort((a, b) =>
        (chapterOrder.get(a.chapter_id) - chapterOrder.get(b.chapter_id)) ||
        (a.order_index - b.order_index)
    );

    let previousPassed = true; // first mission is always available
    const decorated = ordered.map(mission => {
        const progress = progressByMission.get(mission.id);
        const passed = progress?.status === 'passed';
        const state = passed ? 'passed' : (previousPassed ? 'available' : 'locked');
        previousPassed = passed;
        return {...mission, state, progress: progress || null};
    });

    return chapters
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map(chapter => ({
            ...chapter,
            missions: decorated.filter(mission => mission.chapter_id === chapter.id)
        }));
};

/** Find the mission after the given one in the global sequence, or null. */
export const findNextMission = (chaptersWithMissions, missionId) => {
    const flat = chaptersWithMissions.flatMap(chapter => chapter.missions);
    const index = flat.findIndex(mission => mission.id === missionId);
    return index >= 0 && index + 1 < flat.length ? flat[index + 1] : null;
};
