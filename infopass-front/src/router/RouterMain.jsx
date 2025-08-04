import React from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
import OxQuizRoutes from './OxQuizRoutes'

const RouterMain = () => {
    return (
        <div>
            <Routes>
                {AdminRoutes}
                {OxQuizRoutes}
                <Route path='*' element={<h1>잘못된 주소입니다</h1>} />
            </Routes>
        </div>
    )
}

export default RouterMain
