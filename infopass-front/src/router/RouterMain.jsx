import React from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
import OxQuizRoutes from './OxQuizRoutes'
import Home from './Home'

const RouterMain = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                {AdminRoutes}
                {OxQuizRoutes}
                <Route path="*" element={<h1>잘못된 주소입니다</h1>} />
            </Routes>
        </div>
    )
}

export default RouterMain
