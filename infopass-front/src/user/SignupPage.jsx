import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button1 from '@mui/material/Button';
import './userInfo.css';
import api from './api';
import DaumPostcode from "react-daum-postcode";
 import Postcode from './Postcode';

const SignupPage = () => {

  //모달창
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navi = useNavigate();

  //우편번호 상태
  const [zipCode, setZipCode] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState(''); // 사용자가 직접 입력할 상세 주소
  const [isPostcodeModalOpen, setIsPostcodeModalOpen] = useState(false); // 주소 검색 모달 열림/닫힘 상태

  //중복체크버튼 클릭여부
  const [userCheck, setUserCheck] = useState(false);

  //아이디 중복체크 메세지
  const [idmsg, setIdmsg] = useState('');

  // 핸드폰 번호 옵션
  const PHONENUMBER_LIST = ['010', '011', '016', '018', '019'];
  const [phonePrefix, setPhonePrefix] = useState(PHONENUMBER_LIST[0]);


  //사용자 정보
  const [userInfo, setUserInfo] = useState({
    id: '',
    email: 'naver.com',
    password: '',
    passwordConfirm: '',
    name: '',
    nickName: '',
    phone: '',
    address: '',
  });

  // 주소 검색 모달 열기 함수
  const handleOpenPostcodeModal = () => {
    setIsPostcodeModalOpen(true);
  };

  // 주소 검색 모달 닫기 함수
  const handleClosePostcodeModal = () => {
    setIsPostcodeModalOpen(false);
  };

  // Postcode 컴포넌트에서 주소 선택 시 호출될 콜백 함수
  const handleAddressSelect = (data) => {
    setZipCode(data.zonecode); // 우편번호 상태 업데이트
    setRoadAddress(data.roadAddress); // 도로명 주소 상태 업데이트
    // 상세 주소는 사용자가 직접 입력하므로 여기서는 업데이트하지 않습니다.
  };

  //아이디 체크 핸들러
  const handleCheckId = async () => {
    const email = userInfo.id + '@' + userInfo.email;
    try {
      const response = await api.post(`/user/checkId`, { email: email });
      if (response.data) {
        setIdmsg('이미 사용중인 아이디입니다.');
        setUserCheck(false);
      } else {
        setIdmsg('사용 가능한 아이디입니다.');
        setUserCheck(true);
      }
    } catch (error) {
      // 에러 처리
      console.error('아이디 중복 확인 중 오류 발생:', error);
      alert('아이디 중복 확인 중 오류가 발생했습니다.');
      setUserCheck(false);
      setIdmsg('중복 확인 중 오류가 발생했습니다.');
    }
  };

  //사용자 정보 입력 이벤트
  const inputChangeEvent = (e) => {
    const { name, value } = e.target;
    setUserInfo(userInfo => ({
      ...userInfo,
      [name]: value,
    }));
  }
  //회원가입시 중복체크없이 submit되는거 방지
  const onSubmitButton = (e) => {
    e.preventDefault();

    const phone = phonePrefix + userInfo.phone;
    const email = userInfo.id + '@' + userInfo.email;
    const address = roadAddress + ' ' + detailAddress;
    // 사용자 정보에 핸드폰 번호와 아이디 추가
    const sendInfo = {
      email: email,
      password: userInfo.password,
      name: userInfo.name,
      nickname: userInfo.nickName,
      address: address,
      phone: phone,

    };
    //console.log(sendInfo);

    if (!userCheck) {
      alert("아이디 중복체크 해주세요");
      return;
    } else {
      console.log("회원가입 정보: ", sendInfo);
      api.post("/user/join", sendInfo).then(() => {
        console.log("회원가입 성공");
        navi("/");

      }).catch(error => {
        console.error('회원가입 실패:', error.response ? error.response.data : error.message);
        // 에러 메시지 표시 로직
      });
    }
  }
  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="SignupPage-modal-container">
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <div className="infoTextFrame">
              <span className="userinfoText">기본 정보</span>
            </div>
          </Typography>
          <Typography id="modal-modal-description" component='div' sx={{ mt: 2 }}>
            <form onSubmit={onSubmitButton}>
              {/* 아이디 입력 필드 */}  
              <div className='userInputFrame'>
                <input type="text" className='UserInput' placeholder='아이디' name='id' minLength='5' value={userInfo.id}
                  onChange={inputChangeEvent} />
                <span style={{ color: 'white', alignContent: 'center' }}>@</span>
                <select className='UserInput' name='email' value={userInfo.email}
                  onChange={inputChangeEvent} >
                  <option value="naver.com">naver.com</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="google.com">google.com</option>
                  <option value="kakao.com">kakao.com</option>
                </select>
                <button type='button' className='CheckOfId' onClick={handleCheckId}>아이디 확인</button>
                <span>{idmsg}</span>
              </div>
              <br />
              {/* 비밀번호 입력 필드 */}  
              <div className='userInputFrame'>
                <input type="password" className='UserInput' placeholder='비밀번호' minLength='8'
                  name="password" value={userInfo.password} onChange={inputChangeEvent} />
                <span></span>
              </div>
              <br />
              <div className='userInputFrame'>
                <input type="password" className='UserInput' placeholder='비밀번호 확인' minLength='8'
                  name="passwordConfirm" value={userInfo.passwordConfirm} onChange={inputChangeEvent} />
                <span></span>
              </div>
              {/* 닉네임 입력 필드 */}  
              <div className="infoTextFrame">
                <span className="userinfoText">닉네임</span>
              </div>
              <div >
                <input type="text" className='UserInput' placeholder='닉네임'
                  name='nickName' value={userInfo.nickName} onChange={inputChangeEvent} />
                <span></span>
              </div>
              {/* 이름 입력 필드 */}              
                <div className="infoTextFrame">
                  <span className="userinfoText">이름</span>
                </div>
                <div className="numberSelectFrame">
                  <input className="UserInput" type="text" placeholder="이름을 입력해주세요"
                    name="name" value={userInfo.name} onChange={inputChangeEvent} />
                </div>              
              {/* 전화번호 입력 필드 */}
              <div className="numberFrame">
                <div className="infoTextFrame">
                  <span className="userinfoText">전화번호</span>
                </div>
                <div className="numberSelectFrame">
                  <select className="numberBox" value={phonePrefix} onChange={e => setPhonePrefix(e.target.value)}>
                    {PHONENUMBER_LIST.map((number, index) => (
                      <option key={index}>{number}</option>
                    ))}
                  </select>
                  <input className="UserInput" type="text" placeholder="휴대폰 번호를 입력해주세요"
                    name="phone" value={userInfo.phone} onChange={inputChangeEvent} />
                </div>
              </div>
              <div className="infoTextFrame">
                <span className="userinfoText">주소</span>
              </div>
              {/* 주소 입력 필드 및 검색 버튼 */}
              <div>
                <label>우편번호:</label>
                <input type="text" className='UserInput' value={zipCode} readOnly placeholder="우편번호" />
                <button type="button" onClick={handleOpenPostcodeModal}>우편번호 검색</button>
              </div>
              <div>
                <label>도로명 주소:</label>
                <input type="text" className='UserInput' value={roadAddress} readOnly placeholder="도로명 주소" />
              </div>
              <div>
                <label>상세 주소:</label>
                <input
                  className='UserInput'
                  type="text"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="상세주소"
                />  
              </div>
              {/* Postcode 컴포넌트 렌더링 */}
                <Postcode
                  isOpen={isPostcodeModalOpen} // 모달 열림 상태 전달
                  onClose={handleClosePostcodeModal} // 모달 닫기 함수 전달
                  onaddressSelect={handleAddressSelect} // 주소 선택 콜백 함수 전달
                />
              <div className="button-container">
                <Button1 type='submit' variant="outlined" color='success'>회원가입</Button1>
                <Button1 variant="outlined" type='button'>로그인</Button1>
              </div>
            </form>
          </Typography>
        </Box>
      </Modal>
    </div>
  )
}


export default SignupPage