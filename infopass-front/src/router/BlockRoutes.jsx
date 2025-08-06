import React from 'react'
import { Route } from 'react-router-dom'
import BlockMain from '../games/block/BlockMain';

const BlockRoutes = [
    <Route key="block-main" path='/block/main' element={<BlockMain/>}></Route>
];

export default BlockRoutes
