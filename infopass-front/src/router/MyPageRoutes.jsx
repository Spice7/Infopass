import React from 'react';
import { Route } from 'react-router-dom';
import MyPage from '../pages/mypage/MyPage';

const MyPageRoutes = [
  <Route key="mypage" path="/mypage" element={<MyPage />} />
];

export default MyPageRoutes;
