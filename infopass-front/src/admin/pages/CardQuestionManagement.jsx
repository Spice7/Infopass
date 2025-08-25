import React, { useEffect, useMemo, useState } from 'react'
import '../Admin.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'

const CardQuestionManagement = () => {
    const [q, setQ] = useState('')
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(20)
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const totalPages = useMemo(() => Math.ceil(total / size) || 1, [total, size])

    const [edit, setEdit] = useState(null)
    const [bulk, setBulk] = useState([{ question: '', answer: '', subject: '', explanation_text: '' }])

    const fetchList = async () => {
        setLoading(true)
        setError('')
        try {
            const params = new URLSearchParams()
            if (q && q.trim()) params.append('q', q.trim())
            params.append('page', page.toString())
            params.append('size', size.toString())
            
            const res = await fetch(`${API_BASE}/admin/card-questions?${params.toString()}`)
            if (!res.ok) throw new Error('list failed')
            const data = await res.json()
            setItems(data.items || [])
            setTotal(data.total || 0)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { 
        fetchList() 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, page, size])

    const resetEdit = () => setEdit({ id: null, question: '', answer: '', subject: '', explanation_text: '' })

    const saveEdit = async () => {
        try {
            if (!edit.subject || !edit.question || !edit.answer || !edit.explanation_text) {
                alert('subject / 질문 / 정답 / 해설은 필수입니다.')
                return
            }
            const method = edit.id ? 'PUT' : 'POST'
            const url = edit.id ? `${API_BASE}/admin/card-questions/${edit.id}` : `${API_BASE}/admin/card-questions`
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(edit) })
            if (!res.ok) throw new Error('save failed')
            setEdit(null)
            fetchList()
        } catch (e) { setError(e.message) }
    }

    const remove = async (row) => {
        if (!confirm(`#${row.id} 삭제하시겠습니까?`)) return
        try {
            const res = await fetch(`${API_BASE}/admin/card-questions/${row.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('delete failed')
            fetchList()
        } catch (e) { setError(e.message) }
    }

    const addBulkRow = () => setBulk(b => [...b, { question: '', answer: '', subject: b[0]?.subject || '', explanation_text: '' }])
    const removeBulkRow = (idx) => setBulk(b => b.filter((_, i) => i !== idx))
    const updateBulkRow = (idx, key, val) => setBulk(b => b.map((r, i) => i === idx ? { ...r, [key]: val } : r))

    const submitBulk = async () => {
        if (!bulk || bulk.length < 8) {
            alert('최소 8쌍(=8행) 이상을 입력해야 합니다.')
            return
        }
        const subj = bulk[0]?.subject || ''
        if (!subj) { alert('subject는 필수입니다.'); return }
        if (bulk.some(r => !r.question || !r.answer || !r.subject || !r.explanation_text)) { alert('question/answer/subject/explanation_text는 필수입니다.'); return }
        if (bulk.some(r => r.subject !== subj)) { alert('모든 행의 subject가 동일해야 합니다.'); return }
        try {
            const res = await fetch(`${API_BASE}/admin/card-questions/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bulk) })
            if (!res.ok) throw new Error('bulk failed')
            setBulk([{ question: '', answer: '', subject: subj, explanation_text: '' }])
            fetchList()
        } catch (e) { setError(e.message) }
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h2 className="admin-page-title">카드 문제 관리</h2>
                <p className="admin-page-description">카드 게임 문제 추가/수정/삭제</p>
                <p className="admin-page-description">최소 8쌍 이상 필요</p>
            </div>

            <div className="admin-controls">
                <div className="admin-search-box">
                    <input className="admin-search-input" placeholder="질문/답 검색" value={q} onChange={e=>{setPage(0);setQ(e.target.value)}} />
                </div>
                <label className="admin-label">페이지 당 문제
                    <input className="admin-input" type="number" min={1} value={size} onChange={e=>setSize(Math.max(1, +e.target.value||20))} />
                </label>
                <button className="admin-btn" onClick={resetEdit}>신규 등록</button>
            </div>

            {error && <div className="admin-error">{error}</div>}
            {loading && <div className="admin-loading">로딩 중...</div>}

            <div className="admin-panel">
                <div className="admin-table-container">
                    <table className="admin-table" style={{ minWidth: 1280 }}>
                        <colgroup>
                            <col style={{ width: 72 }} />
                            <col style={{ width: 360 }} />
                            <col style={{ width: 220 }} />
                            <col style={{ width: 220 }} />
                            <col style={{ width: 240 }} />
                            <col style={{ width: 160 }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>질문</th>
                                <th>답</th>
                                <th>Subject</th>
                                <th>생성일</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(row => (
                                <tr key={row.id} className="admin-table-row">
                                    <td>{row.id}</td>
                                    <td className="user-email" title={row.question}>{row.question}</td>
                                    <td>{row.answer}</td>
                                    <td>{row.subject}</td>
                                    <td>{(row.created_at || '').slice(0,10)}</td>
                                    <td>
                                        <button className="admin-btn secondary" onClick={()=>setEdit(row)}>수정</button>
                                        <button className="admin-btn danger" onClick={()=>remove(row)}>삭제</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-pagination">
                    <button className="admin-pagination-btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>이전</button>
                    <div className="admin-pagination-info">{page+1} / {totalPages} 페이지 <span className="admin-pagination-total">(총 {total}건)</span></div>
                    <button className="admin-pagination-btn" disabled={page+1>=totalPages} onClick={()=>setPage(p=>p+1)}>다음</button>
                </div>
            </div>

            {/* 편집 모달 */}
            {edit !== null && (
                <div className="admin-modal-overlay" onClick={()=>setEdit(null)}>
                    <div className="admin-modal" onClick={e=>e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{edit.id ? `문제 수정 #${edit.id}` : '문제 등록'}</h3>
                            <button className="admin-modal-close" onClick={()=>setEdit(null)}>×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-row"><label>Subject</label><input className="admin-input" value={edit.subject||''} onChange={e=>setEdit(v=>({...v, subject:e.target.value}))} /></div>
                            <div className="admin-form-row"><label>질문</label><input className="admin-input" value={edit.question||''} onChange={e=>setEdit(v=>({...v, question:e.target.value}))} /></div>
                            <div className="admin-form-row"><label>정답</label><input className="admin-input" value={edit.answer||''} onChange={e=>setEdit(v=>({...v, answer:e.target.value}))} /></div>
                            <div className="admin-form-row"><label>해설</label><textarea className="admin-input" rows={5} value={edit.explanation_text||''} onChange={e=>setEdit(v=>({...v, explanation_text:e.target.value}))} />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={()=>setEdit(null)}>닫기</button>
                            <button className="admin-btn primary" onClick={saveEdit}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 일괄 등록 섹션 */}
            <div className="admin-panel" style={{marginTop:20}}>
                <div className="admin-page-header"><h3 className="admin-page-title">일괄 등록 (최소 8쌍 = 8행)</h3></div>
                <div style={{overflowX:'auto'}}>
                    <table className="admin-table">
                        <thead>
                            <tr><th>#</th><th>Subject</th><th>질문</th><th>정답</th><th>해설</th><th></th></tr>
                        </thead>
                        <tbody>
                            {bulk.map((row, idx) => (
                                <tr key={idx}>
                                    <td>{idx+1}</td>
                                    <td><input className="admin-input" value={row.subject||''} onChange={e=>updateBulkRow(idx,'subject',e.target.value)} /></td>
                                    <td><input className="admin-input" value={row.question||''} onChange={e=>updateBulkRow(idx,'question',e.target.value)} /></td>
                                    <td><input className="admin-input" value={row.answer||''} onChange={e=>updateBulkRow(idx,'answer',e.target.value)} /></td>
                                    <td><input className="admin-input" value={row.explanation_text||''} onChange={e=>updateBulkRow(idx,'explanation_text',e.target.value)} /></td>
                                    <td><button className="admin-btn danger" onClick={()=>removeBulkRow(idx)}>삭제</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{display:'flex', gap:8, marginTop:8}}>
                    <button className="admin-btn" onClick={addBulkRow}>행 추가</button>
                    <button className="admin-btn primary" onClick={submitBulk}>일괄 등록</button>
                </div>
            </div>
        </div>
    )
}

export default CardQuestionManagement


