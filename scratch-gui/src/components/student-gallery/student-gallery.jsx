import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import Modal from '../../containers/modal.jsx';
import styles from './student-gallery.css';

const messages = defineMessages({
    title: {
        id: 'gui.studentGallery.title',
        defaultMessage: 'Student Screens',
        description: 'Title for the student gallery modal'
    }
});

const StudentGalleryComponent = ({
    intl,
    isRtl,
    loading,
    onRequestClose,
    onRefresh,
    onDeleteAll,
    screens,
    visualizations
}) => {
    const [selectedScreen, setSelectedScreen] = useState(null);
    const [detailTab, setDetailTab] = useState('screen');
    const [vizIndex, setVizIndex] = useState(0);
    const uniqueStudents = new Set(screens.map(s => s.user_id)).size;

    const formatTime = timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get visualizations for selected user
    const getUserVisualizations = userId => {
        return visualizations.filter(v => v.user_id === userId);
    };

    return (
        <Modal
            fullScreen
            id="studentGalleryModal"
            contentLabel={intl.formatMessage(messages.title)}
            isRtl={isRtl}
            onRequestClose={onRequestClose}
        >
            <div className={styles.galleryHeader}>
                <span className={styles.studentCount}>
                    <FormattedMessage
                        defaultMessage="{count} students"
                        description="Number of students with screens"
                        id="gui.studentGallery.studentCount"
                        values={{count: uniqueStudents}}
                    />
                </span>
                <div className={styles.headerButtons}>
                    <button
                        className={styles.refreshButton}
                        onClick={onRefresh}
                    >
                        <FormattedMessage
                            defaultMessage="Refresh"
                            description="Button to refresh student screens"
                            id="gui.studentGallery.refresh"
                        />
                    </button>
                    <button
                        className={styles.deleteAllButton}
                        onClick={onDeleteAll}
                    >
                        <FormattedMessage
                            defaultMessage="Delete All"
                            description="Button to delete all screens"
                            id="gui.studentGallery.deleteAll"
                        />
                    </button>
                </div>
            </div>
            <div className={styles.galleryContent}>
                {loading ? (
                    <div className={styles.loading}>
                        <FormattedMessage
                            defaultMessage="Loading..."
                            description="Loading message"
                            id="gui.studentGallery.loading"
                        />
                    </div>
                ) : screens.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>{'📭'}</div>
                        <FormattedMessage
                            defaultMessage="No student screens yet"
                            description="Empty state message"
                            id="gui.studentGallery.empty"
                        />
                    </div>
                ) : (
                    <div className={styles.galleryGrid}>
                        {screens.map(screen => (
                            <div
                                key={screen.id}
                                className={styles.galleryItem}
                                onClick={() => {
                                    setSelectedScreen(screen);
                                    setDetailTab('screen');
                                    setVizIndex(0);
                                }}
                            >
                                <img
                                    className={styles.screenshot}
                                    src={screen.screenshot_url}
                                    alt={screen.username}
                                />
                                <div className={styles.itemInfo}>
                                    <p className={styles.username}>{screen.username}</p>
                                    <p className={styles.timestamp}>{formatTime(screen.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedScreen && (
                <div
                    className={styles.detailModal}
                    onClick={() => setSelectedScreen(null)}
                >
                    <div
                        className={styles.detailContent}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className={styles.closeButton}
                            onClick={() => setSelectedScreen(null)}
                        >
                            {'✕'}
                        </button>

                        {/* User info header */}
                        <div className={styles.detailHeader}>
                            <p className={styles.detailUsername}>{selectedScreen.username}</p>
                            <p className={styles.detailTime}>{formatTime(selectedScreen.created_at)}</p>
                        </div>

                        {/* Tab navigation */}
                        <div className={styles.tabContainer}>
                            <button
                                className={`${styles.tabButton} ${detailTab === 'screen' ? styles.tabActive : ''}`}
                                onClick={() => setDetailTab('screen')}
                            >
                                {'스크린샷'}
                            </button>
                            <button
                                className={`${styles.tabButton} ${detailTab === 'blocks' ? styles.tabActive : ''}`}
                                onClick={() => setDetailTab('blocks')}
                            >
                                {'블록'}
                            </button>
                            <button
                                className={`${styles.tabButton} ${detailTab === 'visualization' ? styles.tabActive : ''}`}
                                onClick={() => setDetailTab('visualization')}
                            >
                                {'시각화'}
                                {getUserVisualizations(selectedScreen.user_id).length > 0 && (
                                    <span className={styles.tabBadge}>
                                        {getUserVisualizations(selectedScreen.user_id).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Tab content */}
                        <div className={styles.tabContent}>
                            {detailTab === 'screen' && (
                                <div className={styles.tabPane}>
                                    <img
                                        src={selectedScreen.screenshot_url}
                                        alt={selectedScreen.username}
                                        className={styles.detailImage}
                                    />
                                </div>
                            )}

                            {detailTab === 'blocks' && (
                                <div className={styles.tabPane}>
                                    {selectedScreen.blocks_image_url ? (
                                        <img
                                            src={selectedScreen.blocks_image_url}
                                            alt="Block code"
                                            className={styles.blocksImage}
                                        />
                                    ) : (
                                        <p className={styles.noContent}>{'블록 이미지가 없습니다.'}</p>
                                    )}
                                </div>
                            )}

                            {detailTab === 'visualization' && (() => {
                                const userViz = getUserVisualizations(selectedScreen.user_id);
                                const currentViz = userViz[vizIndex];
                                return (
                                    <div className={styles.tabPane}>
                                        {userViz.length > 0 ? (
                                            <div className={styles.vizContainer}>
                                                <div className={styles.vizInfo}>
                                                    <span className={styles.vizType}>
                                                        {currentViz.visualization_type === 'histogram' ? '히스토그램' : '회로도'}
                                                    </span>
                                                    <span className={styles.vizTime}>
                                                        {formatTime(currentViz.created_at)}
                                                    </span>
                                                </div>
                                                <div className={styles.vizImageWrapper}>
                                                    <button
                                                        className={styles.navButton}
                                                        onClick={() => setVizIndex(Math.min(userViz.length - 1, vizIndex + 1))}
                                                        disabled={vizIndex === userViz.length - 1}
                                                    >
                                                        {'<'}
                                                    </button>
                                                    <img
                                                        src={currentViz.image_url}
                                                        alt={currentViz.visualization_type}
                                                        className={styles.detailImage}
                                                    />
                                                    <button
                                                        className={styles.navButton}
                                                        onClick={() => setVizIndex(Math.max(0, vizIndex - 1))}
                                                        disabled={vizIndex === 0}
                                                    >
                                                        {'>'}
                                                    </button>
                                                </div>
                                                <div className={styles.vizCounter}>
                                                    {vizIndex + 1} / {userViz.length}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={styles.noContent}>{'시각화 이미지가 없습니다.'}</p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

StudentGalleryComponent.propTypes = {
    intl: intlShape.isRequired,
    isRtl: PropTypes.bool,
    loading: PropTypes.bool,
    onDeleteAll: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    screens: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        user_id: PropTypes.string,
        username: PropTypes.string,
        screenshot_url: PropTypes.string,
        blocks_image_url: PropTypes.string,
        created_at: PropTypes.string
    })),
    visualizations: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        user_id: PropTypes.string,
        username: PropTypes.string,
        visualization_type: PropTypes.string,
        image_url: PropTypes.string,
        created_at: PropTypes.string
    }))
};

StudentGalleryComponent.defaultProps = {
    loading: false,
    screens: [],
    visualizations: []
};

export default injectIntl(StudentGalleryComponent);
