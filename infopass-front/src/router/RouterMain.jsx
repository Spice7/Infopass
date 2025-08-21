
import { Route, Router, Routes, Link} from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRoutes'
import OxQuizRoutes from './OxQuizRoutes'
import BlockRoutes from './BlockRoutes'
import CardRoutes from './CardRoutes'
import Home from '../pages/Home'
import MyPageRoutes from './MyPageRoutes'
import Ranking from "./Ranking";
import { LoginContext } from '../user/LoginContextProvider.jsx'
import blankgame from './BlankGame.jsx'
import Menu from '../pages/menu.jsx'
import TermsOfUse from '../pages/TermsOfUse.jsx'
import PrivacyPolicy from '../pages/PrivacyPolicy.jsx'

const RouterMain = () => {
    return (
    <div className="app-shell">
            <Menu/>
            <main>

            <Routes>
                <Route path="/" element={<Home />} />
                {MyPageRoutes}
                {AdminRoutes}
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

    );
}

export default RouterMain;