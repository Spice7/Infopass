import React, { useEffect, useMemo, useState } from 'react'
import '../Admin.css'
import { AlertDialog, ConfirmDialog, ErrorDialog, SuccessDialog } from '../../components/CommonDialogs'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'

const OXQuestionManagement = () => {
    const [q, setQ] = useState('')
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(20)
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const totalPages = useMemo(() => Math.ceil(total / size) || 1, [total, size])

    const [edit, setEdit] = useState(null)
    const [bulk, setBulk] = useState([{ question: '', answer: 1, category: '', quiz_explanition: '' }])
    
    // 다이얼로그 상태 관리
    const [dialogs, setDialogs] = useState({
        alert: { open: false, title: '', message: '' },
        confirm: { open: false, title: '', message: '', onConfirm: null },
        error: { open: false, message: '' },
        success: { open: false, message: '' }
    })

    // 다이얼로그 헬퍼 함수들
    const showAlert = (title, message) => {
        setDialogs(prev => ({
            ...prev,
            alert: { open: true, title, message }
        }))
    }

    const showConfirm = (title, message, onConfirm) => {
        setDialogs(prev => ({
            ...prev,
            confirm: { open: true, title, message, onConfirm }
        }))
    }

    const showError = (message) => {
        setDialogs(prev => ({
            ...prev,
            error: { open: true, message }
        }))
    }

    const showSuccess = (message) => {
        setDialogs(prev => ({
            ...prev,
            success: { open: true, message }
        }))
    }

    const closeDialog = (type) => {
        setDialogs(prev => ({
            ...prev,
            [type]: { open: false, title: '', message: '', onConfirm: null }
        }))
    }

    const fetchList = async () => {
        setLoading(true)
        setError('')
        try {
            const params = new URLSearchParams()
            if (q && q.trim()) params.append('q', q.trim())
            params.append('page', page.toString())
            params.append('size', size.toString())
            
            const res = await fetch(`${API_BASE}/admin/ox-questions?${params.toString()}`)
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

    const resetEdit = () => setEdit({ id: null, question: '', answer: 1, category: '', quiz_explanition: '' })

    const saveEdit = async () => {
        try {
            if (!edit.category || !edit.question || edit.answer === null || edit.answer === undefined || !edit.quiz_explanition) {
                showAlert('입력 오류', '카테고리 / 질문 / 정답 / 해설은 필수입니다.')
                return
            }
            const method = edit.id ? 'PUT' : 'POST'
            const url = edit.id ? `${API_BASE}/admin/ox-questions/${edit.id}` : `${API_BASE}/admin/ox-questions`
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(edit) })
            if (!res.ok) throw new Error('save failed')
            setEdit(null)
            fetchList()
            showSuccess(edit.id ? '문제가 수정되었습니다.' : '문제가 등록되었습니다.')
        } catch (e) { showError(`저장 중 오류가 발생했습니다: ${e.message}`) }
    }

    const remove = async (row) => {
        showConfirm(
            '문제 삭제',
            `#${row.id} 문제를 정말 삭제하시겠습니까?`,
            () => performDelete(row)
        )
    }

    const performDelete = async (row) => {
        closeDialog('confirm')
        try {
            console.log('삭제 요청 URL:', `${API_BASE}/admin/ox-questions/${row.id}`)
            const res = await fetch(`${API_BASE}/admin/ox-questions/${row.id}`, { method: 'DELETE' })
            console.log('삭제 응답 상태:', res.status, res.statusText)
            
            if (!res.ok) {
                const errorText = await res.text()
                console.error('삭제 실패 응답 내용:', errorText)
                throw new Error(`삭제 실패: ${res.status} ${res.statusText}`)
            }
            
            console.log('삭제 성공')
            fetchList()
            showSuccess('문제가 삭제되었습니다.')
        } catch (e) { 
            console.error('삭제 오류:', e)
            showError(`삭제 중 오류가 발생했습니다: ${e.message}`)
        }
    }

    const addBulkRow = () => setBulk(b => [...b, { question: '', answer: 1, category: b[0]?.category || '', quiz_explanition: '' }])
    const removeBulkRow = (idx) => setBulk(b => b.filter((_, i) => i !== idx))
    const updateBulkRow = (idx, key, val) => setBulk(b => b.map((r, i) => i === idx ? { ...r, [key]: val } : r))

    const submitBulk = async () => {
        if (!bulk || bulk.length === 0) {
            showAlert('입력 오류', '등록할 문제가 없습니다.')
            return
        }
        const cat = bulk[0]?.category || ''
        if (!cat) { 
            showAlert('입력 오류', '카테고리는 필수입니다.')
            return 
        }
        if (bulk.some(r => !r.question || r.answer === null || r.answer === undefined || !r.category || !r.quiz_explanition)) { 
            showAlert('입력 오류', '질문/정답/카테고리/해설은 필수입니다.')
            return 
        }
        if (bulk.some(r => r.category !== cat)) { 
            showAlert('입력 오류', '모든 행의 카테고리가 동일해야 합니다.')
            return 
        }
        try {
            const res = await fetch(`${API_BASE}/admin/ox-questions/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bulk) })
            if (!res.ok) throw new Error('bulk failed')
            setBulk([{ question: '', answer: 1, category: cat, quiz_explanition: '' }])
            fetchList()
            showSuccess('문제들이 일괄 등록되었습니다.')
        } catch (e) { showError(`일괄 등록 중 오류가 발생했습니다: ${e.message}`) }
    }

    const getAnswerLabel = (answer) => {
        return answer === 1 ? 'O' : answer === 0 ? 'X' : '?'
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h2 className="admin-page-title">OX 퀴즈 관리</h2>
                <p className="admin-page-description">OX 퀴즈 문제 추가/수정/삭제</p>
            </div>

            <div className="admin-controls">
                <div className="admin-search-box">
                    <input className="admin-search-input" placeholder="질문/해설 검색" value={q} onChange={e=>{setPage(0);setQ(e.target.value)}} />
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
                            <col style={{ width: 80 }} />
                            <col style={{ width: 220 }} />
                            <col style={{ width: 240 }} />
                            <col style={{ width: 160 }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>ID</th>
                                <th>질문</th>
                                <th style={{ textAlign: 'center' }}>답</th>
                                <th>카테고리</th>
                                <th>생성일</th>
                                <th style={{ textAlign: 'center' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(row => (
                                <tr key={row.id} className="admin-table-row">
                                    <td style={{ textAlign: 'center' }}>{row.id}</td>
                                    <td className="user-email" title={row.question}>{row.question}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: row.answer === 1 ? '#22c55e' : '#ef4444' }}>
                                        {getAnswerLabel(row.answer)}
                                    </td>
                                    <td>{row.category}</td>
                                    <td>{(row.created_at || '').slice(0,10)}</td>
                                    <td style={{ textAlign: 'center' }}>
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
                            <div className="admin-form-row">
                                <label>카테고리</label>
                                <input className="admin-input" value={edit.category||''} onChange={e=>setEdit(v=>({...v, category:e.target.value}))} />
                            </div>
                            <div className="admin-form-row">
                                <label>질문</label>
                                <input className="admin-input" value={edit.question||''} onChange={e=>setEdit(v=>({...v, question:e.target.value}))} />
                            </div>
                            <div className="admin-form-row">
                                <label>정답</label>
                                <select className="admin-input" value={edit.answer||1} onChange={e=>setEdit(v=>({...v, answer:parseInt(e.target.value)}))}>
                                    <option value={1}>O (참)</option>
                                    <option value={0}>X (거짓)</option>
                                </select>
                            </div>
                            <div className="admin-form-row">
                                <label>해설</label>
                                <textarea className="admin-input" rows={5} value={edit.quiz_explanition||''} onChange={e=>setEdit(v=>({...v, quiz_explanition:e.target.value}))} />
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
                <div className="admin-page-header"><h3 className="admin-page-title">일괄 등록</h3></div>
                <div style={{overflowX:'auto'}}>
                    <table className="admin-table">
                        <thead>
                            <tr><th>#</th><th>카테고리</th><th>질문</th><th>정답</th><th>해설</th><th></th></tr>
                        </thead>
                        <tbody>
                            {bulk.map((row, idx) => (
                                <tr key={idx}>
                                    <td>{idx+1}</td>
                                    <td><input className="admin-input" value={row.category||''} onChange={e=>updateBulkRow(idx,'category',e.target.value)} /></td>
                                    <td><input className="admin-input" value={row.question||''} onChange={e=>updateBulkRow(idx,'question',e.target.value)} /></td>
                                    <td>
                                        <select className="admin-input" value={row.answer||1} onChange={e=>updateBulkRow(idx,'answer',parseInt(e.target.value))}>
                                            <option value={1}>O (참)</option>
                                            <option value={0}>X (거짓)</option>
                                        </select>
                                    </td>
                                    <td><input className="admin-input" value={row.quiz_explanition||''} onChange={e=>updateBulkRow(idx,'quiz_explanition',e.target.value)} /></td>
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

            {/* 다이얼로그들 */}
            <AlertDialog
                open={dialogs.alert.open}
                title={dialogs.alert.title}
                message={dialogs.alert.message}
                onConfirm={() => closeDialog('alert')}
                isAdmin={true}
            />

            <ConfirmDialog
                open={dialogs.confirm.open}
                title={dialogs.confirm.title}
                message={dialogs.confirm.message}
                onConfirm={() => {
                    if (dialogs.confirm.onConfirm) {
                        dialogs.confirm.onConfirm()
                    }
                    closeDialog('confirm')
                }}
                onCancel={() => closeDialog('confirm')}
                confirmText="삭제"
                cancelText="취소"
                isAdmin={true}
            />

            <ErrorDialog
                open={dialogs.error.open}
                message={dialogs.error.message}
                onConfirm={() => closeDialog('error')}
                isAdmin={true}
            />

            <SuccessDialog
                open={dialogs.success.open}
                message={dialogs.success.message}
                onConfirm={() => closeDialog('success')}
                isAdmin={true}
            />
        </div>
    )
}

export default OXQuestionManagement
