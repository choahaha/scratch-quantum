import {useCallback, useEffect, useState} from 'react';
import {Link, Navigate} from 'react-router-dom';
import {supabase} from '../lib/supabaseClient';
import {useAuth} from '../context/AuthContext';

const formatTime = iso => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('ko-KR', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

/** 교사용 진행 현황: 학생 × 미션 매트릭스 */
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
    if (error) return <div className="page-loading">오류: {error}</div>;
    if (!profile || !students || !missions) return <div className="page-loading">로딩 중...</div>;

    const UNASSIGNED = '미배정';
    const classNames = [...new Set(students.map(s => s.class_name || UNASSIGNED))]
        .sort((a, b) => (a === UNASSIGNED) - (b === UNASSIGNED) || a.localeCompare(b, 'ko'));
    const visibleStudents = classFilter === 'all'
        ? students
        : students.filter(s => (s.class_name || UNASSIGNED) === classFilter);

    const progressMap = new Map(progress.map(row => [`${row.user_id}:${row.mission_id}`, row]));
    const studentIds = new Set(visibleStudents.map(s => s.id));
    const passedTotal = progress.filter(row =>
        row.status === 'passed' && studentIds.has(row.user_id)).length;

    const cellFor = (student, mission) => {
        const row = progressMap.get(`${student.id}:${mission.id}`);
        if (!row) return <td key={mission.id} className="t-cell t-none">—</td>;
        const passed = row.status === 'passed';
        return (
            <td
                key={mission.id}
                className={`t-cell ${passed ? 't-pass' : 't-try'}`}
                title={`시도 ${row.attempts}회 · ${formatTime(row.updated_at)}`}
                onClick={() => setDetail({student, mission, row})}
            >
                {passed ? '✅' : '🔄'}
                <small>{row.attempts > 0 ? `${row.attempts}회` : ''}</small>
            </td>
        );
    };

    return (
        <div className="teacher-page">
            <header className="teacher-header">
                <div>
                    <h1>교사 대시보드</h1>
                    <p className="teacher-sub">
                        {`학생 ${visibleStudents.length}명 · 미션 통과 ${passedTotal}건 · 실시간 갱신`}
                    </p>
                </div>
                <div className="teacher-actions">
                    <button className="link-button" onClick={load}>새로고침</button>
                    <Link className="link-button" to="/">미션 맵으로 →</Link>
                </div>
            </header>

            <div className="class-filter">
                <button
                    className={classFilter === 'all' ? 'active' : ''}
                    onClick={() => setClassFilter('all')}
                >{`전체 (${students.length})`}</button>
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
                            <th className="t-student">학생</th>
                            {missions.map(m => (
                                <th key={m.id} title={m.title}>{`M${m.order_index}`}<small>{m.title}</small></th>
                            ))}
                            <th>진행률</th>
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
                                    <td className="t-ratio">{`${passedCount}/${missions.length}`}</td>
                                </tr>
                            );
                        })}
                        {visibleStudents.length === 0 && (
                            <tr><td colSpan={missions.length + 2} className="t-empty">아직 등록된 학생이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {detail && (
                <div className="t-modal-backdrop" onClick={() => setDetail(null)}>
                    <div className="t-modal" onClick={e => e.stopPropagation()}>
                        <h3>
                            {`${detail.student.display_name || detail.student.username} — M${detail.mission.order_index} ${detail.mission.title}`}
                        </h3>
                        <p className="t-modal-meta">
                            {`상태: ${detail.row.status === 'passed' ? '통과' : '시도 중'} · 시도 ${detail.row.attempts}회`}
                            {detail.row.passed_at && ` · 통과 ${formatTime(detail.row.passed_at)}`}
                        </p>
                        {detail.row.last_result?.checks ? (
                            <ul className="t-checks">
                                {detail.row.last_result.checks.map(check => (
                                    <li key={check.id} className={check.passed ? 'check-pass' : 'check-fail'}>
                                        {check.passed ? '✔ 통과' : `✘ ${check.feedback}`}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="t-modal-meta">아직 채점 기록이 없습니다.</p>}
                        {detail.row.last_result?.counts && (
                            <p className="t-modal-meta">
                                {'마지막 측정: '}
                                {Object.entries(detail.row.last_result.counts)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([state, count]) => `|${state}⟩ ${count}`)
                                    .join(', ')}
                            </p>
                        )}
                        <button className="t-close" onClick={() => setDetail(null)}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherPage;
