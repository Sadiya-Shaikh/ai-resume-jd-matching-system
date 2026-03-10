import { useState, useEffect } from 'react'
import api from '../api/axios'
import { Target, Zap, CheckCircle, XCircle, TrendingUp, Brain, BarChart3, Users, ChevronDown } from 'lucide-react'

const ScoreCircle = ({ score }) => {
  const color = score >= 75 ? '#10b981' : score >= 60 ? '#4f8eff' : score >= 50 ? '#f59e0b' : '#ef4444'
  const size = 130
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#ffffff08" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ marginTop: '-90px', marginBottom: '20px' }}>
        <div style={{ fontSize: '32px', fontFamily: 'Syne', fontWeight: 800, color, letterSpacing: '-1px' }}>{score}%</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Match Score</div>
      </div>
    </div>
  )
}

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <div style={{ background: '#ffffff05', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
      <Icon size={15} color={color} />
    </div>
    <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne', color, letterSpacing: '-0.5px' }}>{value}%</div>
    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.3 }}>{label}</div>
  </div>
)

export default function Matching() {
  const [resumes, setResumes] = useState([])
  const [jds, setJds] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [selectedJd, setSelectedJd] = useState('')
  const [result, setResult] = useState(null)
  const [bulkResults, setBulkResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('single')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesRes, jdsRes] = await Promise.all([
          api.get('/resumes/'),
          api.get('/jds/')
        ])
        setResumes(resumesRes.data.resumes || [])
        setJds(jdsRes.data || [])
      } catch (err) { console.error(err) }
    }
    fetchData()
  }, [])

  const handleSingleMatch = async () => {
    if (!selectedResume || !selectedJd) return alert('Select both resume and job description')
    setLoading(true); setResult(null)
    try {
      const res = await api.post(`/match/single?resume_id=${selectedResume}&jd_id=${selectedJd}`)
      setResult(res.data)
    } catch (err) {
      alert('Matching failed: ' + (err.response?.data?.detail || err.message))
    } finally { setLoading(false) }
  }

  const handleBulkMatch = async () => {
    if (!selectedJd) return alert('Select a job description')
    setLoading(true); setBulkResults(null)
    try {
      const res = await api.post(`/match/bulk?jd_id=${selectedJd}`)
      setBulkResults(res.data)
    } catch (err) {
      alert('Bulk matching failed: ' + (err.response?.data?.detail || err.message))
    } finally { setLoading(false) }
  }

  const verdictColor = (v) => {
    if (v === 'Highly Recommended') return '#10b981'
    if (v === 'Recommended') return '#4f8eff'
    if (v === 'Consider') return '#f59e0b'
    return '#ef4444'
  }

  const verdictIcon = (v) => {
    if (v === 'Highly Recommended') return <CheckCircle size={14} />
    if (v === 'Recommended') return <TrendingUp size={14} />
    if (v === 'Consider') return <BarChart3 size={14} />
    return <XCircle size={14} />
  }

  const selectStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    background: '#ffffff08', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', appearance: 'none'
  }

  return (
    <div className="fade-up">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>AI Matching</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Match resumes against job descriptions using TF-IDF + spaCy NLP
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#ffffff08', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {[
          { id: 'single', icon: Target, label: 'Single Match' },
          { id: 'bulk', icon: Zap, label: 'Bulk Match' }
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setMode(id); setResult(null); setBulkResults(null) }} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            background: mode === id ? 'white' : 'transparent',
            color: mode === id ? '#0a0a0f' : 'var(--text-secondary)',
            fontWeight: mode === id ? 700 : 500, fontSize: '14px',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
            boxShadow: mode === id ? '0 2px 8px #00000030' : 'none'
          }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Controls Panel */}
        <div className="card" style={{ width: '300px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: mode === 'single' ? '#4f8eff20' : '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mode === 'single' ? <Target size={16} color="#4f8eff" /> : <Zap size={16} color="#f59e0b" />}
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
              {mode === 'single' ? 'Single Resume Match' : 'Bulk Match All Resumes'}
            </h3>
          </div>

          {mode === 'single' && (
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '8px', display: 'block' }}>SELECT RESUME</label>
              <select style={selectStyle} value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                <option value="">Choose a resume...</option>
                {resumes.map(r => (
                  <option key={r.resume_id} value={r.resume_id} style={{ background: '#16161f' }}>
                    {r.candidate_name || 'Unknown'} — {r.file_name?.substring(0, 25)}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} color="var(--text-secondary)" style={{ position: 'absolute', right: '12px', top: '62%', pointerEvents: 'none' }} />
            </div>
          )}

          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '8px', display: 'block' }}>SELECT JOB DESCRIPTION</label>
            <select style={selectStyle} value={selectedJd} onChange={e => setSelectedJd(e.target.value)}>
              <option value="">Choose a job...</option>
              {jds.map(j => (
                <option key={j.jd_id} value={j.jd_id} style={{ background: '#16161f' }}>
                  {j.title} — {j.company_name || 'No company'}
                </option>
              ))}
            </select>
            <ChevronDown size={14} color="var(--text-secondary)" style={{ position: 'absolute', right: '12px', top: '62%', pointerEvents: 'none' }} />
          </div>

          <button
            onClick={mode === 'single' ? handleSingleMatch : handleBulkMatch}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
              background: loading ? '#333' : mode === 'single'
                ? 'linear-gradient(135deg, #4f8eff, #6366f1)'
                : 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 4px 20px #4f8eff30', transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <><div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analyzing...</>
            ) : mode === 'single' ? (
              <><Target size={16} /> Run AI Match</>
            ) : (
              <><Zap size={16} /> Match All {resumes.length} Resumes</>
            )}
          </button>

          {mode === 'bulk' && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f59e0b08', border: '1px solid #f59e0b20', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f59e0b' }}>
                <Users size={13} />
                <span>Will analyze all <strong>{resumes.length}</strong> resumes against selected JD</span>
              </div>
            </div>
          )}

          {/* Algorithm Info */}
          <div style={{ marginTop: '20px', padding: '14px', background: '#ffffff05', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '10px' }}>ALGORITHM</div>
            {[
              ['TF-IDF Similarity', '60%', '#4f8eff'],
              ['Skill Match', '30%', '#8b5cf6'],
              ['Keyword Density', '10%', '#10b981'],
            ].map(([label, pct, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '12px', color, fontWeight: 700 }}>{pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Single Result */}
        {result && mode === 'single' && (
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="card" style={{ border: `1px solid ${verdictColor(result.verdict)}30`, marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Match Result</h3>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  background: `${verdictColor(result.verdict)}15`, color: verdictColor(result.verdict),
                  border: `1px solid ${verdictColor(result.verdict)}30`
                }}>
                  {verdictIcon(result.verdict)}
                  {result.verdict}
                </div>
              </div>

              <ScoreCircle score={result.match_score} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <MetricCard icon={Brain} label="Text Similarity" value={result.cosine_similarity} color="#4f8eff" />
                <MetricCard icon={Target} label="Skill Match" value={result.skill_match_percentage} color="#8b5cf6" />
                <MetricCard icon={BarChart3} label="Keyword Density" value={result.keyword_density} color="#10b981" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: '#10b98108', border: '1px solid #10b98125', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#10b981', marginBottom: '10px' }}>
                    <CheckCircle size={13} /> Matched Skills ({result.matched_skills?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {result.matched_skills?.map((s, i) => (
                      <span key={i} style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#10b98118', color: '#10b981' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#ef444408', border: '1px solid #ef444425', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#ef4444', marginBottom: '10px' }}>
                    <XCircle size={13} /> Missing Skills ({result.missing_skills?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {result.missing_skills?.map((s, i) => (
                      <span key={i} style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#ef444418', color: '#ef4444' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: '#4f8eff08', border: '1px solid #4f8eff20', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#4f8eff', marginBottom: '6px' }}>
                  <Brain size={13} /> AI Recommendation
                </div>
                <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>{result.recommendations}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Results */}
        {bulkResults && mode === 'bulk' && (
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Bulk Results</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: '#10b98115', fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                  <Users size={12} /> {bulkResults.total_resumes} Analyzed
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>{bulkResults.jd_title} — ranked by match score</p>

              {bulkResults.results?.map((r, i) => (
                <div key={r.match_id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '14px',
                  borderRadius: '12px', marginBottom: '8px',
                  background: i === 0 ? '#10b98108' : i === 1 ? '#4f8eff05' : '#ffffff03',
                  border: `1px solid ${i === 0 ? '#10b98125' : i === 1 ? '#4f8eff20' : 'var(--border)'}`
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                    background: i === 0 ? '#10b98120' : i === 1 ? '#f59e0b20' : '#ffffff10',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 800, fontFamily: 'Syne',
                    color: i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : 'var(--text-secondary)'
                  }}>#{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{r.candidate_name || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {r.matched_skills?.slice(0, 4).join(' • ')}
                      {r.matched_skills?.length > 4 ? ` +${r.matched_skills.length - 4}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Syne', color: verdictColor(r.verdict), letterSpacing: '-0.5px' }}>{r.match_score}%</div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', color: verdictColor(r.verdict), fontWeight: 700,
                      padding: '2px 8px', borderRadius: '20px', background: `${verdictColor(r.verdict)}15`
                    }}>
                      {verdictIcon(r.verdict)} {r.verdict}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !bulkResults && !loading && (
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: '#4f8eff10', border: '1px solid #4f8eff20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Brain size={32} color="#4f8eff" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Ready to Match</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, maxWidth: '260px' }}>
                Select a resume and job description, then click Run AI Match to see results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}