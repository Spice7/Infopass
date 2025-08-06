import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button1 from '@mui/material/Button';
import './userInfo.css';
// import DaumPostcode from 'react-daum-postcode';

const SignupPage = () => {

  //모달창
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navi = useNavigate();

  //중복체크버튼 클릭여부
  const [userCheck, setUserCheck] = useState(false);

  //아이디 중복체크 메세지
  const [idmsg, setIdmsg] = useState('');

  // 핸드폰 번호 옵션
  const PHONENUMBER_LIST = ['010', '011', '016', '018', '019'];
  const [phonePrefix, setPhonePrefix] = useState(PHONENUMBER_LIST[0]);

  //axios URL
  const insertUrl = "http://localhost:9000/user/register";


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

  //아이디 체크
  const idCheckEvent = () => {
    const email = userInfo.id + "@" + userInfo.email;
    const idCheckUrl = "http://localhost:9000/user/idCheck";
    console.log(email);
    axios.post(idCheckUrl, {email: email}).then(res => {
      console.log(res.data);
      if (res.data =="available") {
        setIdmsg('사용 가능한 아이디입니다.');
        setUserCheck(true); // 중복체크 성공
      } else {
        setIdmsg('중복된 아이디입니다.');
        setUserCheck(false); // 중복체크 실패
      }

    }).catch(err => {
      console.log(err);
    });
  }

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

    // 사용자 정보에 핸드폰 번호와 아이디 추가
    const sendInfo = {
      email: email,
      password: userInfo.password,
      name: userInfo.name,
      nickname: userInfo.nickName,
      address: userInfo.address,
      phone: phone,
    
    };
    //console.log(sendInfo);

    if (!userCheck) {
      alert("아이디 중복체크 해주세요");
      return;
    } else {
      console.log("회원가입 정보: ", sendInfo);
      axios.post(insertUrl, sendInfo).then(() => {
        console.log("회원가입 성공");
        navi("/member/login");

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
                <button type='button' className='CheckOfId' onClick={idCheckEvent}>아이디 확인</button>
                <span>{idmsg}</span>
              </div>
              <br />
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
              <div className="infoTextFrame">
                <span className="userinfoText">닉네임</span>
              </div>
              <div >
                <input type="text" className='UserInput' placeholder='닉네임'
                  name='nickName' value={userInfo.nickName} onChange={inputChangeEvent} />
                <span></span>
              </div>
              <div className="numberFrame">
                <div className="infoTextFrame">
                  <span className="userinfoText">이름</span>
                </div>
                <div className="numberSelectFrame">
                  <input className="UserInput" type="text" placeholder="이름을 입력해주세요"
                    name="name" value={userInfo.name} onChange={inputChangeEvent} />
                </div>
              </div>
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
              <div className="numberFrame">
                <div className="infoTextFrame">
                  <span className="userinfoText">주소</span>
                </div>
                <div className="numberSelectFrame">
                  <input className="UserInput" type="text" placeholder="주소를 입력해주세요"
                    name="address" value={userInfo.address} onChange={inputChangeEvent} />
                </div>
              </div>
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