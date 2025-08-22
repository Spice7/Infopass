import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AdminSidebar = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const [activeMenu, setActiveMenu] = useState(location.pathname)

	const menuItems = [
		{
			id: 'analytics',
			path: '/admin',
			icon: '📊',
			label: '통계 대시보드',
			description: '사용자 활동 및 게임 통계'
		},
		{
			id: 'users',
			path: '/admin/users',
			icon: '👥',
			label: '사용자 관리',
			description: '회원 정보 조회 및 관리'
		},
		{
			id: 'inquiries',
			path: '/admin/inquiries',
			icon: '💬',
			label: '문의사항 관리',
			description: '고객 문의 및 답변 관리',
			disabled: true // 백엔드 준비 전까지 비활성화
		}
	]

	const handleMenuClick = (item) => {
		if (item.disabled) return
		
		setActiveMenu(item.path)
		navigate(item.path)
	}

	return (
		<div className="admin-sidebar">
			<div className="admin-sidebar-header">
				<div className="admin-logo">
					<span className="admin-logo-icon">⚡</span>
					<h2>InfoPass Admin</h2>
				</div>
				<div className="admin-subtitle">관리자 대시보드</div>
			</div>

			<nav className="admin-nav">
				<ul className="admin-nav-list">
					{menuItems.map((item) => (
						<li key={item.id} className="admin-nav-item">
							<button
								className={`admin-nav-button ${
									activeMenu === item.path ? 'active' : ''
								} ${item.disabled ? 'disabled' : ''}`}
								onClick={() => handleMenuClick(item)}
								disabled={item.disabled}
							>
								<div className="admin-nav-icon">{item.icon}</div>
								<div className="admin-nav-content">
									<span className="admin-nav-label">{item.label}</span>
									<span className="admin-nav-description">{item.description}</span>
								</div>
								{item.disabled && (
									<span className="admin-nav-badge">준비중</span>
								)}
							</button>
						</li>
					))}
				</ul>
			</nav>

			<div className="admin-sidebar-footer">
				<div className="admin-version">
					<span>Version 1.0.0</span>
				</div>
			</div>
		</div>
	)
}

export default AdminSidebar
