import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Analytics from './pages/Analytics'
import UserManagement from './pages/UserManagement'
import InquiryManagement from './pages/InquiryManagement'
import CardQuestionManagement from './pages/CardQuestionManagement'

const AdminMain = () => {
	return (
		<AdminLayout>
			<Routes>
				<Route path="/" element={<Analytics />} />
				<Route path="/users" element={<UserManagement />} />
				<Route path="/inquiries" element={<InquiryManagement />} />
				<Route path="/card-questions" element={<CardQuestionManagement />} />
			</Routes>
		</AdminLayout>
	)
}

export default AdminMain
