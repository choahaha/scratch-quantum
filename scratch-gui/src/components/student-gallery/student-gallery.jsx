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
    onDeleteScreen,
    onDeleteVisualization,
    onDeleteStudent,
    screens,
    allScreens,
    visualizations
}) => {
    const [selectedScreen, setSelectedScreen] = useState(null);
    const [detailTab, setDetailTab] = useState('program');
    const [screenIndex, setScreenIndex] = useState(0);
    const [vizIndex, setVizIndex] = useState(0);
    const [cardSize, setCardSize] = useState(250);
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

    // Get latest visualization for thumbnail
    const getLatestVisualization = userId => {
        const userViz = visualizations.filter(v => v.user_id === userId);
        return userViz.length > 0 ? userViz[0] : null;
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
                <div className={styles.headerControls}>
                    <div className={styles.sizeSlider}>
                        <span className={styles.sliderLabel}>{'작게'}</span>
                        <input
                            type="range"
                            min="150"
                            max="350"
                            value={cardSize}
                            onChange={e => setCardSize(Number(e.target.value))}
                            className={styles.slider}
                        />
                        <span className={styles.sliderLabel}>{'크게'}</span>
                    </div>
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
                    <div
                        className={styles.galleryGrid}
                        style={{gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize}px, 1fr))`}}
                    >
                        {screens.map(screen => {
                            const latestViz = getLatestVisualization(screen.user_id);
                            const thumbnailUrl = latestViz ? latestViz.image_url : screen.screenshot_url;
                            return (
                                <div
                                    key={screen.id}
                                    className={styles.galleryItem}
                                    onClick={() => {
                                        setSelectedScreen(screen);
                                        setDetailTab('program');
                                        setScreenIndex(0);
                                        setVizIndex(0);
                                    }}
                                >
                                    <img
                                        className={styles.screenshot}
                                        src={thumbnailUrl}
                                        alt={screen.username}
                                    />
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemInfoLeft}>
                                            <p className={styles.username}>{screen.username}</p>
                                            <p className={styles.timestamp}>{formatTime(screen.created_at)}</p>
                                        </div>
                                        <button
                                            className={styles.cardDeleteButton}
                                            onClick={e => {
                                                e.stopPropagation();
                                                onDeleteStudent(screen.user_id);
                                            }}
                                            title="삭제"
                                        >
                                            {'🗑️'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
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
                                className={`${styles.tabButton} ${detailTab === 'program' ? styles.tabActive : ''}`}
                                onClick={() => setDetailTab('program')}
                            >
                                {'프로그램'}
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
                            {detailTab === 'program' && (() => {
                                const userScreens = allScreens[selectedScreen.user_id] || [selectedScreen];
                                const currentScreen = userScreens[screenIndex] || selectedScreen;
                                return (
                                    <div className={styles.tabPane}>
                                        <div className={styles.vizContainer}>
                                            <div className={styles.vizInfo}>
                                                <span className={styles.vizTime}>
                                                    {formatTime(currentScreen.created_at)}
                                                </span>
                                                <button
                                                    className={styles.deleteItemButton}
                                                    onClick={() => onDeleteScreen(currentScreen.id)}
                                                    title="삭제"
                                                >
                                                    {'🗑️'}
                                                </button>
                                            </div>
                                            <div className={styles.programWrapper}>
                                                <button
                                                    className={styles.navButton}
                                                    onClick={() => setScreenIndex(Math.min(userScreens.length - 1, screenIndex + 1))}
                                                    disabled={screenIndex === userScreens.length - 1}
                                                >
                                                    {'<'}
                                                </button>
                                                <div className={styles.programImages}>
                                                    <div className={styles.programImageContainer}>
                                                        <img
                                                            src={currentScreen.screenshot_url}
                                                            alt={currentScreen.username}
                                                            className={styles.programImage}
                                                        />
                                                    </div>
                                                    <div className={styles.programImageContainer}>
                                                        {currentScreen.blocks_image_url ? (
                                                            <img
                                                                src={currentScreen.blocks_image_url}
                                                                alt="Block code"
                                                                className={styles.programImage}
                                                            />
                                                        ) : (
                                                            <div className={styles.noBlocksPlaceholder}>
                                                                {'블록 이미지 없음'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    className={styles.navButton}
                                                    onClick={() => setScreenIndex(Math.max(0, screenIndex - 1))}
                                                    disabled={screenIndex === 0}
                                                >
                                                    {'>'}
                                                </button>
                                            </div>
                                            <div className={styles.vizCounter}>
                                                {screenIndex + 1} / {userScreens.length}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

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
                                                    <button
                                                        className={styles.deleteItemButton}
                                                        onClick={() => onDeleteVisualization(currentViz.id)}
                                                        title="삭제"
                                                    >
                                                        {'🗑️'}
                                                    </button>
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
    allScreens: PropTypes.object,
    intl: intlShape.isRequired,
    isRtl: PropTypes.bool,
    loading: PropTypes.bool,
    onDeleteAll: PropTypes.func.isRequired,
    onDeleteScreen: PropTypes.func.isRequired,
    onDeleteStudent: PropTypes.func.isRequired,
    onDeleteVisualization: PropTypes.func.isRequired,
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
    allScreens: {},
    loading: false,
    screens: [],
    visualizations: []
};

export default injectIntl(StudentGalleryComponent);
