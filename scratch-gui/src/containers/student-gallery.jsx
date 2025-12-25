import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import StudentGalleryComponent from '../components/student-gallery/student-gallery.jsx';
import {closeStudentGallery} from '../reducers/modals';
import {supabase} from '../lib/supabase-client.js';

class StudentGallery extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose',
            'handleRefresh',
            'fetchScreens',
            'handleRealtimeInsert',
            'handleDeleteAll'
        ]);
        this.state = {
            loading: true,
            screens: [],
            visualizations: []
        };
        this.subscription = null;
        this.visualizationSubscription = null;
    }

    componentDidMount () {
        this.fetchScreens();
        this.fetchVisualizations();
        this.setupRealtimeSubscription();
    }

    componentWillUnmount () {
        if (this.subscription) {
            supabase.removeChannel(this.subscription);
        }
    }

    setupRealtimeSubscription () {
        this.subscription = supabase
            .channel('student_screens_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'student_screens'
                },
                this.handleRealtimeInsert
            )
            .subscribe();
    }

    handleRealtimeInsert (payload) {
        const newScreen = payload.new;
        this.setState(prevState => {
            const existingIndex = prevState.screens.findIndex(
                s => s.user_id === newScreen.user_id
            );

            let newScreens;
            if (existingIndex >= 0) {
                newScreens = [...prevState.screens];
                newScreens[existingIndex] = newScreen;
            } else {
                newScreens = [newScreen, ...prevState.screens];
            }

            return {screens: newScreens};
        });
    }

    async fetchScreens () {
        this.setState({loading: true});

        try {
            const {data, error} = await supabase
                .from('student_screens')
                .select('*')
                .order('created_at', {ascending: false});

            if (error) {
                console.error('Error fetching screens:', error);
                this.setState({loading: false});
                return;
            }

            const latestByUser = {};
            data.forEach(screen => {
                if (!latestByUser[screen.user_id]) {
                    latestByUser[screen.user_id] = screen;
                }
            });

            this.setState({
                screens: Object.values(latestByUser),
                loading: false
            });
        } catch (error) {
            console.error('Error fetching screens:', error);
            this.setState({loading: false});
        }
    }

    async fetchVisualizations () {
        try {
            const {data, error} = await supabase
                .from('student_visualizations')
                .select('*')
                .order('created_at', {ascending: false});

            if (error) {
                console.error('Error fetching visualizations:', error);
                return;
            }

            this.setState({visualizations: data || []});
        } catch (error) {
            console.error('Error fetching visualizations:', error);
        }
    }

    handleClose () {
        this.props.onClose();
    }

    handleRefresh () {
        this.fetchScreens();
        this.fetchVisualizations();
    }

    async handleDeleteAll () {
        if (!window.confirm('모든 학생 화면을 삭제하시겠습니까?')) return;

        try {
            // 1. Storage에서 모든 스크린샷 삭제
            const {data: folders} = await supabase.storage
                .from('screenshots')
                .list('', {limit: 1000});

            if (folders) {
                for (const folder of folders) {
                    if (folder.name === '.emptyFolderPlaceholder') continue;

                    const {data: files} = await supabase.storage
                        .from('screenshots')
                        .list(folder.name);

                    if (files && files.length > 0) {
                        const paths = files.map(f => `${folder.name}/${f.name}`);
                        await supabase.storage.from('screenshots').remove(paths);
                    }
                }
            }

            // 2. DB 테이블 비우기
            await supabase.from('student_screens').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // 3. 화면 갱신
            this.setState({screens: []});
            console.log('All screens deleted successfully');
        } catch (error) {
            console.error('Error deleting screens:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    }

    render () {
        return (
            <StudentGalleryComponent
                isRtl={this.props.isRtl}
                loading={this.state.loading}
                screens={this.state.screens}
                visualizations={this.state.visualizations}
                onRefresh={this.handleRefresh}
                onRequestClose={this.handleClose}
                onDeleteAll={this.handleDeleteAll}
            />
        );
    }
}

StudentGallery.propTypes = {
    isRtl: PropTypes.bool,
    onClose: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeStudentGallery())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StudentGallery);
