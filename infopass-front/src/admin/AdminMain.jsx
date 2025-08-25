import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Analytics from './pages/Analytics'
import UserManagement from './pages/UserManagement'

const AdminMain = () => {
	return (
		<AdminLayout>
			<Routes>
				<Route path="/" element={<Analytics />} />
				<Route path="/users" element={<UserManagement />} />
				<Route path="/inquiries" element={
					<div className="admin-page">
						<div className="admin-page-header">
							<h2 className="admin-page-title">문의사항 관리</h2>
							<p className="admin-page-description">
								고객 문의사항을 확인하고 답변할 수 있습니다.
							</p>
						</div>
						<div className="admin-panel">
							<div className="admin-coming-soon">
								<h3>🚧 준비 중입니다</h3>
								<p>백엔드 API가 준비되면 곧 서비스될 예정입니다.</p>
							</div>
						</div>
					</div>
				} />
			</Routes>
		</AdminLayout>
	)
}

export default AdminMain
