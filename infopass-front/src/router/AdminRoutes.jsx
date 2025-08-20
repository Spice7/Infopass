import React from 'react'
import { Route } from 'react-router-dom'
import AdminMain from '../admin/AdminMain'

const AdminRoutes = [
    <Route key="admin-main" path='/admin' element={<AdminMain />} />,
    // <Route key="admin-user" path='/admin/user' element={<AdminUser/>}/>
    // ...
]

export default AdminRoutes