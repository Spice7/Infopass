import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button1 from '@mui/material/Button';
import './userInfo.css';
import Postcode from './Postcode';
import * as auth from './auth';
import { LoginContext } from './LoginContextProvider';

const PHONENUMBER_LIST = ['010', '011', '016', '018', '019'];
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const phoneRegex = /^(010|011|016|018|019)\d{8}$/;

const initialUserInfo = {
  id: '',
  emailDomain: 'naver.com',
  emailInput: '',
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

const SignupPage = () => {
  const { isSignUpModalOpen, closeSignUpModal, existingUser } = useContext(LoginContext);
  const navi = useNavigate();

  // 상태
  const [userInfo, setUserInfo] = useState(initialUserInfo);
  const [socialUser, setSocialUser] = useState(null);
  const [detailAddress, setDetailAddress] = useState('');
  const [isPostcodeModalOpen, setIsPostcodeModalOpen] = useState(false);
  const [userCheck, setUserCheck] = useState(false);
  const [nickNameCheck, setNickNameCheck] = useState(false);
  const [isIdSent, setIsIdSent] = useState(false);
  const [idmsg, setIdmsg] = useState({ text: '', color: '' });
  const [nickNameMsg, setNickNameMsg] = useState({ text: '', color: '' });
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordConfirmFocused, setPasswordConfirmFocused] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState(PHONENUMBER_LIST[0]);
  const [smsToken, setSmsToken] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState({ text: '', color: '' });
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // 모달 열릴 때마다 상태 초기화
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
        setUserCheck(true);
      } else {
        setUserInfo(initialUserInfo);
        setSocialUser(null);
        setUserCheck(false);
      }
      setPasswordValid(true);
      setNickNameCheck(false);
      setIdmsg({ text: '', color: '' });
      setNickNameMsg({ text: '', color: '' });
      setPasswordConfirmFocused(false);
      setSmsToken('');
      setInputCode('');
      setMessage({ text: '', color: '' });
      setIsSent(false);
      setIsVerified(false);
      setIsIdSent(false);
      setPhonePrefix(PHONENUMBER_LIST[0]);
      setDetailAddress('');
    }
  }, [isSignUpModalOpen, existingUser]);

  // 입력 핸들러
  const inputChangeEvent = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "password") setPasswordValid(passwordRegex.test(value));
    setUserInfo(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleInputCodeChange = useCallback((e) => setInputCode(e.target.value), []);

  // 아이디 중복 체크
  const handleCheckId = useCallback(async () => {
    const email = socialUser
      ? socialUser.email
      : (userInfo.emailDomain === '직접입력' ? `${userInfo.id}@${userInfo.emailInput}` : `${userInfo.id}@${userInfo.emailDomain}`);
    setIdmsg({ text: '', color: '' });
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
        setIdmsg({ text: '이미 사용중인 아이디입니다.', color: 'red' });
        setUserCheck(false);
        setIsIdSent(false);
      } else {
        setIdmsg({ text: '사용 가능한 아이디입니다.', color: 'yellowgreen' });
        setUserCheck(true);
        setIsIdSent(true);
      }
    } catch (error) {
      setIdmsg({ text: '중복 확인 중 오류가 발생했습니다.', color: 'red' });
      setUserCheck(false);
      console.log(error);
    }
  }, [socialUser, userInfo]);

  // 닉네임 중복 체크
  const handleCheckNickName = useCallback(async () => {
    const nickname = userInfo.nickname.trim();
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
      setNickNameMsg({ text: '중복 확인 중 오류가 발생했습니다.', color: 'red' });
      setNickNameCheck(false);
      console.log(error);
    }
  }, [userInfo.nickname]);

  // 문자 인증
  const SendSmsEvent = useCallback(async () => {
    const phone = phonePrefix + userInfo.phone;
    if (!phoneRegex.test(phone)) {
      setMessage({ text: '올바른 휴대폰 번호를 입력하세요', color: "red" });
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
      console.log(err);
    }
  }, [phonePrefix, userInfo.phone]);

  // 인증번호 검증
  const handleVerifyCode = useCallback(async () => {
    const purpose = "signup";
    if (!inputCode) {
      setMessage({ text: '인증번호를 입력하세요', color: "red" });
      return;
    }
    try {
      await auth.verifyCode(smsToken, inputCode, purpose);
      setMessage({ text: '인증 성공', color: "yellowgreen" });
      setIsVerified(true);
    } catch (err) {
      setMessage({ text: err.response ? err.response.data : '인증 중 오류가 발생했습니다.', color: "red" });
      setIsVerified(false);
    }
  }, [smsToken, inputCode]);

  // 주소 검색
  const handleOpenPostcodeModal = useCallback(() => setIsPostcodeModalOpen(true), []);
  const handleClosePostcodeModal = useCallback(() => setIsPostcodeModalOpen(false), []);
  const handleAddressSelect = useCallback((data) => {
    setUserInfo(prev => ({
      ...prev,
      addressZipCode: data.zonecode,
      addressRoad: data.roadAddress,
    }));
    setIsPostcodeModalOpen(false);
  }, []);

  // 회원가입 처리
  const onSubmitButton = async (e) => {
    e.preventDefault();
    const email = socialUser
      ? socialUser.email
      : (userInfo.emailDomain === '직접입력' ? `${userInfo.id}@${userInfo.emailInput}` : `${userInfo.id}@${userInfo.emailDomain}`);
    const name = socialUser ? socialUser.username : userInfo.name;
    const phone = phonePrefix + userInfo.phone;
    const address = `${userInfo.addressRoad} ${detailAddress}`.trim();

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
    try {
      await auth.join(sendInfo);
      closeSignUpModal();
      navi("/");
    } catch (error) {
      alert("회원가입에 실패했습니다.", error);
    }
  };

  if (!isSignUpModalOpen) return null;

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
            {socialUser && (
              <>
                <input type="hidden" name="provider" value={socialUser.provider} />
                <input type="hidden" name="providerKey" value={socialUser.providerKey} />
              </>
            )}
            <div className='userInputFrame email-input-frame'>
              {socialUser ? (
                <>
                  <input
                    type="text"
                    className='UserInput UserInput--small'
                    placeholder='아이디'
                    value={socialUser.email.split('@')[0]}
                    disabled
                  />
                  <span className="email-separator">@</span>
                  <input
                    type="text"
                    className='UserInput UserInput--small'
                    value={socialUser.email.split('@')[1]}
                    disabled
                    placeholder='이메일 도메인'
                  />
                  <button type='button' className='CheckOfId' onClick={handleCheckId}>
                    이메일 중복확인
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    className='UserInput UserInput--small'
                    placeholder='아이디'
                    name='id'
                    minLength='5'
                    value={userInfo.id}
                    disabled={isIdSent}
                    onChange={inputChangeEvent}
                    required
                  />
                  <span className="email-separator">@</span>
                  <select
                    className='UserInput UserInput--small'
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
                  className='UserInput UserInput--small'
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
            <div className='userInputFrame'>
              <input type="password"
                className='UserInput auth-userInput-input'
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
                className='UserInput auth-userInput-input'
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
            <div className="infoTextFrame">
              <span className="userinfoText">닉네임</span>
            </div>
            <div className='userInputFrame'>
              <input type="text"
                className='UserInput auth-userInput-input'
                placeholder='닉네임'
                name='nickname'
                minLength={2}
                maxLength={8}
                value={userInfo.nickname}
                onChange={inputChangeEvent} />
              <button type="button" className='CheckOfId' onClick={handleCheckNickName}>중복확인</button>
              <span style={{ color: nickNameMsg.color }}>{nickNameMsg.text}</span>
            </div>
            <div className="infoTextFrame">
              <span className="userinfoText">이름</span>
            </div>
            <div className="userInputFrame">
              {socialUser ? (
                <input className="UserInput auth-userInput-input"
                  type="text"
                  placeholder="이름을 입력해주세요"
                  value={socialUser.username}
                  disabled
                />
              ) : (
                <input className="UserInput auth-userInput-input"
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
              <div className="numberSelectFrame">
                <select className="numberBox"
                    value={socialUser.mobile.split("-")[0]}
                    disabled
                >
                    {PHONENUMBER_LIST.map((number, index) => (<option key={index} disabled={isSent}>{number}</option>))}
                  </select>
                <input className="UserInput"
                  type="number"
                  placeholder="휴대폰 번호를 입력해주세요"
                  name="phone"
                  maxLength='8'
                  minLength='8'
                  disabled
                  value={socialUser.mobile.split("-")[1] + socialUser.mobile.split("-")[2]}
                />
              </div>
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
                    onChange={inputChangeEvent}
                  />
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
              <label>우편번호</label>
              <input type="text"
                style={{ marginLeft: '28px' }}
                className='UserInput'
                value={userInfo.addressZipCode}
                readOnly
                placeholder="우편번호" />
              <button type="button" onClick={handleOpenPostcodeModal}>우편번호 검색</button>
            </div>
            <div className='userInputFrame'>
              <label>도로명 주소</label>
              <input type="text"
                style={{ marginLeft: '10px' }}
                className='UserInput'
                value={userInfo.addressRoad}
                readOnly
                placeholder="도로명 주소" />
            </div>
            <div className='userInputFrame' >
              <label>상세 주소</label>
              <input className='UserInput'
                style={{ marginLeft: '25px' }}
                type="text"
                value={detailAddress}
                onChange={e => setDetailAddress(e.target.value)}
                placeholder="상세주소"
                minLength={2}
                maxLength={50} />
            </div>
            <Postcode isOpen={isPostcodeModalOpen} onClose={handleClosePostcodeModal} onaddressSelect={handleAddressSelect} />
            <div className="button-container">
              <Button1 type='submit' variant="outlined" color='success'>회원가입</Button1>
              <Button1 variant="outlined" type='button' onClick={closeSignUpModal}>로그인으로 돌아가기</Button1>
            </div>
          </form>
        </Typography>
      </Box>
    </Modal>
  );
};

export default SignupPage;