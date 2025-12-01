const SET_USER = 'scratch-gui/auth/SET_USER';
const SET_LOADING = 'scratch-gui/auth/SET_LOADING';
const SET_ERROR = 'scratch-gui/auth/SET_ERROR';

const authInitialState = {
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
};

// Actions
const setUser = (user, profile) => ({
    type: SET_USER,
    user,
    profile
});

const setLoading = isLoading => ({
    type: SET_LOADING,
    isLoading
});

const setError = error => ({
    type: SET_ERROR,
    error
});

// Selectors
const selectIsAuthenticated = state => state.scratchGui.auth.isAuthenticated;
const selectIsLoading = state => state.scratchGui.auth.isLoading;
const selectUser = state => state.scratchGui.auth.user;
const selectProfile = state => state.scratchGui.auth.profile;
const selectError = state => state.scratchGui.auth.error;

// Reducer
const authReducer = function (state, action) {
    if (typeof state === 'undefined') state = authInitialState;
    switch (action.type) {
    case SET_USER:
        return Object.assign({}, state, {
            user: action.user,
            profile: action.profile,
            isAuthenticated: !!action.user,
            isLoading: false,
            error: null
        });
    case SET_LOADING:
        return Object.assign({}, state, {
            isLoading: action.isLoading
        });
    case SET_ERROR:
        return Object.assign({}, state, {
            error: action.error,
            isLoading: false
        });
    default:
        return state;
    }
};

export {
    authReducer as default,
    authInitialState,
    setUser,
    setLoading,
    setError,
    selectIsAuthenticated,
    selectIsLoading,
    selectUser,
    selectProfile,
    selectError
};
