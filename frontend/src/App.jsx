import { useRef, useState } from 'react'
import { UploadCloud, FileText, X, Sparkles, CheckCircle2, AlertCircle, Loader2, BriefcaseBusiness, Target, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function prettyKey(key) {
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function DetailValue({ value }) {
  if (value === null || value === undefined || value === '') return <span className="muted">Not specified</span>
  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>
  if (Array.isArray(value)) {
    if (!value.length) return <span className="muted">None listed</span>
    return <div className="chips">{value.map((item, i) => <span className="chip" key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>)}</div>
  }
  if (typeof value === 'object') {
    return <div className="nested">{Object.entries(value).map(([k, v]) => <div className="nested-row" key={k}><b>{prettyKey(k)}</b><DetailValue value={v} /></div>)}</div>
  }
  return <span>{String(value)}</span>
}

function App() {
  const [jd, setJd] = useState('')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  function selectFile(selected) {
    if (!selected) return
    const valid = /\.(pdf|docx)$/i.test(selected.name)
    if (!valid) {
      setError('Please upload a PDF or DOCX file.')
      return
    }
    setError('')
    setResult(null)
    setFile(selected)
  }

  async function analyze(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!jd.trim()) return setError('Please enter the job description.')
    if (!file) return setError('Please upload a candidate resume.')

    const body = new FormData()
    body.append('job_description', jd)
    body.append('resume_file', file)

    setLoading(true)
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/analyze`, {
        method: 'POST',
        body,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Unable to analyze this resume.')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Check whether the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setJd('')
    setFile(null)
    setResult(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const score = Number(result?.score ?? 0)
  const scoreClass = score >= 75 ? 'good' : score >= 50 ? 'average' : 'low'

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-icon"><Sparkles size={19}/></span><span>TalentLens</span></a>
        <span className="top-tag"><span className="live-dot"/> AI-powered candidate screening</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span/> SMARTER HIRING STARTS HERE</div>
        <h1>Find the right fit,<br/><span>with AI-powered screening.</span></h1>
        <p>Share the job description, upload a resume, and get a structured candidate match analysis in seconds.</p>
      </section>

      <form className="workspace" onSubmit={analyze}>
        <section className="panel">
          <div className="section-heading">
            <div className="step">01</div>
            <div><h2>Job description</h2><p>Paste the role details you are hiring for.</p></div>
          </div>
          <label className="field-label" htmlFor="jd">JOB DESCRIPTION <span>Required</span></label>
          <textarea id="jd" value={jd} onChange={e => { setJd(e.target.value); setResult(null) }} placeholder="Paste the complete job description here, including responsibilities, required skills, qualifications and experience..." rows={10}/>
          <div className="field-foot"><span>Include required and preferred qualifications for a more useful comparison.</span><span>{jd.length} characters</span></div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div className="step">02</div>
            <div><h2>Candidate resume</h2><p>Upload one resume to evaluate against this role.</p></div>
          </div>
          <input ref={inputRef} className="hidden-input" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => selectFile(e.target.files?.[0])}/>
          {!file ? (
            <div className={`dropzone ${dragging ? 'dragging' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={e => {e.preventDefault();setDragging(true)}} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault();setDragging(false);selectFile(e.dataTransfer.files?.[0])}} role="button" tabIndex="0" onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}>
              <div className="upload-icon"><UploadCloud size={25}/></div>
              <strong>Drop your resume here, or <span>browse files</span></strong>
              <small>PDF or DOCX · One file at a time</small>
            </div>
          ) : (
            <div className="file-card">
              <div className="file-icon"><FileText size={23}/></div>
              <div className="file-meta"><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} KB · Ready to analyze</small></div>
              <button type="button" className="icon-button" aria-label="Remove file" onClick={() => {setFile(null);setResult(null);if(inputRef.current)inputRef.current.value=''}}><X size={18}/></button>
            </div>
          )}
          <div className="privacy-note"><ShieldCheck size={16}/> Resume is processed for this request and is not saved by this application.</div>
        </section>

        {error && <div className="alert"><AlertCircle size={18}/><span>{error}</span></div>}

        <button className="analyze-button" type="submit" disabled={loading}>
          {loading ? <><Loader2 className="spin" size={19}/> Analyzing candidate...</> : <><Sparkles size={18}/> Analyze resume <ArrowRight size={18}/></>}
        </button>
        {loading && <p className="loading-hint">The AI is extracting resume details and comparing them with the job requirements. This may take a little while.</p>}
      </form>

      {result && (
        <section className="results">
          <div className="results-title"><div><div className="eyebrow"><span/> ANALYSIS COMPLETE</div><h2>Candidate evaluation</h2><p>AI-generated comparison based on the supplied job description and resume.</p></div><button className="secondary-button" onClick={reset}><RotateCcw size={16}/> New analysis</button></div>
          <div className="score-card">
            <div className="score-copy"><span className="result-label">OVERALL MATCH SCORE</span><h3>{result.candidate_name || 'Candidate'}</h3><p>Candidate match against the provided job description</p></div>
            <div className={`score-circle ${scoreClass}`}><strong>{Number.isFinite(score) ? score : 0}<small>%</small></strong><span>Match</span></div>
          </div>
          <div className="details-card">
            <div className="details-heading"><Target size={19}/><h3>Evaluation details</h3></div>
            {result.details && Object.keys(result.details).length ? (
              <div className="details-grid">{Object.entries(result.details).map(([key, value]) => <div className="detail-item" key={key}><h4>{prettyKey(key)}</h4><DetailValue value={value}/></div>)}</div>
            ) : <p className="muted">No additional details were returned.</p>}
          </div>
          <details className="raw-details"><summary>View extracted candidate and job information</summary><div className="raw-grid"><div><h4>Parsed job description</h4><pre>{JSON.stringify(result.job, null, 2)}</pre></div><div><h4>Parsed resume</h4><pre>{JSON.stringify(result.resume, null, 2)}</pre></div></div></details>
          <p className="disclaimer"><CheckCircle2 size={15}/> AI-generated screening assistance only. Recruiters should review the original resume and make independent, job-related decisions.</p>
        </section>
      )}

      <footer><span>TalentLens</span><span>AI Resume Parser & Matcher · Built with React, FastAPI and Groq</span></footer>
    </main>
  )
}

export default App
