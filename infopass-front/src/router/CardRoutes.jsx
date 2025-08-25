import React from 'react';
import { Route } from 'react-router-dom';
import CardMain from '../games/card';
import RequireLogin from '@/user/RequireLogin';

const CardRoutes = (
    <Route key="card-main" path="/card/main" element={<RequireLogin><CardMain /></RequireLogin>} />
);

export default CardRoutes;
