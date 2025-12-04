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
    screens
}) => {
    const [selectedScreen, setSelectedScreen] = useState(null);
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
                                onClick={() => setSelectedScreen(screen)}
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
                        <div className={styles.detailLeft}>
                            <img
                                src={selectedScreen.screenshot_url}
                                alt={selectedScreen.username}
                                className={styles.detailImage}
                            />
                            <div className={styles.detailInfo}>
                                <p className={styles.detailUsername}>{selectedScreen.username}</p>
                                <p className={styles.detailTime}>{formatTime(selectedScreen.created_at)}</p>
                            </div>
                        </div>
                        <div className={styles.detailRight}>
                            <h3>{'프로젝트 코드'}</h3>
                            {selectedScreen.project_json ? (
                                <pre className={styles.codeBlock}>
                                    {JSON.stringify(selectedScreen.project_json, null, 2)}
                                </pre>
                            ) : (
                                <p className={styles.noCode}>{'코드 데이터가 없습니다.'}</p>
                            )}
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
        created_at: PropTypes.string,
        project_json: PropTypes.object
    }))
};

StudentGalleryComponent.defaultProps = {
    loading: false,
    screens: []
};

export default injectIntl(StudentGalleryComponent);
