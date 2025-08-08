import React, {  useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import api from './api'
import * as auth from './auth'
import * as Swal from './alert'
import { createContext } from 'react'

// 🟢 여기에 LoginContext를 생성하고 export 합니다.
export const LoginContext = createContext();

const LoginContextProvider = ({ children }) => {

  /* -----------------------[State]-------------------------- */
  // 로그인 여부
  const [isLogin, setLogin] = useState(false);

  // 유저 정보
  const [userInfo, setUserInfo] = useState(null)

  // 권한 정보
  const [roles, setRoles] = useState({ isUser: false, isAdmin: false });

  /* -------------------------------------------------------- */

  // 페이지 이동
  const navigate = useNavigate()


  // 🍪➡💍 로그인 체크
    const loginCheck = async () => {
        const accessToken = Cookies.get("accessToken");
        console.log(`accessToken : ${accessToken}`);

        if (!accessToken) {
            console.log(`쿠키에 accessToken(jwt) 가 없음`);
            logoutSetting();
            return;
        }

        console.log(`쿠키에 JWT(accessToken) 이 저장되어 있음`);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        try {
            const response = await auth.info();
            const data = response.data;
            console.log(`data : ${data}`);

            console.log(`accessToken(jwt) 토큰으로 사용자 정보 요청 성공!`);
            loginSetting(data, accessToken);

        } catch (error) {
            console.log(`error : ${error}`);
            console.log(`status : ${error.response ? error.response.status : 'N/A'}`);

            if (error.response && error.response.status === 401) {
                console.log(`accessToek(jwt) 이 만료되었거나 인증에 실패하였습니다.`);
            } else {
                console.log(`사용자 정보 요청 중 알 수 없는 에러 발생`);
            }
            logoutSetting(); // 인증 실패 시 로그아웃 처리
            return;
        }
    };

    // 🔐 로그인
    const login = async (username, password) => {
        console.log(`username: ${username}`);
        console.log(`password: ${password}`);

        try {
            const loginData = {
                email: username,  // username을 email 필드로 매핑
                password: password
            };
            const response = await auth.login(loginData);
            const data = response.data;
            const status = response.status;
            const headers = response.headers;
            const authorization = headers.authorization;
            const accessToken = authorization.replace("Bearer ", "");

            console.log(`data : ${data}`);
            console.log(`status : ${status}`);
            console.log(`headers : ${headers}`);
            console.log(`jwt : ${accessToken}`);

            if (status === 200) {
                Cookies.set("accessToken", accessToken);

                loginCheck();

                Swal.alert("로그인 성공", "메인 화면으로 이동합니다", "success",
                    () => { navigate("/"); }
                );
            }

        } catch (error) {
            Swal.alert("로그인 실패", "아이디 또는 비밀번호가 일치하지 않습니다", "error");
            console.log(`로그인 실패: ${error}`);
        }
    };

    // 🔐 로그인 세팅
    const loginSetting = (userData, accessToken) => {
        const { id, email, usertype } = userData;
        

        console.log(`id : ${id}`);
        console.log(`email : ${email}`);
        console.log(`usertype : ${usertype}`);
        

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        setLogin(true);
        const updatedUserInfo = { id, email, usertype };
        setUserInfo(updatedUserInfo);

        const updatedRoles = { isUser: false, isAdmin: false };
        const rolesArray = Array.isArray(usertype) ? usertype : [usertype];
        rolesArray.forEach((role) => {
            if (role === 'ROLE_USER') updatedRoles.isUser = true;
            if (role === 'ROLE_ADMIN') updatedRoles.isAdmin = true;
        });
        setRoles(updatedRoles);
    };

    // 로그아웃 세팅
    const logoutSetting = () => {
        api.defaults.headers.common.Authorization = undefined;
        Cookies.remove("accessToken");
        setLogin(false);
        setUserInfo(null);
        setRoles({ isUser: false, isAdmin: false });
    };

    // 🔓 로그아웃
    const logout = (force = false) => {
        if (force) {
            logoutSetting();
            navigate("/");
            return;
        }

        Swal.confirm("로그아웃하시겠습니까?", "로그아웃을 진행합니다.", "warning",
            (result) => {
                if (result.isConfirmed) {
                    Swal.alert("로그아웃 성공", "", "success");
                    logoutSetting();
                    navigate("/");
                }
            }
        );
    };

    // Mount 시 로그인 체크
    useEffect(() => {
        loginCheck();
    }, []);

    return (
    <LoginContext.Provider value={{ isLogin, userInfo, roles, login, loginCheck, logout }}>
      {children}
    </LoginContext.Provider>
  )
};

export default LoginContextProvider