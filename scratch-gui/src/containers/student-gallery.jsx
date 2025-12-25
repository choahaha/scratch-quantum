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
            'fetchScreensQuiet',
            'fetchVisualizationsQuiet',
            'handleRealtimeInsert',
            'handleDeleteAll',
            'handleDeleteScreen',
            'handleDeleteVisualization',
            'handleDeleteStudent'
        ]);
        this.state = {
            loading: true,
            screens: [],
            allScreens: {},
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
            const allScreensByUser = {};
            data.forEach(screen => {
                if (!latestByUser[screen.user_id]) {
                    latestByUser[screen.user_id] = screen;
                }
                if (!allScreensByUser[screen.user_id]) {
                    allScreensByUser[screen.user_id] = [];
                }
                allScreensByUser[screen.user_id].push(screen);
            });

            this.setState({
                screens: Object.values(latestByUser),
                allScreens: allScreensByUser,
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

    async fetchScreensQuiet () {
        try {
            const {data, error} = await supabase
                .from('student_screens')
                .select('*')
                .order('created_at', {ascending: false});

            if (error) {
                console.error('Error fetching screens:', error);
                return;
            }

            const latestByUser = {};
            const allScreensByUser = {};
            data.forEach(screen => {
                if (!latestByUser[screen.user_id]) {
                    latestByUser[screen.user_id] = screen;
                }
                if (!allScreensByUser[screen.user_id]) {
                    allScreensByUser[screen.user_id] = [];
                }
                allScreensByUser[screen.user_id].push(screen);
            });

            this.setState({
                screens: Object.values(latestByUser),
                allScreens: allScreensByUser
            });
        } catch (error) {
            console.error('Error fetching screens:', error);
        }
    }

    async fetchVisualizationsQuiet () {
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

    async handleDeleteScreen (screenId) {
        console.log('=== handleDeleteScreen START ===');
        console.log('screenId:', screenId);
        if (!screenId) {
            console.log('No screenId, returning');
            return;
        }
        try {
            console.log('Calling supabase delete...');
            const {data, error} = await supabase
                .from('student_screens')
                .delete()
                .eq('id', screenId)
                .select();

            console.log('Delete result - data:', data, 'error:', error);

            if (error) {
                console.error('Error deleting screen:', error);
                alert('삭제 실패: ' + error.message);
                return;
            }

            if (!data || data.length === 0) {
                console.log('No rows deleted - might be RLS issue');
                alert('삭제 실패: 권한이 없거나 항목을 찾을 수 없습니다.');
                return;
            }

            console.log('Delete successful, fetching screens...');
            // 화면 갱신 (loading 없이)
            this.fetchScreensQuiet();
            console.log('=== handleDeleteScreen END ===');
        } catch (error) {
            console.error('Exception in handleDeleteScreen:', error);
            alert('삭제 중 오류: ' + error.message);
        }
    }

    async handleDeleteVisualization (vizId) {
        if (!vizId) return;
        try {
            const {error} = await supabase
                .from('student_visualizations')
                .delete()
                .eq('id', vizId);

            if (error) {
                console.error('Error deleting visualization:', error);
                return;
            }

            // 화면 갱신 (loading 없이)
            this.fetchVisualizationsQuiet();
        } catch (error) {
            console.error('Error deleting visualization:', error);
        }
    }

    async handleDeleteStudent (userId) {
        if (!userId) return;
        if (!window.confirm('이 학생의 모든 데이터를 삭제하시겠습니까?')) return;

        try {
            // 1. 해당 학생의 모든 스크린 삭제
            await supabase
                .from('student_screens')
                .delete()
                .eq('user_id', userId);

            // 2. 해당 학생의 모든 시각화 삭제
            await supabase
                .from('student_visualizations')
                .delete()
                .eq('user_id', userId);

            // 3. 화면 갱신
            this.fetchScreensQuiet();
            this.fetchVisualizationsQuiet();
        } catch (error) {
            console.error('Error deleting student data:', error);
        }
    }

    render () {
        return (
            <StudentGalleryComponent
                isRtl={this.props.isRtl}
                loading={this.state.loading}
                screens={this.state.screens}
                allScreens={this.state.allScreens}
                visualizations={this.state.visualizations}
                onRefresh={this.handleRefresh}
                onRequestClose={this.handleClose}
                onDeleteAll={this.handleDeleteAll}
                onDeleteScreen={this.handleDeleteScreen}
                onDeleteVisualization={this.handleDeleteVisualization}
                onDeleteStudent={this.handleDeleteStudent}
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
