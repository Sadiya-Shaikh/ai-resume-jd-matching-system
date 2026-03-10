import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, FileText, Briefcase, Target, LogOut, ChevronLeft, ChevronRight, Cpu } from 'lucide-react'
import { BarChart3 } from 'lucide-react' 

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resumes', icon: FileText, label: 'Resumes' },
  { path: '/jobs', icon: Briefcase, label: 'Job Descriptions' },
  { path: '/matching', icon: Target, label: 'AI Matching' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '72px' : '248px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'fixed', height: '100vh', zIndex: 100, overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #4f8eff, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Cpu size={20} color="white" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px' }}>RecruitAI</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>SMART HIRING</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {!collapsed && (
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px', padding: '8px 8px 4px', marginBottom: '4px' }}>
              NAVIGATION
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 10px', borderRadius: '8px', marginBottom: '2px',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, #4f8eff, #6366f1)' : 'transparent',
                  fontWeight: isActive ? 600 : 400, fontSize: '14px',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 15px #4f8eff30' : 'none'
                })}
                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = '#ffffff08' }}
                onMouseLeave={e => { if (!e.currentTarget.style.background.includes('gradient')) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
                {!collapsed && item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div style={{
              padding: '10px', marginBottom: '8px', borderRadius: '8px',
              background: '#ffffff05', border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          )}
          <button onClick={logout} style={{
            width: '100%', padding: '9px 10px', borderRadius: '8px',
            background: 'transparent', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '10px',
            transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ef444415'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <LogOut size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            {!collapsed && 'Logout'}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: '100%', padding: '9px 10px', borderRadius: '8px',
            background: 'transparent', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px',
            marginTop: '2px', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif', fontSize: '13px'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#ffffff08'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        marginLeft: collapsed ? '72px' : '248px',
        flex: 1, padding: '36px',
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        minHeight: '100vh'
      }}>
        {children}
      </main>
    </div>
  )
}