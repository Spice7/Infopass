import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import * as auth from "./auth";
import * as Swal from "./alert";
import { createContext } from "react";
import { registerLogoutCallback } from "./authUtils";

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

        Swal.alert("로그인 성공", "메인 화면으로 이동합니다", "success", () => {
          navigate(location.state?.from || "/");
        });
      }
    } catch (error) {
      Swal.alert(
        "로그인 실패",
        "아이디 또는 비밀번호가 일치하지 않습니다",
        "error",
        error
      );
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

    Swal.confirm(
      "로그아웃하시겠습니까?",
      "로그아웃을 진행합니다.",
      "warning",
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
    </LoginContext.Provider>
  );
};

export default LoginContextProvider;
