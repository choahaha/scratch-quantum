import {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {supabase} from '../lib/supabaseClient';
import {computeUnlocks, findNextMission} from '../lib/progress';
import {submitMission} from '../lib/gradingApi';
import ScratchEmbed from '../components/ScratchEmbed';
import GradeFeedback from '../components/GradeFeedback';

const PANEL_WIDTH_KEY = 'sq-mission-panel-width';
const PANEL_MIN = 220;
const PANEL_MAX = 640;

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
    const [panelWidth, setPanelWidth] = useState(() => {
        const saved = Number(localStorage.getItem(PANEL_WIDTH_KEY));
        return saved >= PANEL_MIN && saved <= PANEL_MAX ? saved : 340;
    });
    const [resizing, setResizing] = useState(false);

    // Drag the divider to resize the mission panel. While dragging, the
    // iframe must not receive mouse events or the drag would get stuck
    // the moment the cursor crosses into it (handled via CSS .resizing).
    const startResize = useCallback(event => {
        event.preventDefault();
        setResizing(true);
        const onMove = e => {
            const width = Math.min(PANEL_MAX, Math.max(PANEL_MIN, e.clientX));
            setPanelWidth(width);
        };
        const onUp = e => {
            const width = Math.min(PANEL_MAX, Math.max(PANEL_MIN, e.clientX));
            localStorage.setItem(PANEL_WIDTH_KEY, String(width));
            setResizing(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);

    useEffect(() => {
        const load = async () => {
            const id = Number(missionId);
            const {data: {session}} = await supabase.auth.getSession();
            if (!session) return;
            const [chaptersRes, missionsRes, progressRes] = await Promise.all([
                supabase.from('chapters').select('*').order('order_index'),
                supabase.from('missions').select('*').order('order_index'),
                // 내 진행만 조회 (admin은 전체 학생 기록이 보이므로 필수)
                supabase.from('mission_progress').select('*')
                    .eq('user_id', session.user.id)
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
            if (!current.progress) {
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
                throw new Error('Build and run a quantum circuit first!');
            }
            const {data: {session}} = await supabase.auth.getSession();
            if (!session) throw new Error('Your session has expired. Please log in again.');
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

    if (error && !mission) return <div className="page-loading">Error: {error}</div>;
    if (!mission) return <div className="page-loading">Loading...</div>;

    return (
        <div className={`mission-page${resizing ? ' resizing' : ''}`}>
            <aside className="mission-panel" style={{width: panelWidth}}>
                <Link to="/" className="back-link">← Mission Map</Link>
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
                            {'Latest run: '}
                            {Object.entries(lastRun.counts || {})
                                .map(([state, count]) => `|${state}⟩ ${count}`)
                                .join(', ') || lastRun.resultText}
                        </p>
                    )}
                    <button
                        className="grade-submit-button"
                        disabled={!lastRun || submitting}
                        onClick={handleSubmit}
                        title={lastRun ? '' : 'Run your circuit to enable submission'}
                    >
                        {submitting ? 'Grading...' : 'Submit'}
                    </button>
                    {!lastRun && !gradeResult && (
                        <p className="hint">Build and run a quantum circuit in the editor to enable the Submit button.</p>
                    )}
                    {error && <p className="form-error">{error}</p>}
                    <GradeFeedback result={gradeResult} />
                    {gradeResult?.passed && (
                        nextMission ? (
                            <Link className="next-link" to={`/missions/${nextMission.id}`}>
                                Next mission: {nextMission.title} →
                            </Link>
                        ) : (
                            <p className="next-link">🏆 You completed every mission!</p>
                        )
                    )}
                </div>
            </aside>
            <div
                className="panel-resizer"
                title="Drag to resize"
                onMouseDown={startResize}
            />
            <main className="mission-editor">
                <ScratchEmbed
                    mission={mission}
                    bridgeRef={bridgeRef}
                    onQuantumRun={payload => setLastRun(payload)}
                    onBridgeError={message => setError(message || 'Editor connection error')}
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
