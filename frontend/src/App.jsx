import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Resumes from './pages/Resumes'
import Jobs from './pages/Jobs'
import Matching from './pages/Matching'
import Layout from './components/Layout'
import Analytics from './pages/Analytics'
import LandingPage from './pages/LandingPage'


const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#4f8eff',fontFamily:'Syne'}}>Loading...</div>
  return token ? children : <Navigate to="/home" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      }/>
      <Route path="/resumes" element={
        <PrivateRoute>
          <Layout>
            <Resumes />
          </Layout>
        </PrivateRoute>
      }/>
      <Route path="/jobs" element={
        <PrivateRoute>
          <Layout>
            <Jobs />
          </Layout>
        </PrivateRoute>
      }/>
      <Route path="/matching" element={
        <PrivateRoute>
          <Layout>
            <Matching />
          </Layout>
        </PrivateRoute>
      }/>
      <Route path="/analytics" element={
        <PrivateRoute>
          <Layout>
            <Analytics />
            </Layout>
            </PrivateRoute>
        } />
        <Route path="/home" element={
          <LandingPage />
        } />
      <Route path="/" element={<Navigate to="/" />} />
    </Routes>
  )
}