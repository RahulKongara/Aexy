import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ConversationScreen } from './pages/ConversationScreen';
import { History } from './pages/History';



const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuth, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-xl">Loading...</div>
			</div>
		);
	}

	return isAuth ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route
					path="/dashboard"
					element={
						<PrivateRoute>
							<Dashboard />
						</PrivateRoute>
					}
				/>
				<Route
					path="/conversation"
					element={
						<PrivateRoute>
							<ConversationScreen />
						</PrivateRoute>
					}
				/>
				<Route
					path="/history"
					element={
						<PrivateRoute>
							<History />
						</PrivateRoute>
					}
				/>
				<Route path="/" element={<Navigate to="/dashboard" />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;