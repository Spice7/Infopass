import React, { useState } from 'react'
import AnalyticsDashboard from './AnalyticsDashboard'

const AdminMain = () => {
	const [activeTab, setActiveTab] = useState('db')

	return (
		<div className="content-area">
			<h2 className="section-title">관리자 대시보드</h2>
			{activeTab === 'db' && (
				<AnalyticsDashboard />
			)}
		</div>
	)
}

export default AdminMain
