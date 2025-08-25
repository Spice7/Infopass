import React, { useContext } from 'react'
import { LoginContext } from '../../user/LoginContextProvider'

const AdminHeader = () => {
	const { userInfo } = useContext(LoginContext)
	
	const getCurrentTime = () => {
		return new Date().toLocaleString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'long',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<div className="admin-header">
			<div className="admin-header-left">
				<h1 className="admin-page-title">관리자 대시보드</h1>
				<div className="admin-breadcrumb">
					<span className="admin-current-time">{getCurrentTime()}</span>
				</div>
			</div>
			
			<div className="admin-header-right">
				<div className="admin-user-info">
					<div className="admin-user-avatar">
						{userInfo?.name?.charAt(0) || 'A'}
					</div>
					<div className="admin-user-details">
						<span className="admin-user-name">{userInfo?.name || 'Admin'}</span>
						<span className="admin-user-role">관리자</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminHeader
