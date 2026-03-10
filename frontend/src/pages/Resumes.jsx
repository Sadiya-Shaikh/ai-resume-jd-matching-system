import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import { Upload, User, Mail, Phone, FileText, Trash2, X, Award, ChevronRight, Search } from 'lucide-react'

export default function Resumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const fileRef = useRef()

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/')
      setResumes(res.data.resumes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResumes() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await fetchResumes()
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    try {
      await api.delete(`/resumes/${id}`)
      setResumes(resumes.filter(r => r.resume_id !== id))
      if (selected?.resume_id === id) setSelected(null)
    } catch (err) {
      alert('Delete failed')
    }
  }

  const filtered = resumes.filter(r =>
    (r.candidate_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.candidate_email || '').toLowerCase().includes(search.toLowerCase())
  )

  const categoryColors = {
    programming_languages: '#4f8eff',
    frameworks_libraries: '#8b5cf6',
    databases: '#10b981',
    cloud_devops: '#f59e0b',
    web_technologies: '#ec4899',
    tools_ides: '#06b6d4',
    soft_skills: '#84cc16',
    testing: '#f97316',
    domain_knowledge: '#a78bfa',
    methodologies: '#64748b',
    other: '#94a3b8'
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>Resumes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} in your database
          </p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display: 'none' }} />
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', borderRadius: '12px', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer',
              background: uploading ? '#333' : 'linear-gradient(135deg, #4f8eff, #6366f1)',
              color: 'white', fontSize: '14px', fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif', boxShadow: uploading ? 'none' : '0 4px 20px #4f8eff30',
              transition: 'all 0.2s'
            }}
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{
            width: '100%', padding: '11px 14px 11px 42px', borderRadius: '12px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
            fontFamily: 'DM Sans, sans-serif'
          }}
          onFocus={e => e.target.style.borderColor = '#4f8eff'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* List */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #4f8eff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}/>
              Loading resumes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#4f8eff10', border: '1px solid #4f8eff20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FileText size={28} color="#4f8eff" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No resumes yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Upload PDF resumes to extract skills automatically</p>
              <button onClick={() => fileRef.current.click()} style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #4f8eff, #6366f1)', color: 'white',
                fontWeight: 700, fontSize: '14px', fontFamily: 'DM Sans, sans-serif'
              }}>Upload First Resume</button>
            </div>
          ) : (
            filtered.map((resume) => (
              <div key={resume.resume_id} onClick={() => setSelected(resume)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', marginBottom: '8px', borderRadius: '14px', cursor: 'pointer',
                  background: selected?.resume_id === resume.resume_id ? '#4f8eff08' : 'var(--bg-card)',
                  border: `1px solid ${selected?.resume_id === resume.resume_id ? '#4f8eff40' : 'var(--border)'}`,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (selected?.resume_id !== resume.resume_id) e.currentTarget.style.borderColor = '#ffffff20' }}
                onMouseLeave={e => { if (selected?.resume_id !== resume.resume_id) e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #4f8eff20, #8b5cf620)',
                    border: '1px solid #4f8eff20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User size={20} color="#4f8eff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                      {resume.candidate_name || 'Unknown Candidate'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={11} />
                      {resume.candidate_email || 'No email'}
                      {resume.candidate_phone && <><span>•</span><Phone size={11} />{resume.candidate_phone}</>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '20px',
                    background: '#4f8eff12', border: '1px solid #4f8eff20'
                  }}>
                    <Award size={12} color="#4f8eff" />
                    <span style={{ fontSize: '12px', color: '#4f8eff', fontWeight: 700 }}>
                      {resume.skills_extracted?.total_skills_found || 0} skills
                    </span>
                  </div>
                  <ChevronRight size={16} color="var(--text-secondary)" />
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(resume.resume_id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ef444420'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Trash2 size={15} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="card" style={{ width: '320px', flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Candidate Details</h3>
              <button onClick={() => setSelected(null)} style={{ background: '#ffffff10', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', padding: '16px', background: '#ffffff05', borderRadius: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #4f8eff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={22} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>{selected.candidate_name || 'Unknown'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selected.candidate_email}</div>
              </div>
            </div>

            {selected.candidate_phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <Phone size={14} /> {selected.candidate_phone}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <FileText size={14} /> {selected.file_name}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>
                EXTRACTED SKILLS ({selected.skills_extracted?.total_skills_found || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selected.skills_extracted?.skills?.slice(0, 20).map((s, i) => {
                  const color = categoryColors[s.category] || '#94a3b8'
                  return (
                    <span key={i} style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: `${color}15`, color, border: `1px solid ${color}25`
                    }}>{s.skill}</span>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}