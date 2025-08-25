import React, { useState, useEffect, useCallback } from 'react'
import '../Admin.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'

const UserManagement = () => {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [sortBy, setSortBy] = useState('created_at')
	const [sortOrder, setSortOrder] = useState('desc')
	const [selectedUser, setSelectedUser] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isAddMode, setIsAddMode] = useState(false)
	const [editingUser, setEditingUser] = useState(null)

	// 페이지네이션
	const [currentPage, setCurrentPage] = useState(1)
	const [usersPerPage] = useState(10)

	const fetchUsers = useCallback(async () => {
		setLoading(true)
		setError('')
		try {
			// 실제 백엔드 API 호출
			const response = await fetch(`${API_BASE}/admin/users`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			
			if (response.ok) {
				const users = await response.json()
				
				// 정렬 적용
				const sortedUsers = [...users].sort((a, b) => {
					let aVal = a[sortBy]
					let bVal = b[sortBy]
					
					if (sortBy === 'created_at' || sortBy === 'rank_updated_at') {
						aVal = new Date(aVal)
						bVal = new Date(bVal)
					}
					
					if (sortOrder === 'asc') {
						return aVal > bVal ? 1 : -1
					} else {
						return aVal < bVal ? 1 : -1
					}
				})
				
				setUsers(sortedUsers)
			} else {
				throw new Error('API 응답 오류')
			}
		} catch (error) {
			console.error('백엔드 API 연결 실패, 더미 데이터 사용:', error)
			
			// API 실패 시 더미 데이터 사용
			const dummyUsers = [
				{
					id: 1, name: '김철수', nickname: 'chulsoo123', email: 'chulsoo@example.com',
					phone: '010-1234-5678', address: '서울시 강남구', usertype: 'USER',
					exp: 1250, level: 5, rank_updated_at: '2024-12-20 15:30:00',
					created_at: '2024-01-15 10:30:00', enabled: 1
				},
				{
					id: 2, name: '정관리', nickname: 'admin_jung', email: 'admin@infopass.com',
					phone: '010-0000-0000', address: '서울시 종로구', usertype: 'ADMIN',
					exp: 99999, level: 99, rank_updated_at: '2024-12-22 12:00:00',
					created_at: '2024-01-01 00:00:00', enabled: 1
				}
			]
			
			// 정렬 적용
			const sortedUsers = [...dummyUsers].sort((a, b) => {
				let aVal = a[sortBy]
				let bVal = b[sortBy]
				
				if (sortBy === 'created_at' || sortBy === 'rank_updated_at') {
					aVal = new Date(aVal)
					bVal = new Date(bVal)
				}
				
				if (sortOrder === 'asc') {
					return aVal > bVal ? 1 : -1
				} else {
					return aVal < bVal ? 1 : -1
				}
			})
			
			setUsers(sortedUsers)
		} finally {
			setLoading(false)
		}
	}, [sortBy, sortOrder])

	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])

	// 검색 필터링
	const filteredUsers = users.filter(user =>
		user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
		(user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()))
	)

	// 페이지네이션
	const indexOfLastUser = currentPage * usersPerPage
	const indexOfFirstUser = indexOfLastUser - usersPerPage
	const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
	const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
		} else {
			setSortBy(field)
			setSortOrder('desc')
		}
	}

	const handleUserClick = (user) => {
		setSelectedUser(user)
		setIsModalOpen(true)
		setIsEditMode(false)
		setIsAddMode(false)
	}

	// 사용자 삭제 (비활성화)
	const handleDeleteUser = async (userId) => {
		const confirmDelete = window.confirm('정말로 이 사용자를 삭제하시겠습니까?\n(실제로는 계정이 비활성화됩니다)')
		
		if (!confirmDelete) return
		
		try {
			const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			
			if (response.ok) {
				const result = await response.json()
				alert(result.message)
				fetchUsers() // 목록 새로고침
				setIsModalOpen(false)
			} else {
				alert('사용자 삭제에 실패했습니다.')
			}
		} catch (error) {
			console.error('사용자 삭제 오류:', error)
			alert('사용자 삭제 중 오류가 발생했습니다.')
		}
	}

	// 사용자 수정
	const handleEditUser = (user) => {
		setEditingUser({ ...user })
		setIsEditMode(true)
		setIsAddMode(false)
		setSelectedUser(null)
	}

	// 사용자 추가
	const handleAddUser = () => {
		setEditingUser({
			name: '',
			nickname: '',
			email: '',
			phone: '',
			address: '',
			usertype: 'USER',
			password: '',
			enabled: 1
		})
		setIsAddMode(true)
		setIsEditMode(false)
		setSelectedUser(null)
		setIsModalOpen(true)
	}

	// 사용자 저장 (수정/추가)
	const handleSaveUser = async () => {
		try {
			const url = isAddMode 
				? `${API_BASE}/admin/users`
				: `${API_BASE}/admin/users/${editingUser.id}`
			
			const method = isAddMode ? 'POST' : 'PUT'
			
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(editingUser),
			})
			
			if (response.ok) {
				await response.json()
				alert(isAddMode ? '사용자가 추가되었습니다.' : '사용자 정보가 수정되었습니다.')
				fetchUsers() // 목록 새로고침
				setIsModalOpen(false)
				setIsEditMode(false)
				setIsAddMode(false)
				setEditingUser(null)
			} else {
				alert('사용자 저장에 실패했습니다.')
			}
		} catch (error) {
			console.error('사용자 저장 오류:', error)
			alert('사용자 저장 중 오류가 발생했습니다.')
		}
	}

	// 모달 닫기
	const handleCloseModal = () => {
		setIsModalOpen(false)
		setIsEditMode(false)
		setIsAddMode(false)
		setSelectedUser(null)
		setEditingUser(null)
	}

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString('ko-KR')
	}

	const getUserTypeLabel = (usertype) => {
		return usertype === 'ADMIN' ? '관리자' : '일반사용자'
	}

	const getUserTypeClass = (usertype) => {
		return usertype === 'ADMIN' ? 'admin-badge admin' : 'admin-badge user'
	}

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div>
						<h2 className="admin-page-title">사용자 관리</h2>
						<p className="admin-page-description">
							등록된 사용자들의 정보를 조회하고 관리할 수 있습니다.
						</p>
					</div>
					<button 
						className="admin-btn primary"
						onClick={handleAddUser}
						style={{ marginLeft: '16px' }}
					>
						+ 사용자 추가
					</button>
				</div>
			</div>

			{/* 검색 및 필터 */}
			<div className="admin-controls">
				<div className="admin-search-box">
					<input
						type="text"
						placeholder="이름, 닉네임, 이메일, 전화번호, 주소로 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="admin-search-input"
					/>
				</div>
				<div className="admin-sort-controls">
					<label className="admin-label">정렬:
						<select 
							value={`${sortBy}-${sortOrder}`}
							onChange={(e) => {
								const [field, order] = e.target.value.split('-')
								setSortBy(field)
								setSortOrder(order)
							}}
							className="admin-select"
						>
							<option value="created_at-desc">가입일 (최신순)</option>
							<option value="created_at-asc">가입일 (오래된순)</option>
							<option value="name-asc">이름 (가나다순)</option>
							<option value="level-desc">레벨 (높은순)</option>
							<option value="level-asc">레벨 (낮은순)</option>
							<option value="exp-desc">경험치 (높은순)</option>
							<option value="exp-asc">경험치 (낮은순)</option>
							<option value="rank_updated_at-desc">랭킹 업데이트 (최신순)</option>
							<option value="usertype-desc">권한별 (관리자 우선)</option>
						</select>
					</label>
				</div>
			</div>

			{error && <div className="admin-error">{error}</div>}

			{loading ? (
				<div className="admin-loading">사용자 데이터를 불러오는 중...</div>
			) : (
				<>
					{/* 사용자 테이블 */}
					<div className="admin-panel">
						<div className="admin-table-container">
							<table className="admin-table">
								<thead>
									<tr>
										<th onClick={() => handleSort('id')} className="sortable">
											ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
										</th>
										<th onClick={() => handleSort('name')} className="sortable">
											이름 {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
										</th>
										<th>닉네임</th>
										<th>이메일</th>
										<th>전화번호</th>
										<th onClick={() => handleSort('usertype')} className="sortable">
											권한 {sortBy === 'usertype' && (sortOrder === 'asc' ? '↑' : '↓')}
										</th>
										<th onClick={() => handleSort('level')} className="sortable">
											레벨 {sortBy === 'level' && (sortOrder === 'asc' ? '↑' : '↓')}
										</th>
										<th onClick={() => handleSort('created_at')} className="sortable">
											가입일 {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
										</th>
										<th>상태</th>
									</tr>
								</thead>
								<tbody>
									{currentUsers.map((user) => (
										<tr 
											key={user.id} 
											onClick={() => handleUserClick(user)}
											className="admin-table-row clickable"
										>
											<td>{user.id}</td>
											<td className="user-name">{user.name}</td>
											<td>{user.nickname}</td>
											<td className="user-email">{user.email}</td>
											<td>{user.phone}</td>
											<td>
												<span className={getUserTypeClass(user.usertype)}>
													{getUserTypeLabel(user.usertype)}
												</span>
											</td>
											<td>
												<div className="level-info">
													<span className="level">Lv.{user.level}</span>
													<span className="exp">({user.exp} EXP)</span>
												</div>
											</td>
											<td>{formatDate(user.created_at)}</td>
											<td>
												<span className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
													{user.enabled ? '활성' : '비활성'}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* 페이지네이션 */}
						{totalPages > 1 && (
							<div className="admin-pagination">
								<button
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
									className="admin-pagination-btn"
								>
									이전
								</button>
								
								<div className="admin-pagination-info">
									{currentPage} / {totalPages} 페이지
									<span className="admin-pagination-total">
										(총 {filteredUsers.length}명)
									</span>
								</div>
								
								<button
									onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
									className="admin-pagination-btn"
								>
									다음
								</button>
							</div>
						)}
					</div>
				</>
			)}

			{/* 사용자 상세 정보/편집/추가 모달 */}
			{isModalOpen && (selectedUser || isEditMode || isAddMode) && (
				<div className="admin-modal-overlay" onClick={handleCloseModal}>
					<div className="admin-modal" onClick={(e) => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>
								{isAddMode ? '새 사용자 추가' : 
								 isEditMode ? '사용자 정보 수정' : 
								 '사용자 상세 정보'}
							</h3>
							<button 
								className="admin-modal-close"
								onClick={handleCloseModal}
							>
								×
							</button>
						</div>
						<div className="admin-modal-body">
							{(isEditMode || isAddMode) ? (
								<div className="admin-user-form">
									{isAddMode && (
										<div className="admin-form-row">
											<label>비밀번호:</label>
											<input
												type="password"
												value={editingUser.password}
												onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
												className="admin-input"
												placeholder="비밀번호를 입력하세요"
												required
											/>
										</div>
									)}
									<div className="admin-form-row">
										<label>이름:</label>
										<input
											type="text"
											value={editingUser.name}
											onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
											className="admin-input"
											placeholder="이름을 입력하세요"
											required
										/>
									</div>
									<div className="admin-form-row">
										<label>닉네임:</label>
										<input
											type="text"
											value={editingUser.nickname}
											onChange={(e) => setEditingUser({...editingUser, nickname: e.target.value})}
											className="admin-input"
											placeholder="닉네임을 입력하세요"
											required
										/>
									</div>
									<div className="admin-form-row">
										<label>이메일:</label>
										<input
											type="email"
											value={editingUser.email}
											onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
											className="admin-input"
											placeholder="이메일을 입력하세요"
											required
										/>
									</div>
									<div className="admin-form-row">
										<label>전화번호:</label>
										<input
											type="tel"
											value={editingUser.phone}
											onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
											className="admin-input"
											placeholder="전화번호를 입력하세요"
										/>
									</div>
									<div className="admin-form-row">
										<label>주소:</label>
										<input
											type="text"
											value={editingUser.address}
											onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
											className="admin-input"
											placeholder="주소를 입력하세요"
										/>
									</div>
									<div className="admin-form-row">
										<label>권한:</label>
										<select
											value={editingUser.usertype}
											onChange={(e) => setEditingUser({...editingUser, usertype: e.target.value})}
											className="admin-select"
										>
											<option value="USER">일반사용자</option>
											<option value="ADMIN">관리자</option>
										</select>
									</div>
									<div className="admin-form-row">
										<label>계정 상태:</label>
										<select
											value={editingUser.enabled}
											onChange={(e) => setEditingUser({...editingUser, enabled: parseInt(e.target.value)})}
											className="admin-select"
										>
											<option value={1}>활성</option>
											<option value={0}>비활성</option>
										</select>
									</div>
								</div>
							) : (
								<div className="admin-user-detail">
									<div className="admin-detail-row">
										<label>ID:</label>
										<span>{selectedUser.id}</span>
									</div>
									<div className="admin-detail-row">
										<label>이름:</label>
										<span>{selectedUser.name}</span>
									</div>
									<div className="admin-detail-row">
										<label>닉네임:</label>
										<span>{selectedUser.nickname}</span>
									</div>
									<div className="admin-detail-row">
										<label>이메일:</label>
										<span>{selectedUser.email}</span>
									</div>
									<div className="admin-detail-row">
										<label>전화번호:</label>
										<span>{selectedUser.phone}</span>
									</div>
									<div className="admin-detail-row">
										<label>주소:</label>
										<span>{selectedUser.address || '정보없음'}</span>
									</div>
									<div className="admin-detail-row">
										<label>권한:</label>
										<span className={getUserTypeClass(selectedUser.usertype)}>
											{getUserTypeLabel(selectedUser.usertype)}
										</span>
									</div>
									<div className="admin-detail-row">
										<label>레벨:</label>
										<span>Lv.{selectedUser.level}</span>
									</div>
									<div className="admin-detail-row">
										<label>경험치:</label>
										<span>{selectedUser.exp} EXP</span>
									</div>
									<div className="admin-detail-row">
										<label>가입일:</label>
										<span>{formatDate(selectedUser.created_at)}</span>
									</div>
									<div className="admin-detail-row">
										<label>랭킹 업데이트:</label>
										<span>{formatDate(selectedUser.rank_updated_at)}</span>
									</div>
									<div className="admin-detail-row">
										<label>계정 상태:</label>
										<span className={`status-badge ${selectedUser.enabled ? 'active' : 'inactive'}`}>
											{selectedUser.enabled ? '활성' : '비활성'}
										</span>
									</div>
								</div>
							)}
						</div>
						<div className="admin-modal-footer">
							{(isEditMode || isAddMode) ? (
								<>
									<button 
										className="admin-btn secondary"
										onClick={handleCloseModal}
									>
										취소
									</button>
									<button 
										className="admin-btn primary"
										onClick={handleSaveUser}
									>
										{isAddMode ? '추가' : '저장'}
									</button>
								</>
							) : (
								<>
									<button 
										className="admin-btn secondary"
										onClick={handleCloseModal}
									>
										닫기
									</button>
									<button 
										className="admin-btn primary"
										onClick={() => handleEditUser(selectedUser)}
									>
										수정
									</button>
									<button 
										className="admin-btn"
										onClick={() => handleDeleteUser(selectedUser.id)}
										style={{ 
											backgroundColor: 'var(--admin-error)', 
											color: 'white',
											marginLeft: '8px'
										}}
									>
										삭제
									</button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default UserManagement
