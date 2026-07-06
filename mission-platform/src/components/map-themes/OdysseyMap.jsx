import {Link} from 'react-router-dom';
import {countPassed, odysseyLayout} from './helpers';

const ICONS = {passed: '✓', available: '★', locked: '🔒'};
const NODE_CLASS = {passed: 'va-passed', available: 'va-current', locked: 'va-locked'};

/** A. 퀀텀 오디세이 — 우주 궤도 맵 (full-bleed, 페이지 배경은 MapPage가 담당) */
const OdysseyMap = ({chapters}) => (
    <div className="odyssey-chapters">
        {chapters.map(chapter => {
            const {points, path, donePath} = odysseyLayout(chapter.missions);
            const passed = countPassed(chapter.missions);
            return (
                <section key={chapter.id} className="va">
                    <div className="va-head">
                        <h2>{`Chapter ${chapter.order_index}. ${chapter.title}`}</h2>
                        <div className="va-sub">Clear missions one by one and sail the quantum universe</div>
                        <div className="va-progress">
                            <i style={{width: `${(passed / chapter.missions.length) * 100}%`}} />
                        </div>
                    </div>
                    <div className="va-map">
                        <svg className="va-orbit" viewBox="0 0 1060 380" preserveAspectRatio="none" fill="none">
                            <path
                                d={path}
                                stroke="rgba(140,147,205,0.35)"
                                strokeWidth="2.5"
                                strokeDasharray="1 10"
                                strokeLinecap="round"
                            />
                            {donePath && (
                                <path
                                    d={donePath}
                                    stroke="url(#vaGrad)"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                            )}
                            <defs>
                                <linearGradient id="vaGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0" stopColor="#34d399" />
                                    <stop offset="1" stopColor="#ff4081" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {points.map(({mission, x, y}) => {
                            const inner = (
                                <>
                                    <div className="va-orb">{ICONS[mission.state]}</div>
                                    <span>{mission.title}</span>
                                </>
                            );
                            const style = {left: `${x}%`, top: `${y}%`};
                            const className = `va-node ${NODE_CLASS[mission.state]}`;
                            return mission.state === 'locked' ? (
                                <div key={mission.id} className={className} style={style}>{inner}</div>
                            ) : (
                                <Link
                                    key={mission.id}
                                    className={className}
                                    style={style}
                                    to={`/missions/${mission.id}`}
                                >{inner}</Link>
                            );
                        })}
                    </div>
                </section>
            );
        })}
    </div>
);

export default OdysseyMap;
