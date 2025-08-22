import React from 'react'
import { Route } from 'react-router-dom'
import AdminMain from '../admin/AdminMain'

const AdminRoutes = [
    <Route key="admin" path='/admin/*' element={<AdminMain />} />
]

export default AdminRoutes