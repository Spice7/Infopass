import React from 'react'
import AnalyticsDashboard from '../AnalyticsDashboard'

const Analytics = () => {
	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<h2 className="admin-page-title">통계 대시보드</h2>
				<p className="admin-page-description">
					게임 플레이 통계와 사용자 활동 데이터를 확인할 수 있습니다.
				</p>
			</div>
			
			<AnalyticsDashboard />
		</div>
	)
}

export default Analytics
