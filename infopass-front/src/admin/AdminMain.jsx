import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Analytics from './pages/Analytics'
import UserManagement from './pages/UserManagement'
import InquiryManagement from './pages/InquiryManagement'

const AdminMain = () => {
	return (
		<AdminLayout>
			<Routes>
				<Route path="/" element={<Analytics />} />
				<Route path="/users" element={<UserManagement />} />
				<Route path="/inquiries" element={<InquiryManagement />} />
			</Routes>
		</AdminLayout>
	)
}

export default AdminMain
