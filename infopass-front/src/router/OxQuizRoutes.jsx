import React from 'react'
import { Route } from 'react-router-dom'
import { OX_SingleGame , OX_main, OX_MultiGame} from '../games/oxquiz/OX_index'

const OxQuizRoutes = [
    <Route key="oxquiz-multi" path='/oxquiz/OX_MultiGame' element={<OX_MultiGame />} />,
    <Route key="oxquiz-single" path='/oxquiz/OX_SingleGame' element={<OX_SingleGame />} />,
    <Route key="oxquiz-main" path='/oxquiz/OX_main' element={<OX_main />} />,
]

export default OxQuizRoutes
