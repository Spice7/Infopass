import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import api from './api'
import * as auth from './auth'
import * as Swal from './alert'
import { createContext } from 'react'
import { registerLogoutCallback } from './authUtils';

//  여기에 LoginContext를 생성하고 export 합니다.
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

        if (!accessToken) {
            logoutSetting();
            return;
        }

        try {
            const response = await auth.info();
            const data = response.data;
            loginSetting(data, accessToken);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                // accessToek(jwt) 이 만료되었거나 인증에 실패하였습니다.
                console.error("인증 실패: accessToken이 만료되었거나 유효하지 않습니다.");
            } else {
                // 사용자 정보 요청 중 알 수 없는 에러 발생
                console.error("사용자 정보 요청 중 에러 발생:", error);
            }
            logoutSetting(); // 인증 실패 시 로그아웃 처리
            return;
        }
    };

    // 🔐 로그인
    const login = async (username, password) => {
        try {
            const loginData = {
                email: username,
                password: password,
            };
            const response = await auth.login(loginData);
            const status = response.status;
            const headers = response.headers;
            const authorization = headers.authorization;
            const accessToken = authorization.replace("Bearer ", "");

            if (status === 200) {
                Cookies.set("accessToken", accessToken);
                // 사용자 정보 새로 요청
                const userInfoResponse = await auth.info();
                loginSetting(userInfoResponse.data, accessToken);

                Swal.alert("로그인 성공", "메인 화면으로 이동합니다", "success", () => {
                    navigate("/");
                });
            }
        } catch (error) {
            Swal.alert("로그인 실패", "아이디 또는 비밀번호가 일치하지 않습니다", "error");
        }
    };

    // 🔐 로그인 세팅
    const loginSetting = (userData, accessToken) => {
        const { id, email, usertype, nickname } = userData;
        console.log(`로그인 세팅:`, userData);
        console.log(`accessToken:`, accessToken);

        setLogin(true);
        const updatedUserInfo = { id, email, usertype, nickname };
        setUserInfo(updatedUserInfo);
        console.log(`updatedUserInfo:`, updatedUserInfo);

        const updatedRoles = { isUser: false, isAdmin: false };
        const rolesArray = Array.isArray(usertype) ? usertype : [usertype];
        rolesArray.forEach((role) => {
            //console.log("loginSetting - processing role:", role); 
            if (role === 'USER') updatedRoles.isUser = true;
            if (role === 'ADMIN') updatedRoles.isAdmin = true;

        });
        setRoles(updatedRoles);
        //console.log("loginSetting - final updatedRoles:", updatedRoles);
    };

    // 로그아웃 세팅
    const logoutSetting = () => {
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

    // Mount 시 로그인 체크 및 로그아웃 콜백 등록
    useEffect(() => {
        loginCheck();
        registerLogoutCallback(logoutSetting);
    }, []);

    return (
        <LoginContext.Provider value={{ isLogin, userInfo, roles, login, loginCheck, logout }}>
            {children}
        </LoginContext.Provider>
    )
};

export default LoginContextProvider