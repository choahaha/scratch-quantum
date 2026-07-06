import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {supabase} from '../lib/supabaseClient';
import {computeUnlocks, findNextMission} from '../lib/progress';
import {submitMission} from '../lib/gradingApi';
import ScratchEmbed from '../components/ScratchEmbed';
import GradeFeedback from '../components/GradeFeedback';

const MissionPage = () => {
    const {missionId} = useParams();
    const navigate = useNavigate();
    const bridgeRef = useRef(null);

    const [mission, setMission] = useState(null);
    const [nextMission, setNextMission] = useState(null);
    const [lastRun, setLastRun] = useState(null);
    const [gradeResult, setGradeResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            const id = Number(missionId);
            const [chaptersRes, missionsRes, progressRes] = await Promise.all([
                supabase.from('chapters').select('*').order('order_index'),
                supabase.from('missions').select('*').order('order_index'),
                supabase.from('mission_progress').select('*')
            ]);
            if (chaptersRes.error || missionsRes.error || progressRes.error) {
                setError((chaptersRes.error || missionsRes.error || progressRes.error).message);
                return;
            }
            const chapters = computeUnlocks(chaptersRes.data, missionsRes.data, progressRes.data);
            const flat = chapters.flatMap(chapter => chapter.missions);
            const current = flat.find(m => m.id === id);

            if (!current || current.state === 'locked') {
                navigate('/', {replace: true});
                return;
            }
            setMission(current);
            setNextMission(findNextMission(chapters, id));

            // Mark as started (RLS only allows inserting 'in_progress')
            const {data: {session}} = await supabase.auth.getSession();
            if (session && !current.progress) {
                await supabase.from('mission_progress').insert({
                    user_id: session.user.id,
                    mission_id: id,
                    status: 'in_progress'
                });
            }
        };
        setGradeResult(null);
        setLastRun(null);
        setError('');
        load();
    }, [missionId, navigate]);

    const handleSubmit = async () => {
        if (!bridgeRef.current) return;
        setSubmitting(true);
        setError('');
        try {
            const snapshot = await bridgeRef.current.requestSubmit();
            if (!snapshot.blocks || snapshot.blocks.length === 0) {
                throw new Error('먼저 양자 회로를 만들고 실행해 보세요!');
            }
            const {data: {session}} = await supabase.auth.getSession();
            if (!session) throw new Error('로그인이 만료되었습니다.');
            const result = await submitMission(
                session.access_token,
                mission.id,
                snapshot.blocks,
                snapshot.projectJson
            );
            setGradeResult(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (error && !mission) return <div className="page-loading">오류: {error}</div>;
    if (!mission) return <div className="page-loading">로딩 중...</div>;

    return (
        <div className="mission-page">
            <aside className="mission-panel">
                <Link to="/" className="back-link">← 미션 맵으로</Link>
                <h2>{mission.title}</h2>
                <div className="mission-description">
                    {mission.description.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) return <h3 key={i}>{line.slice(3)}</h3>;
                        if (line.startsWith('### ')) return <h4 key={i}>{line.slice(4)}</h4>;
                        if (/^\d+\. /.test(line)) return <p key={i} className="step-line">{renderInlineBold(line)}</p>;
                        if (line.trim() === '') return null;
                        return <p key={i}>{renderInlineBold(line)}</p>;
                    })}
                </div>

                <div className="mission-actions">
                    {lastRun && (
                        <p className="run-preview">
                            {'최근 실행: '}
                            {Object.entries(lastRun.counts || {})
                                .map(([state, count]) => `|${state}⟩ ${count}`)
                                .join(', ') || lastRun.resultText}
                        </p>
                    )}
                    <button
                        className="grade-submit-button"
                        disabled={!lastRun || submitting}
                        onClick={handleSubmit}
                        title={lastRun ? '' : '회로를 실행하면 제출할 수 있어요'}
                    >
                        {submitting ? '채점 중...' : '제출하기'}
                    </button>
                    {!lastRun && !gradeResult && (
                        <p className="hint">에디터에서 양자 회로를 만들어 실행하면 제출 버튼이 켜져요.</p>
                    )}
                    {error && <p className="form-error">{error}</p>}
                    <GradeFeedback result={gradeResult} />
                    {gradeResult?.passed && (
                        nextMission ? (
                            <Link className="next-link" to={`/missions/${nextMission.id}`}>
                                다음 미션: {nextMission.title} →
                            </Link>
                        ) : (
                            <p className="next-link">🏆 모든 미션을 완료했어요!</p>
                        )
                    )}
                </div>
            </aside>
            <main className="mission-editor">
                <ScratchEmbed
                    mission={mission}
                    bridgeRef={bridgeRef}
                    onQuantumRun={payload => setLastRun(payload)}
                    onBridgeError={message => setError(message || '에디터 연결 오류')}
                />
            </main>
        </div>
    );
};

// Minimal **bold** rendering for mission descriptions
const renderInlineBold = text => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
};

export default MissionPage;
