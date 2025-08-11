import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as auth from './auth'
import UserForm from './UserForm'
import { LoginContext } from './LoginContextProvider'
import * as Swal from './alert';
import OX_SingleGame from '../games/oxquiz/OX_SingleGame'
import OX_main from '../games/oxquiz/OX_main'

const User = () => {

  const { isLogin, roles, logout } = useContext(LoginContext)
  const [ userInfo, setUserInfo ] = useState()
  const navigate = useNavigate()
  
  // 회원 정보 조회 - /user/info
  const getUserInfo = async () => {


    // 비로그인 또는 USER 권한이 없으면 ➡ 로그인 페이지로 이동
    if( !isLogin || !roles.isUser ) {
      console.log(`isLogin : ${isLogin}`);
      console.log(`roles.isUser : ${roles.isUser}`);
      navigate("/login")
      return
    }


    const response = await auth.info()
    const data = response.data
    console.log(`getUserInfo`);
    console.log(data);
    setUserInfo(data)
  }

  // 회원 정보 수정
  const updateUser = async ( form ) => {
    console.log(form);

    let response
    let data
    try {
      response = await auth.update(form)
    } catch (error) {
      console.error(`${error}`);
      console.error(`회원정보 수정 중 에러가 발생하였습니다.`);
      return
    }

    data = response.data
    const status = response.status
    console.log(`data : ${data}`);
    console.log(`status : ${status}`);

    if( status === 200 ) {
      console.log(`회원정보 수정 성공!`);
      // alert(`회원정보 수정 성공!`)
      // logout()
      Swal.alert("회원수정 성공", "로그아웃 후, 다시 로그인해주세요.", "success", () => { logout(true) })
    }
    else {
      console.log(`회원정보 수정 실패!`);
      // alert(`회원정보 수정 실패!`)
      Swal.alert("회원수정 실패", "회원수정에 실패하였습니다.", "error" )
    }
  }

  // 회원 탈퇴
  const deleteUser = async (email) => {
    console.log(email);

    let response
    let data
    try {
      response = await auth.remove(email)
    } catch (error) {
      console.error(`${error}`);
      console.error(`회원삭제 중 에러가 발생하였습니다.`);
      return
    }

    data = response.data
    const status = response.status
    console.log(`data : ${data}`);
    console.log(`status : ${status}`);

    if( status === 200 ) {
      console.log(`회원삭제 성공!`);
      // alert(`회원삭제 성공!`)
      // logout()
      Swal.alert("회원탈퇴 성공", "그동안 감사했습니다:)", "success", () => { logout(true) })
    }
    else {
      console.log(`회원삭제 실패!`);
      // alert(`회원삭제 실패!`)
      Swal.alert("회원탈퇴 실패", "회원탈퇴에 실패하였습니다.", "error" )
    }

  }

  useEffect( () => {
    if( !isLogin ) {
      return
    }
    getUserInfo()
  }, [isLogin])


  return (
    <>
        <header />
        <div className="container">
            <UserForm userInfo={userInfo} updateUser={updateUser} deleteUser={deleteUser} />           
        </div>
    </>
  )
}

export default User