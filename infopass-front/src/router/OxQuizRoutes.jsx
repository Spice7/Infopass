import React from 'react'
import { Route } from 'react-router-dom'
import { OX_SingleGame , OX_main, OX_MultiGame, OX_Lobby} from '../games/oxquiz/OX_index'
import RequireLogin from '@/user/RequireLogin'

const OxQuizRoutes = [
    <Route key="oxquiz-multi" path='/oxquiz/OX_MultiGame' element={<RequireLogin><OX_MultiGame /></RequireLogin>} />,
    <Route key="oxquiz-single" path='/oxquiz/OX_SingleGame' element={<RequireLogin><OX_SingleGame /></RequireLogin>} />,
    <Route key="oxquiz-main" path='/oxquiz/OX_main' element={<RequireLogin><OX_main /></RequireLogin>} />,
    <Route key="oxquiz-lobby" path='/oxquiz/OX_Lobby' element={<RequireLogin><OX_Lobby /></RequireLogin>} />,
]

export default OxQuizRoutes
