import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button1 from '@mui/material/Button';
import './userInfo.css';
import Postcode from './Postcode';
import * as auth from './auth';
import { LoginContext } from './LoginContextProvider';

const SignupPage = () => {
  const { isSignUpModalOpen, closeSignUpModal, existingUser } = useContext(LoginContext);
  const navi = useNavigate();

  // 정규 표현식
  const [passwordValid, setPasswordValid] = useState(true);
  const phoneRegex = /^(010|011|016|018|019)\d{8}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;


  const [detailAddress, setDetailAddress] = useState(''); // 사용자가 직접 입력할 상세 주소
  const [isPostcodeModalOpen, setIsPostcodeModalOpen] = useState(false); // 주소 검색 모달 열림/닫힘 상태

  //중복체크버튼 클릭여부
  const [userCheck, setUserCheck] = useState(false);
  const [nickNameCheck, setNickNameCheck] = useState(false);
  const [isIdSent, setIsIdSent] = useState(false);

  //중복체크 메세지
  const [idmsg, setIdmsg] = useState('');
  const [nickNameMsg, setNickNameMsg] = useState('');

  // 비밀번호 유효성 검사 포커스
  const [passwordConfirmFocused, setPasswordConfirmFocused] = useState(false);

  // 핸드폰 번호 옵션
  const PHONENUMBER_LIST = ['010', '011', '016', '018', '019'];
  const [phonePrefix, setPhonePrefix] = useState(PHONENUMBER_LIST[0]);

  //문자메세지 인증
  const [smsToken, setSmsToken] = useState(''); // 백엔드에서 받은 SMS JWT
  const [inputCode, setInputCode] = useState(''); // 사용자가 입력하는 인증번호
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // 휴대폰 인증 완료 여부

  //사용자 정보
  const initialUserInfo = {
    id: '',               // 이메일 앞부분 (소셜 유저일 땐 사용안함)
    emailDomain: 'naver.com', // 이메일 도메인 선택
    emailInput: '',       // 직접입력 이메일
    password: '',
    passwordConfirm: '',
    name: '',
    nickname: '',
    phonePrefix: PHONENUMBER_LIST[0],
    phone: '',
    addressZipCode: '',
    addressRoad: '',
    addressDetail: '',
  };

  // 로컬 유저 정보
  const [userInfo, setUserInfo] = useState(initialUserInfo);

  // 소셜 유저 정보 (provider, providerKey, email, username)
  const [socialUser, setSocialUser] = useState(null);

  // 모달이 열릴 때마다 상태를 초기화
  useEffect(() => {
    if (isSignUpModalOpen) {
      if (existingUser) {
        setSocialUser(existingUser);
        setUserInfo({
          ...initialUserInfo,
          name: existingUser.name || '',
          nickname: existingUser.nickname || '',
          phonePrefix: existingUser.mobile.split("-")[0],
          phone: existingUser.mobile.split("-")[1] + existingUser.mobile.split("-")[2] || '',
          addressZipCode: existingUser.zipCode || '',
          addressRoad: existingUser.roadAddress || '',
          addressDetail: existingUser.detailAddress || '',
        });
        setUserCheck(true);   // 소셜 유저는 id 중복체크 불필요
      } else {
        setUserInfo(initialUserInfo);
        setSocialUser(null);
        setUserCheck(false);
      }
      // 초기화
      setPasswordValid(true);
      setNickNameCheck(false);
      setIdmsg('');
      setNickNameMsg('');
      setPasswordConfirmFocused(false);
      setSmsToken('');
      setInputCode('');
      setMessage('');
      setIsSent(false);
      setIsVerified(false);
      setIsIdSent(false);
    }
  }, [isSignUpModalOpen, existingUser]);

  // *** 이벤트 핸들러 ***

  // 사용자 정보 입력 이벤트
  const inputChangeEvent = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPasswordValid(passwordRegex.test(value));
    }
    setUserInfo(userInfo => ({ ...userInfo, [name]: value }));
  };

  // 사용자 정보 입력 이벤트  
  const handleInputCodeChange = (e) => setInputCode(e.target.value);

  // 아이디 중복 체크 핸들러
  const handleCheckId = async () => {
    const email = `${socialUser.email !== null ? socialUser.email.split("@")[0] : userInfo.id}@${userInfo.emailDomain === '직접입력' ? userInfo.emailInput : userInfo.emailDomain}`;
    setIdmsg("");
    if (!socialUser) {
      if (userInfo.id.length < 5) {
        setIdmsg({ text: '아이디는 5자 이상이어야 합니다.', color: 'red' });
        return;
      }
    } else {
      if (socialUser.email.split("@")[0].length < 5) {
        setIdmsg({ text: '아이디는 5자 이상이어야 합니다.', color: 'red' });
        return;
      }
    }

    try {
      const response = await auth.checkId(email);
      if (response.data) {
        setIdmsg({ 'text': '이미 사용중인 아이디입니다.', 'color': 'red' });
        setUserCheck(false);
        setIsIdSent(false);
      } else {
        setIdmsg({ 'text': '사용 가능한 아이디입니다.', 'color': 'yellowgreen' });
        setUserCheck(true);
        setIsIdSent(true);
      }
    } catch (error) {
      console.error('아이디 중복 확인 중 오류 발생:', error);
      alert('아이디 중복 확인 중 오류가 발생했습니다.');
      setUserCheck(false);
      setIdmsg('중복 확인 중 오류가 발생했습니다.');
    }
  };

  //닉네임 중복 체크 이벤트
  const handleCheckNickName = async () => {
    const nickname = userInfo.nickname.trim();
    setNickNameCheck("");

    if (nickname.length < 2) {
      setNickNameMsg({ text: '닉네임은 2자 이상이어야 합니다.', color: 'red' });
      setNickNameCheck(false);
      return;
    }

    try {
      const response = await auth.checkNickName(nickname);
      if (response.data) {
        setNickNameMsg({ text: '이미 사용중인 닉네임입니다.', color: 'red' });
        setNickNameCheck(false);
      } else {
        setNickNameMsg({ text: '사용 가능한 닉네임입니다.', color: 'yellowgreen' });
        setNickNameCheck(true);
      }
    } catch (error) {
      console.error('닉네임 중복 확인 중 오류 발생:', error);
      alert('닉네임 중복 확인 중 오류가 발생했습니다.');
      setUserCheck(false);
    }
  };

  // 문자메세지 인증 이벤트
  const SendSmsEvent = async () => {
    const phone = userInfo.phonePrefix + userInfo.phone;

    // 전화번호 유효성 검사
    if (!phoneRegex.test(phone)) {
      setMessage({ text: '올바른 휴대폰 번호를 입력하세요', color: "red" });
      return;
    }

    if (!phone) {
      setMessage({ text: '핸드폰 번호를 입력하세요', color: "red" });
      return;
    }

    try {
      const response = await auth.sendSms(phone);
      const token = response.data.smsToken;
      if (token) {
        setSmsToken(token);
        setIsSent(true);
        setMessage({ text: '인증번호가 발송되었습니다. 6자리 번호를 입력하세요.', color: "yellowgreen" });
      } else if (response.data.error) {
        setMessage({ text: response.data.error, color: "red" });
      }
    } catch (err) {
      setMessage({ text: '문자 발송 중 오류가 발생했습니다.', color: "red" });
      console.log("문자발송에러: ", err)
    }
  };

  // 인증번호 검증 요청 
  const handleVerifyCode = async () => {
    if (!inputCode) {
      setMessage({ text: '인증번호를 입력하세요', color: "red" });
      return;
    }
    try {
      await auth.verifyCode(smsToken, inputCode);
      setMessage({ text: '인증 성공', color: "yellowgreen" });
      setIsVerified(true);
    } catch (err) {
      setMessage({ text: err.response ? err.response.data : '인증 중 오류가 발생했습니다.', color: "red" });
      setIsVerified(false);
    }
  };

  // 주소 검색 모달 열기/닫기
  const handleOpenPostcodeModal = () => setIsPostcodeModalOpen(true);
  const handleClosePostcodeModal = () => setIsPostcodeModalOpen(false);

  // Postcode 컴포넌트에서 주소 선택 시 호출될 콜백 함수
  const handleAddressSelect = (data) => {
    setUserInfo(userinfo => ({
      ...userinfo,
      addressZipCode: data.zonecode,
      addressRoad: data.roadAddress,
    }));
    setIsPostcodeModalOpen(false);
  };

  // 중복체크없이 submit 방지 및 회원가입 처리
  const onSubmitButton = async (e) => {
    e.preventDefault();
    // 소셜유저일 경우 이메일과 이름은 socaialUser에서, 아니면 userInfo에서
    const email = socialUser
      ? socialUser.email
      : (userInfo.emailDomain === '직접입력' ? `${userInfo.id}@${userInfo.emailInput}` : `${userInfo.id}@${userInfo.emailDomain}`);
    const name = socialUser ? socialUser.username : userInfo.name;
    const phone = userInfo.phonePrefix + userInfo.phone;
    const address = `${userInfo.addressRoad} ${userInfo.addressDetail}`.trim();



    if (!passwordValid) {
      alert('비밀번호 형식이 올바르지 않습니다.');
      return;
    }
    if (userInfo.password !== userInfo.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!nickNameCheck) {
      alert('닉네임 중복체크 해주세요');
      return;
    }
    if (!socialUser) {
      if (!userCheck) {
        alert('아이디 중복체크 해주세요');
        return;
      }
      if (!isVerified) {
        alert('휴대폰 인증을 완료해주세요');
        return;
      }
    }

    const sendInfo = {
      email,
      password: userInfo.password,
      name,
      nickname: userInfo.nickname,
      address,
      phone,
      provider: socialUser?.provider || null,
      providerKey: socialUser?.providerKey || null,
    };
    console.log(sendInfo);
    try {
      await auth.join(sendInfo);
      console.log("회원가입 성공");
      closeSignUpModal();
      navi("/");
    } catch (error) {
      console.error('회원가입 실패:', error.response ? error.response.data : error.message);
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <Modal
      open={isSignUpModalOpen}
      onClose={closeSignUpModal}
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

            {/* 소셜 유저일 경우 hidden input으로 provider 정보 전달 */}
            {socialUser && (
              <>
                <input type="hidden" name="provider" value={socialUser.provider} />
                <input type="hidden" name="providerKey" value={socialUser.providerKey} />
              </>
            )}

            {/* Form content */}
            <div className='userInputFrame'>
              {/* 소셜 유저 이메일, 이름 (수정 불가) */}
              {socialUser ? (
                <>
                  <input
                    type="text"
                    className='UserInput'
                    placeholder='아이디'
                    value={socialUser.email.split('@')[0]}
                    disabled
                  />
                  <span style={{ color: 'white', alignContent: 'center' }}>@</span>
                  <input
                    type="text"
                    className='UserInput'
                    value={socialUser.email.split('@')[1]}
                    disabled
                    placeholder='이메일 도메인'
                  />
                  <button type='button' className='CheckOfId' onClick={handleCheckId}>
                    이메일 중복확인
                  </button>
                </>
              ) : (
                // 기존 회원가입 방식 (소셜유저 정보 없을 때)
                <>
                  <input
                    type="text"
                    className='UserInput'
                    placeholder='아이디'
                    name='id'
                    minLength='5'
                    value={userInfo.id}
                    disabled={isIdSent}
                    onChange={inputChangeEvent}
                    required
                  />
                  <span style={{ color: 'white', alignContent: 'center' }}>@</span>
                  <select
                    className='UserInput'
                    name='emailDomain'
                    value={userInfo.emailDomain}
                    onChange={inputChangeEvent}
                    required
                  >
                    <option value="naver.com">naver.com</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="google.com">google.com</option>
                    <option value="kakao.com">kakao.com</option>
                    <option value="직접입력">직접입력</option>
                  </select>
                  <button type='button' className='CheckOfId' onClick={handleCheckId}>
                    아이디 확인
                  </button>
                </>
              )}

              {userInfo.emailDomain === "직접입력" && !socialUser && (
                <input
                  className='UserInput'
                  type="text"
                  name="emailInput"
                  placeholder="이메일 직접입력"
                  value={userInfo.emailInput}
                  onChange={inputChangeEvent}
                  required
                />
              )}
              <span className="id-check-message" style={{ color: idmsg.color }}>
                {idmsg.text}
              </span>
            </div>
            {/* 비밀번호 */}
            <div className='userInputFrame'>
              <input type="password"
                className='UserInput'
                placeholder='비밀번호'
                minLength='8'
                name="password"
                value={userInfo.password}
                onChange={inputChangeEvent}
              />
              {!passwordValid && (
                <span style={{ color: 'red' }}>비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.(@$!%*#?&)</span>
              )}
            </div>
            <div className='userInputFrame'>
              <input type="password"
                className='UserInput'
                placeholder='비밀번호 확인'
                minLength='8'
                name="passwordConfirm"
                value={userInfo.passwordConfirm}
                onChange={inputChangeEvent}
                onFocus={() => setPasswordConfirmFocused(true)}
                onBlur={() => setPasswordConfirmFocused(false)}
              />
              {passwordConfirmFocused && userInfo.password !== userInfo.passwordConfirm && (
                <span style={{ color: "red" }}>비밀번호가 일치하지 않습니다.</span>
              )}
            </div>

            {/* 닉네임 */}
            <div className="infoTextFrame">
              <span className="userinfoText">닉네임</span>
            </div>
            <div className='userInputFrame'>
              <input type="text"
                className='UserInput'
                placeholder='닉네임'
                name='nickname'
                minLength={2}
                maxLength={8}
                value={userInfo.nickname}
                onChange={inputChangeEvent} />
              <button type="button" className='CheckOfId' onClick={handleCheckNickName}>중복확인</button>
              <span style={{ color: nickNameMsg.color }}>{nickNameMsg.text}</span>
            </div>

            {/* 이름 */}
            <div className="infoTextFrame">
              <span className="userinfoText">이름</span>
            </div>
            <div className="userInputFrame">
              {socialUser ? (
                <>
                  <input className="UserInput"
                    type="text"
                    placeholder="이름을 입력해주세요"
                    value={socialUser.username}
                    onChange={inputChangeEvent}
                    disabled
                  />
                </>
              ) : (
                <input className="UserInput"
                  type="text"
                  placeholder="이름을 입력해주세요"
                  name="name"
                  value={userInfo.name}
                  onChange={inputChangeEvent}
                />
              )}

            </div>

            <div className="infoTextFrame">
              <span className="userinfoText">전화번호</span>
            </div>
            {socialUser ? (
              <>
                <div className="numberSelectFrame">

                  <input className="numberBox"
                    value={socialUser.mobile.split("-")[0]}
                    disabled
                  >
                  </input>
                  <input className="UserInput"
                    type="number"
                    placeholder="휴대폰 번호를 입력해주세요"
                    name="phone"
                    maxLength='8'
                    minLength='8'
                    disabled
                    value={socialUser.mobile.split("-")[1] + socialUser.mobile.split("-")[2]}
                    onChange={inputChangeEvent} />
                </div>
              </>
            ) : (
              <>
                <div className="numberSelectFrame">
                  <select className="numberBox"
                    value={phonePrefix}
                    onChange={e => setPhonePrefix(e.target.value)}>
                    {PHONENUMBER_LIST.map((number, index) => (<option key={index} disabled={isSent}>{number}</option>))}
                  </select>
                  <input className="UserInput"
                    type="number"
                    placeholder="휴대폰 번호를 입력해주세요"
                    name="phone"
                    maxLength='8'
                    minLength='8'
                    disabled={isSent}
                    value={userInfo.phone}
                    onChange={inputChangeEvent} />
                  <button type='button' className='CheckOfId' onClick={SendSmsEvent}>휴대폰 인증</button>
                </div>
                <br />
                <div className='auth-input-frame'>
                  <input type="number"
                    maxLength='6'
                    minLength='6'
                    className='UserInput auth-code-input'
                    value={inputCode}
                    disabled={isVerified}
                    onChange={handleInputCodeChange} />
                  <button type='button' className='CheckOfId' onClick={handleVerifyCode}>인증 확인</button>
                  <div className='auth-message'>
                    <span style={{ color: message.color }}>{message.text}</span>
                  </div>
                </div>
              </>
            )}


            <div className="infoTextFrame"><span className="userinfoText">주소</span></div>
            <div className='userInputFrame'>
              <label>우편번호&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
              <input type="text"
                className='UserInput'
                value={userInfo.addressZipCode}
                readOnly
                placeholder="우편번호" />
              <button type="button" onClick={handleOpenPostcodeModal}>우편번호 검색</button>
            </div>
            <div className='userInputFrame'>
              <label>도로명 주소&nbsp;&nbsp;</label>
              <input type="text"
                className='UserInput'
                value={userInfo.addressRoad}
                readOnly
                placeholder="도로명 주소" />
            </div>
            <div className='userInputFrame'>
              <label>상세 주소&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
              <input className='UserInput'
                type="text"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="상세주소"
                minLength={2}
                maxLength={50} />
            </div>

            <Postcode isOpen={isPostcodeModalOpen} onClose={handleClosePostcodeModal} onaddressSelect={handleAddressSelect} />
            <div className="button-container">
              <Button1 type='submit' variant="outlined" color='success'>회원가입</Button1>
              <Button1 variant="outlined" type='button' onClick={closeSignUpModal}>로그인</Button1>
            </div>
          </form>
        </Typography>
      </Box>
    </Modal >
  );
}

export default SignupPage;