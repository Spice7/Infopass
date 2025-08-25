import React from 'react';
import { Route } from 'react-router-dom';
import MyPage from '../pages/mypage/MyPage';
import RequireLogin from '@/user/RequireLogin';

const MyPageRoutes = [
  <Route key="mypage" path="/mypage" element={<RequireLogin><MyPage /></RequireLogin>} />
];

export default MyPageRoutes;
