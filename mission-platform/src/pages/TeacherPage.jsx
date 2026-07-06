import {useCallback, useEffect, useState} from 'react';
import {Link, Navigate} from 'react-router-dom';
import {supabase} from '../lib/supabaseClient';
import {useAuth} from '../context/AuthContext';

const formatTime = iso => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-US', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

/** "n분 전 / n시간 전 / n일 전" 상대 시각 */
const timeAgo = iso => {
    if (!iso) return '—';
    const mins = (Date.now() - new Date(iso)) / 60000;
    if (mins < 1) return 'just now';
    if (mins < 60) return `${Math.round(mins)}m ago`;
    if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / (60 * 24))}d ago`;
};

/** 시작~통과 소요 시간(분). 기록이 없거나 이상하면 null. */
const durationMins = (start, end) => {
    if (!start || !end) return null;
    const mins = (new Date(end) - new Date(start)) / 60000;
    return mins >= 0 ? mins : null;
};

const formatMins = mins => {
    if (mins === null || mins === undefined) return null;
    if (mins < 1) return '<1 min';
    if (mins < 60) return `${Math.round(mins)} min`;
    return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
};

const UNASSIGNED = 'Unassigned';
const STRUGGLE_ATTEMPTS = 3; // 이 횟수 이상 시도했는데 미통과면 "도움 필요"

/** 교사용 진행 현황: 학생 × 미션 매트릭스 + 미션별 병목 통계 */
const TeacherPage = () => {
    const {profile} = useAuth();
    const [students, setStudents] = useState(null);
    const [missions, setMissions] = useState(null);
    const [progress, setProgress] = useState([]);
    const [detail, setDetail] = useState(null); // {student, mission, row}
    const [classFilter, setClassFilter] = useState('all');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        const [studentsRes, missionsRes, progressRes] = await Promise.all([
            supabase.from('users').select('id, username, display_name, role, class_name')
                .eq('role', 'student').order('username'),
            supabase.from('missions').select('id, order_index, title, chapter_id')
                .order('order_index'),
            supabase.from('mission_progress').select('*')
        ]);
        const firstError = studentsRes.error || missionsRes.error || progressRes.error;
        if (firstError) {
            setError(firstError.message);
            return;
        }
        setStudents(studentsRes.data);
        setMissions(missionsRes.data);
        setProgress(progressRes.data);
    }, []);

    useEffect(() => {
        load();
        const channel = supabase
            .channel('teacher-progress')
            .on('postgres_changes',
                {event: '*', schema: 'public', table: 'mission_progress'},
                () => load())
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [load]);

    // 학생 계정이 아닌 경우 접근 차단
    if (profile && profile.role !== 'admin') return <Navigate to="/" replace />;
    if (error) return <div className="page-loading">Error: {error}</div>;
    if (!profile || !students || !missions) return <div className="page-loading">Loading...</div>;

    const classNames = [...new Set(students.map(s => s.class_name || UNASSIGNED))]
        .sort((a, b) => (a === UNASSIGNED) - (b === UNASSIGNED) || a.localeCompare(b, 'en'));
    const visibleStudents = classFilter === 'all'
        ? students
        : students.filter(s => (s.class_name || UNASSIGNED) === classFilter);

    const progressMap = new Map(progress.map(row => [`${row.user_id}:${row.mission_id}`, row]));
    const studentIds = new Set(visibleStudents.map(s => s.id));
    const visibleRows = progress.filter(row => studentIds.has(row.user_id));

    const passedTotal = visibleRows.filter(row => row.status === 'passed').length;
    const passRate = visibleStudents.length && missions.length
        ? Math.round((passedTotal / (visibleStudents.length * missions.length)) * 100)
        : 0;
    const activeToday = new Set(
        visibleRows
            .filter(row => Date.now() - new Date(row.updated_at) < 24 * 3600 * 1000)
            .map(row => row.user_id)
    ).size;
    const strugglingCount = visibleRows.filter(row =>
        row.status !== 'passed' && row.attempts >= STRUGGLE_ATTEMPTS).length;

    // 미션별 병목 통계 (표시 중인 학생 기준)
    const missionStats = missions.map(mission => {
        const rows = visibleRows.filter(row => row.mission_id === mission.id);
        const passedRows = rows.filter(row => row.status === 'passed');
        const durations = passedRows
            .map(row => durationMins(row.started_at, row.passed_at))
            .filter(v => v !== null);
        return {
            missionId: mission.id,
            passedCount: passedRows.length,
            triedCount: rows.length,
            avgAttempts: passedRows.length
                ? (passedRows.reduce((sum, row) => sum + row.attempts, 0) / passedRows.length)
                : null,
            avgDuration: durations.length
                ? durations.reduce((a, b) => a + b, 0) / durations.length
                : null
        };
    });

    const lastActivity = student => {
        const times = missions
            .map(m => progressMap.get(`${student.id}:${m.id}`)?.updated_at)
            .filter(Boolean);
        return times.length ? times.sort().at(-1) : null;
    };

    const cellFor = (student, mission) => {
        const row = progressMap.get(`${student.id}:${mission.id}`);
        if (!row) return <td key={mission.id} className="t-cell t-none">—</td>;
        const passed = row.status === 'passed';
        const struggling = !passed && row.attempts >= STRUGGLE_ATTEMPTS;
        const duration = passed ? formatMins(durationMins(row.started_at, row.passed_at)) : null;
        return (
            <td
                key={mission.id}
                className={`t-cell ${passed ? 't-pass' : (struggling ? 't-struggle' : 't-try')}`}
                title={`${row.attempts} tries · ${formatTime(row.updated_at)}`}
                onClick={() => setDetail({student, mission, row})}
            >
                <span className="t-mark">{passed ? '✓' : (struggling ? '!' : '…')}</span>
                <small>
                    {`${row.attempts}x`}
                    {duration ? ` · ${duration}` : ''}
                </small>
            </td>
        );
    };

    return (
        <div className="teacher-page">
            <header className="teacher-header">
                <div>
                    <div className="teacher-brand">Qubit123</div>
                    <h1>Teacher Dashboard</h1>
                </div>
                <div className="teacher-actions">
                    <button className="link-button" onClick={load}>Refresh</button>
                    <Link className="link-button" to="/">Mission Map →</Link>
                </div>
            </header>

            <div className="teacher-stats">
                <div className="t-stat">
                    <b>{visibleStudents.length}</b><span>students</span>
                </div>
                <div className="t-stat">
                    <b>{`${passRate}%`}</b><span>{`overall progress (${passedTotal} passes)`}</span>
                </div>
                <div className="t-stat">
                    <b>{activeToday}</b><span>active in last 24h</span>
                </div>
                <div className={`t-stat ${strugglingCount > 0 ? 't-stat-warn' : ''}`}>
                    <b>{strugglingCount}</b><span>{`need help (${STRUGGLE_ATTEMPTS}+ tries, not passed)`}</span>
                </div>
            </div>

            <div className="class-filter">
                <button
                    className={classFilter === 'all' ? 'active' : ''}
                    onClick={() => setClassFilter('all')}
                >{`All (${students.length})`}</button>
                {classNames.map(name => {
                    const count = students.filter(s => (s.class_name || UNASSIGNED) === name).length;
                    return (
                        <button
                            key={name}
                            className={classFilter === name ? 'active' : ''}
                            onClick={() => setClassFilter(name)}
                        >{`${name} (${count})`}</button>
                    );
                })}
            </div>

            <div className="teacher-table-wrap">
                <table className="teacher-table">
                    <thead>
                        <tr>
                            <th className="t-student">Student</th>
                            {missions.map(m => (
                                <th key={m.id} title={m.title}>{`M${m.order_index}`}<small>{m.title}</small></th>
                            ))}
                            <th>Progress</th>
                            <th>Last active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleStudents.map(student => {
                            const passedCount = missions.filter(m =>
                                progressMap.get(`${student.id}:${m.id}`)?.status === 'passed').length;
                            return (
                                <tr key={student.id}>
                                    <td className="t-student">
                                        {student.display_name || student.username}
                                    </td>
                                    {missions.map(m => cellFor(student, m))}
                                    <td className="t-ratio">
                                        <div className="t-bar">
                                            <i style={{width: `${(passedCount / missions.length) * 100}%`}} />
                                        </div>
                                        {`${passedCount}/${missions.length}`}
                                    </td>
                                    <td className="t-last">{timeAgo(lastActivity(student))}</td>
                                </tr>
                            );
                        })}
                        {visibleStudents.length === 0 && (
                            <tr><td colSpan={missions.length + 3} className="t-empty">No students yet.</td></tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="t-foot-label">
                            <td className="t-student">Per-mission summary</td>
                            {missionStats.map(stat => (
                                <td key={stat.missionId}>
                                    <div className="t-foot-pass">
                                        {`passed ${stat.passedCount}/${visibleStudents.length}`}
                                    </div>
                                    <div className="t-foot-sub">
                                        {stat.avgAttempts !== null
                                            ? `avg ${stat.avgAttempts.toFixed(1)} tries`
                                            : '·'}
                                    </div>
                                    <div className="t-foot-sub">
                                        {stat.avgDuration !== null
                                            ? `avg ${formatMins(stat.avgDuration)}`
                                            : '·'}
                                    </div>
                                </td>
                            ))}
                            <td colSpan={2} />
                        </tr>
                    </tfoot>
                </table>
            </div>

            <p className="t-legend">
                ✓ passed · … in progress · <span className="t-legend-warn">!</span>
                {` ${STRUGGLE_ATTEMPTS}+ tries without passing (needs help) · click a cell for grading details`}
            </p>

            {detail && (
                <div className="t-modal-backdrop" onClick={() => setDetail(null)}>
                    <div className="t-modal" onClick={e => e.stopPropagation()}>
                        <h3>
                            {`${detail.student.display_name || detail.student.username} — M${detail.mission.order_index} ${detail.mission.title}`}
                        </h3>
                        <p className="t-modal-meta">
                            {`Status: ${detail.row.status === 'passed' ? 'passed' : 'in progress'} · ${detail.row.attempts} tries`}
                            {detail.row.passed_at && ` · passed ${formatTime(detail.row.passed_at)}`}
                        </p>
                        {detail.row.status === 'passed' && (
                            <p className="t-modal-meta">
                                {'Time taken: '}
                                {formatMins(durationMins(detail.row.started_at, detail.row.passed_at)) || 'not recorded'}
                            </p>
                        )}
                        {detail.row.last_result?.checks ? (
                            <ul className="t-checks">
                                {detail.row.last_result.checks.map(check => (
                                    <li key={check.id} className={check.passed ? 'check-pass' : 'check-fail'}>
                                        {check.passed ? '✔ Passed' : `✘ ${check.feedback}`}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="t-modal-meta">No grading record yet.</p>}
                        {detail.row.last_result?.counts && (
                            <p className="t-modal-meta">
                                {'Last measurement: '}
                                {Object.entries(detail.row.last_result.counts)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([state, count]) => `|${state}⟩ ${count}`)
                                    .join(', ')}
                            </p>
                        )}
                        <button className="t-close" onClick={() => setDetail(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherPage;
