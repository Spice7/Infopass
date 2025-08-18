// FindIdModal.jsx
import React, { useState } from 'react';
import * as auth from './auth';
import './userInfo.css';
import FindPwModal from './FindPWModal';

const FindIdModal = ({ onClose }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [result, setResult] = useState('');    
    const handleFindId = async () => {
        
        if (!name || !phone) {
            setResult({ text: '모든 정보를 입력해주세요.', color: 'red' });
            return;
        }
        console.log(`이름: ${name}, 전화번호: ${phone}`);
        try {
            // 서버에 이름,전화번호로 아이디 찾기 요청
            const res = await auth.getResearchEmail(name, phone);
            const email = res.data.email;
            setResult({ text: `아이디는 ${email} 입니다.`, color: 'yellowgreen' });
            
        } catch (error) {
            setResult({ text: '아이디 찾기에 실패했습니다. 정보를 다시 확인해주세요.', color: 'red' });
        }
    };

    return (
        <div>
            <div className="infoTextFrame">
                <span className="userinfoText">이름</span>
            </div>
            <div className="userInputFrame">
                <input 
                    type="text" 
                    className="UserInput"
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="이름을 입력해주세요" 
                />
            </div>
            
            <div className="infoTextFrame">
                <span className="userinfoText">전화번호</span>
            </div>
            <div className="userInputFrame">
                <input 
                    type="text" 
                    className="UserInput"
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="전화번호를 입력해주세요" 
                />
            </div>
            
            {/* 결과 메시지를 위한 고정된 공간 */}
            <div className="result-message-container">
                {result && (
                    <span style={{ color: result.color, fontSize: '14px', fontWeight: '500' }}>
                        {result.text}                        
                    </span>
                )}
            </div>           
            <div className="button-container">
                <button 
                    type="button" 
                    className="CheckOfId"
                    onClick={handleFindId}
                >
                    아이디 찾기
                </button>
                <button 
                    type="button" 
                    className="CheckOfId"
                    onClick={onClose}
                >
                    닫기
                </button>
            </div>           
        </div>
    );
};

export default FindIdModal;