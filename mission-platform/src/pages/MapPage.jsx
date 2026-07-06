import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {supabase} from '../lib/supabaseClient';
import {computeUnlocks} from '../lib/progress';
import {useAuth} from '../context/AuthContext';
import OdysseyMap from '../components/map-themes/OdysseyMap';
import '../components/map-themes/themes.css';

const MapPage = () => {
    const {session, profile, logout} = useAuth();
    const [chapters, setChapters] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!session?.user?.id) return;
        const load = async () => {
            const [chaptersRes, missionsRes, progressRes] = await Promise.all([
                supabase.from('chapters').select('*').order('order_index'),
                supabase.from('missions')
                    .select('id, chapter_id, order_index, title')
                    .order('order_index'),
                // 명시적으로 내 진행만 조회 — admin은 RLS상 전체 학생의
                // 기록이 보이므로 필터가 없으면 맵 상태가 뒤섞인다.
                supabase.from('mission_progress').select('*')
                    .eq('user_id', session.user.id)
            ]);
            const firstError = chaptersRes.error || missionsRes.error || progressRes.error;
            if (firstError) {
                setError(firstError.message);
                return;
            }
            setChapters(computeUnlocks(
                chaptersRes.data,
                missionsRes.data,
                progressRes.data
            ));
        };
        load();
    }, [session?.user?.id]);

    if (error) return <div className="page-loading">오류: {error}</div>;

    return (
        <div className="odyssey-page">
            <div className="odyssey-stars" />
            <header className="odyssey-header">
                <div className="odyssey-logo">Qubit123</div>
                <div className="odyssey-user">
                    {profile?.role === 'admin' && (
                        <Link className="odyssey-teacher-link" to="/teacher">교사 대시보드</Link>
                    )}
                    <span className="odyssey-chip">
                        {profile?.display_name || profile?.username || '...'}
                    </span>
                    <button className="odyssey-logout" onClick={logout}>로그아웃</button>
                </div>
            </header>
            {chapters
                ? <OdysseyMap chapters={chapters} />
                : <div className="odyssey-loading">우주 항해 준비 중...</div>}
        </div>
    );
};

export default MapPage;
