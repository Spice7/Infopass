import React from 'react'
import { Route } from 'react-router-dom'
import BlockMain from '../games/block/BlockMain';
import RequireLogin from '@/user/RequireLogin';

const BlockRoutes = [
    <Route key="block-main" path='/block/main' element={<RequireLogin><BlockMain/></RequireLogin>}></Route>
];

export default BlockRoutes
