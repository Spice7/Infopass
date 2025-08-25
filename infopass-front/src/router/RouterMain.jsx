
import { Route, Router, Routes, Link} from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRoutes'
import OxQuizRoutes from './OxQuizRoutes'
import BlockRoutes from './BlockRoutes'
import CardRoutes from './CardRoutes'
import Home from '../pages/Home'
import MyPageRoutes from './MyPageRoutes'
import Ranking from "./Ranking";
import blankgame from './BlankGame.jsx'
import Menu from '../pages/menu.jsx'
import TermsOfUse from '../pages/TermsOfUse.jsx'
import PrivacyPolicy from '../pages/PrivacyPolicy.jsx'

const RouterMain = () => {
    return (
        <Routes>
            {/* 관리자 페이지는 독립적인 레이아웃 사용 */}
            {/* 헤더가 UI 가려지는 문제 발생해서 피신시킴 */}
            {AdminRoutes}
            
            {/* 나머지 페이지들은 기본 레이아웃 사용 */}
            <Route path="/*" element={
                <div className="app-shell">
                    <Menu/>
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            {MyPageRoutes}
                            {Ranking}
                            {UserRoutes}
                            {OxQuizRoutes}
                            {BlockRoutes}
                            {CardRoutes}
                            {blankgame}
                            {/* Flip Game placeholder route */}
                            <Route path='/이용약관' element={<TermsOfUse />} />
                            <Route path='/개인정보처리방침' element={<PrivacyPolicy />} />
                            <Route path='/flip' element={<div style={{padding:'40px', textAlign:'center'}}><h2>카드 뒤집기 게임</h2><p>준비 중입니다. 곧 찾아뵐게요!</p></div>} />

                            <Route path='*' element={<h1>잘못된 주소입니다</h1>} />
                        </Routes>
                    </main>
                </div>
            } />
        </Routes>
    );
}

export default RouterMain;