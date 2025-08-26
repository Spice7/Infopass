import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import * as auth from "./auth";
import { createContext } from "react";
import { registerLogoutCallback } from "./authUtils";
import { 
  LoginSuccessDialog, 
  LogoutConfirmDialog, 
  AlertDialog, 
  ConfirmDialog 
} from "./RequireLogin";

//  여기에 LoginContext를 생성하고 export 합니다.
export const LoginContext = createContext();

const LoginContextProvider = ({ children }) => {
  /* -----------------------[State]-------------------------- */
  // 로그인 여부
  const [isLogin, setLogin] = useState(false);

  // 유저 정보
  const [userInfo, setUserInfo] = useState(null);

  // 권한 정보
  const [roles, setRoles] = useState({ isUser: false, isAdmin: false });

  // 회원가입 모달 상태
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);

  // 소셜 유저 정보
  const [existingUser, setExistingUser] = useState(null);

  // 다이얼로그 상태들
  const [loginSuccessOpen, setLoginSuccessOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', type: 'info' });
  const [confirmData, setConfirmData] = useState({ title: '', message: '', onConfirm: null });

  // 소셜 유저 받아서 회원가입 모달 열 때 호출하는 함수
  const openSignUpModalWithUser = (user) => {
    setExistingUser(user);
    setSignUpModalOpen(true);
  };

  const openSignUpModal = () => setSignUpModalOpen(true);

  const closeSignUpModal = () => {
    setExistingUser(null); //모달 닫으면 소셜 유저 정보 초기화
    setSignUpModalOpen(false);
  };

  /* -------------------------------------------------------- */

  // 페이지 이동
  const navigate = useNavigate();

  // 🍪➡💍 로그인 체크
  const loginCheck = async () => {
    const accessToken = Cookies.get("accessToken");
    console.log(`accessToken: ${accessToken}`);

    if (!isLogin && !accessToken) {
      logoutSetting();
      return;
    }

    try {
      const response = await auth.info();
      const data = response.data;
      console.log(`로그인 체크 응답 데이터:`, data);
      loginSetting(data, accessToken);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // accessToek(jwt) 이 만료되었거나 인증에 실패하였습니다.
        console.error(
          "인증 실패: accessToken이 만료되었거나 유효하지 않습니다."
        );
      } else {
        // 사용자 정보 요청 중 알 수 없는 에러 발생
        console.error("사용자 정보 요청 중 에러 발생:", error);
      }
      logoutSetting(); // 인증 실패 시 로그아웃 처리
      return;
    }
  };

  // 🔐 로그인
  const login = async (username, password, location) => {
    try {
      const loginData = {
        email: username, // username을 email 필드로 매핑
        password: password,
      };
      const response = await auth.login(loginData);
      const data = response.data;
      const status = response.status;
      const headers = response.headers;
      const authorization = headers.authorization;
      const accessToken = authorization.replace("Bearer ", "");

      console.log(`로그인 응답 데이터:`, data.email);
      console.log(`로그인 응답 상태:`, status);
      console.log(`로그인 응답 헤더:`, headers);
      console.log(`로그인 응답 accessToken:`, accessToken);

      // 로그인 성공 시 accessToken을 쿠키에 저장하고 상태 업데이트
      if (status === 200) {
        Cookies.set("accessToken", accessToken);
        loginSetting(data, accessToken);

        // 원래 페이지로 이동 (location이 전달된 경우)
        if (location?.state?.from) {
          setLoginSuccessOpen(true);
          navigate(location.state.from || "/");
        } else {
          // 로그인 성공 다이얼로그 표시 후 메인 페이지로 이동
          setLoginSuccessOpen(true);
          navigate("/");
        }
      }
    } catch (error) {
      // 로그인 실패 다이얼로그 표시
      setAlertData({
        title: "로그인 실패",
        message: "아이디 또는 비밀번호가 일치하지 않습니다",
        type: "error"
      });
      setAlertOpen(true);
    }
  };

  // 🔐 로그인 세팅
  const loginSetting = async (userData, accessToken) => {
    const response = await auth.info();
    const data = response.data;
    console.log(`로그인 세팅:`, data);
    console.log(`accessToken:`, accessToken);

    setUserInfo(data);

    setLogin(true);

    const updatedRoles = { isUser: false, isAdmin: false };
    const rolesArray = Array.isArray(data.usertype)
      ? data.usertype
      : [data.usertype];
    rolesArray.forEach((role) => {
      //console.log("loginSetting - processing role:", role);
      if (role === "USER") updatedRoles.isUser = true;
      if (role === "ADMIN") updatedRoles.isAdmin = true;
    });
    setRoles(updatedRoles);
    //console.log("loginSetting - final updatedRoles:", updatedRoles);
  };

  // 로그아웃 세팅
  const logoutSetting = () => {
    Cookies.remove("accessToken");
    Cookies.remove("user");
    Cookies.remove("naver_oauth_state");
    Cookies.remove("kakao_oauth_state");
    setLogin(false);
    setUserInfo(null);
    setRoles({ isUser: false, isAdmin: false });
    //navigate("/login", { replace: true });
  };

  // 🔓 로그아웃
  const logout = (force = false) => {
    if (force) {
      logoutSetting();
      navigate("/");
      return;
    }

    // 로그아웃 확인 다이얼로그 표시
    setLogoutConfirmOpen(true);
  };

  // 로그아웃 확인 처리
  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    setAlertData({
      title: "로그아웃 성공",
      message: "로그아웃되었습니다",
      type: "success"
    });
    setAlertOpen(true);
    logoutSetting();
    navigate("/");
  };

  // 로그아웃 취소 처리
  const handleLogoutCancel = () => {
    setLogoutConfirmOpen(false);
  };

  // 로그인 성공 다이얼로그 확인 처리
  const handleLoginSuccessConfirm = () => {
    setLoginSuccessOpen(false);
    // 로그인 성공 다이얼로그가 닫히면 현재 페이지에 머무름
  };

  // 알림 다이얼로그 확인 처리
  const handleAlertConfirm = () => {
    setAlertOpen(false);
  };

  // Mount 시 로그인 체크 및 로그아웃 콜백 등록
  useEffect(() => {
    loginCheck();
    registerLogoutCallback(logoutSetting);
  }, []);

  return (
    <LoginContext.Provider
      value={{
        isLogin,
        userInfo,
        roles,
        login,
        logout,
        loginCheck,
        isSignUpModalOpen,
        openSignUpModal,
        closeSignUpModal,
        existingUser,
        setExistingUser,
        openSignUpModalWithUser,
      }}
    >
      {children}
      
      {/* 로그인 성공 다이얼로그 */}
      <LoginSuccessDialog
        open={loginSuccessOpen}
        onConfirm={handleLoginSuccessConfirm}
      />
      
      {/* 로그아웃 확인 다이얼로그 */}
      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
      
      {/* 알림 다이얼로그 */}
      <AlertDialog
        open={alertOpen}
        title={alertData.title}
        message={alertData.message}
        onConfirm={handleAlertConfirm}
      />
    </LoginContext.Provider>
  );
};

export default LoginContextProvider;
