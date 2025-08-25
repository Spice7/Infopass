import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginContext } from '../../user/LoginContextProvider'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import '../Admin.css'

const AdminLayout = ({ children }) => {
	const { userInfo, roles } = useContext(LoginContext)
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		// 로그인 정보가 로드될 때까지 기다림
		if (userInfo !== null) {
			setLoading(false)
			
			// 관리자가 아닌 경우 (usertype이 'ADMIN'이 아닌 경우)
			if (userInfo.usertype !== 'ADMIN') {
				// 잘못된 주소로 리다이렉트하는 대신 현재 위치에서 접근 거부 표시
				return
			}
		}
	}, [userInfo, roles, navigate])

	if (loading) {
		return (
			<div className="admin-loading-container">
				<div className="admin-loading-spinner"></div>
				<p>관리자 페이지를 로딩 중입니다...</p>
			</div>
		)
	}

	// 관리자가 아닌 경우 접근 거부 메시지
	if (userInfo && userInfo.usertype !== 'ADMIN') {
		return (
			<div className="admin-access-denied">
				<h1>잘못된 주소입니다</h1>
				<p>요청하신 페이지를 찾을 수 없습니다.</p>
			</div>
		)
	}

	return (
		<div className="admin-layout">
			<AdminSidebar />
			<div className="admin-main">
				<AdminHeader />
				<div className="admin-content">
					{children}
				</div>
			</div>
		</div>
	)
}

export default AdminLayout
