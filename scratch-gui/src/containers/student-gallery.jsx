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
            'handleRealtimeInsert'
        ]);
        this.state = {
            loading: true,
            screens: []
        };
        this.subscription = null;
    }

    componentDidMount () {
        this.fetchScreens();
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

    handleClose () {
        this.props.onClose();
    }

    handleRefresh () {
        this.fetchScreens();
    }

    render () {
        return (
            <StudentGalleryComponent
                isRtl={this.props.isRtl}
                loading={this.state.loading}
                screens={this.state.screens}
                onRefresh={this.handleRefresh}
                onRequestClose={this.handleClose}
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
