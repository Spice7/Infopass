import React from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
<<<<<<< HEAD
import UserRoutes from './UserRoutes'
=======
import OxQuizRoutes from './OxQuizRoutes'
>>>>>>> be78e4b23dba9ebd0552f07c3e3e8ddfde1f4e77

const RouterMain = () => {
    return (
        <div>
            <Routes>
                {AdminRoutes}
<<<<<<< HEAD
                {UserRoutes}
                <Route path='*' element={<h1>잘못된 주소입니다</h1>}/>
=======
                {OxQuizRoutes}
                <Route path='*' element={<h1>잘못된 주소입니다</h1>} />
>>>>>>> be78e4b23dba9ebd0552f07c3e3e8ddfde1f4e77
            </Routes>
        </div>
    )
}

export default RouterMain
