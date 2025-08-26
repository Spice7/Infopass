import React, { useEffect, useMemo, useState } from 'react'
import '../Admin.css'
import { AlertDialog, ConfirmDialog, ErrorDialog, SuccessDialog } from '../../components/CommonDialogs'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'

const categoryLabel = (code) => ({
    quiz: '퀴즈 오류',
    account: '계정 문제',
    other: '기타'
}[code] || code)

const InquiryManagement = () => {
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)
    const [q, setQ] = useState('')
    const [category, setCategory] = useState('')
    const [userName, setUserName] = useState('')
    const [sort, setSort] = useState('i.created_at')
    const [order, setOrder] = useState('DESC')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
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

    const [selected, setSelected] = useState(null)
    const [reply, setReply] = useState('')
    const [statusDraft, setStatusDraft] = useState('')

    const totalPages = useMemo(() => Math.ceil(total / size) || 1, [total, size])

    const fetchList = async () => {
        setLoading(true)
        setError('')
        try {
            const params = new URLSearchParams({ q, category, userName, sort, order, page, size })
            const res = await fetch(`${API_BASE}/admin/inquiries?${params.toString()}`)
            if (!res.ok) throw new Error('list failed')
            const data = await res.json()
            setItems(data.items || [])
            setTotal(data.total || 0)
        } catch (e) {
            setError('목록을 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const fetchDetail = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/admin/inquiries/${id}`)
            if (!res.ok) throw new Error('detail failed')
            const data = await res.json()
            setSelected(data)
            setReply(data.response_content || '')
            setStatusDraft(data.status || '접수')
        } catch (e) {
            setError('상세를 불러오지 못했습니다.')
        }
    }

    useEffect(() => { fetchList() }, [q, category, userName, sort, order, page, size])

    const handleOpen = (row) => {
        fetchDetail(row.id)
    }

    const saveReply = async () => {
        if (!selected) return
        try {
            const res = await fetch(`${API_BASE}/admin/inquiries/${selected.id}/reply`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response_content: reply })
            })
            if (!res.ok) throw new Error()
            await fetchDetail(selected.id)
            fetchList()
            showSuccess('답변이 저장되었습니다.')
        } catch {
            showError('답변 저장에 실패했습니다.')
        }
    }

    const saveStatus = async () => {
        if (!selected) return
        try {
            const res = await fetch(`${API_BASE}/admin/inquiries/${selected.id}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: statusDraft })
            })
            if (!res.ok) throw new Error()
            await fetchDetail(selected.id)
            fetchList()
            showSuccess('상태가 변경되었습니다.')
        } catch {
            showError('상태 변경에 실패했습니다.')
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h2 className="admin-page-title">문의사항 관리</h2>
                <p className="admin-page-description">사용자 문의를 조회하고 답변을 등록/수정합니다.</p>
            </div>

            <div className="admin-controls">
                <div className="admin-search-box">
                    <input className="admin-search-input" placeholder="제목/내용 검색" value={q} onChange={e=>{setPage(0);setQ(e.target.value)}} />
                </div>
                <label className="admin-label">카테고리
                    <select className="admin-select" value={category} onChange={e=>{setPage(0);setCategory(e.target.value)}}>
                        <option value="">전체</option>
                        <option value="quiz">퀴즈 오류</option>
                        <option value="account">계정 문제</option>
                        <option value="other">기타</option>
                    </select>
                </label>
                <label className="admin-label">문의자 이름
                    <input className="admin-input" placeholder="이름" value={userName} onChange={e=>{setPage(0);setUserName(e.target.value)}} />
                </label>
                <label className="admin-label">정렬
                    <select className="admin-select" value={`${sort}-${order}`} onChange={e=>{const [s,o]=e.target.value.split('-');setSort(s);setOrder(o)}}>
                        <option value="i.created_at-DESC">최신순</option>
                        <option value="i.created_at-ASC">오래된순</option>
                        <option value="i.category-ASC">카테고리</option>
                    </select>
                </label>
            </div>

            {error && <div className="admin-error">{error}</div>}
            {loading && <div className="admin-loading">로딩 중...</div>}

            <div className="admin-panel">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>제목</th>
                                <th>카테고리</th>
                                <th>문의자</th>
                                <th>상태</th>
                                <th>접수일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(row => (
                                <tr key={row.id} className="admin-table-row clickable" onClick={()=>handleOpen(row)}>
                                    <td>{row.id}</td>
                                    <td className="user-email" title={row.title}>{row.title}</td>
                                    <td>{categoryLabel(row.category)}</td>
                                    <td>{row.user_name || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${row.status==='답변 완료'?'active':'inactive'}`}>{row.status}</span>
                                    </td>
                                    <td>{row.created_at}</td>
                                </tr>
                            ))}
                            {items.length===0 && !loading && (
                                <tr><td colSpan={6} style={{textAlign:'center',opacity:.7,padding:'20px'}}>결과가 없습니다.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="admin-pagination">
                    <button className="admin-pagination-btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>이전</button>
                    <div className="admin-pagination-info">{page+1} / {totalPages} 페이지 <span className="admin-pagination-total">(총 {total}건)</span></div>
                    <button className="admin-pagination-btn" disabled={page+1>=totalPages} onClick={()=>setPage(p=>p+1)}>다음</button>
                </div>
            </div>

            {selected && (
                <div className="admin-modal-overlay" onClick={()=>setSelected(null)}>
                    <div className="admin-modal" onClick={e=>e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>문의 상세 #{selected.id}</h3>
                            <button className="admin-modal-close" onClick={()=>setSelected(null)}>×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-user-detail">
                                <div className="admin-detail-row"><label>제목</label><span>{selected.title}</span></div>
                                <div className="admin-detail-row"><label>카테고리</label><span>{categoryLabel(selected.category)}</span></div>
                                <div className="admin-detail-row"><label>문의자</label><span>{selected.user_name} ({selected.user_email})</span></div>
                                <div className="admin-detail-row"><label>내용</label><span style={{whiteSpace:'pre-wrap', textAlign:'left'}}>{selected.content}</span></div>
                                <div className="admin-detail-row"><label>상태</label>
                                    <span>
                                        <select className="admin-select" value={statusDraft} onChange={e=>setStatusDraft(e.target.value)}>
                                            <option value="접수">접수</option>
                                            <option value="처리 중">처리 중</option>
                                            <option value="답변 완료">답변 완료</option>
                                        </select>
                                    </span>
                                </div>
                                <div className="admin-form-row">
                                    <label>답변 내용</label>
                                    <textarea className="admin-input" rows={6} value={reply} onChange={e=>setReply(e.target.value)} placeholder="답변 내용을 입력하세요" />
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={()=>setSelected(null)}>닫기</button>
                            <button className="admin-btn" style={{background:'var(--admin-border)', color:'#fff'}} onClick={saveStatus}>상태 저장</button>
                            <button className="admin-btn primary" onClick={saveReply}>답변 저장</button>
                        </div>
                    </div>
                </div>
            )}

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
                confirmText="확인"
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

export default InquiryManagement


