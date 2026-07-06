import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import MissionPage from './pages/MissionPage';

const App = () => (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={<ProtectedRoute><MapPage /></ProtectedRoute>}
                />
                <Route
                    path="/missions/:missionId"
                    element={<ProtectedRoute><MissionPage /></ProtectedRoute>}
                />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
);

export default App;
