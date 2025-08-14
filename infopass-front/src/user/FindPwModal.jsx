// FindPwModal.jsx
import React, { useState } from 'react';
import * as auth from './auth';
import './userInfo.css';

const FindPwModal = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [result, setResult] = useState('');
    const [passwordConfirmFocused, setPasswordConfirmFocused] = useState(false);
    const [passwordValid, setPasswordValid] = useState(true);
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    // 1단계: 이메일/전화번호 확인
    const handleCheckUser = async () => {
        if (!email || !phone) {
            setResult({ text: '모든 정보를 입력해주세요.', color: 'red' });
            return;
        }

        try {
            const res = await auth.findPw(email, phone); // 서버에서 존재여부 확인
            if (res.data && res.data.message === "success") {
                setStep(2); // 2단계로 이동
                setResult({ text: '사용자 확인이 완료되었습니다. 새 비밀번호를 입력해주세요.', color: 'yellowgreen' });
            } else {
                setResult({ text: '입력하신 정보와 일치하는 계정이 없습니다.', color: 'red' });
            }
        } catch (e) {
            setResult({ text: '정보가 일치하지 않거나 오류가 발생했습니다.', color: 'red' });
        }
    };

    // 2단계: 비밀번호 변경
    const handlePwChange = async () => {
        if (!newPw || !confirmPw) {
            setResult({ text: '새 비밀번호를 모두 입력해주세요.', color: 'red' });
            return;
        }
        if (newPw !== confirmPw) {
            setResult({ text: '비밀번호가 일치하지 않습니다.', color: 'red' });
            return;
        }

        try {
            const response = await auth.changePw(email, phone, newPw);
            if (response.data && response.data.success) {
                setResult({ text: '비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인하세요.', color: 'yellowgreen' });
            } else {
                setResult({ text: '비밀번호 변경에 실패했습니다.', color: 'red' });
            }
        } catch (e) {
            setResult({ text: '비밀번호 변경 중 오류가 발생했습니다.', color: 'red' });
        }
    };

    const handlePasswordChange = (e) => {
        const { value } = e.target;
        setResult('');
        setNewPw(value);
        setPasswordValid(passwordRegex.test(value));
    };

    return (
        <div>
            {step === 1 && (
                <>
                    <div className="infoTextFrame">
                        <span className="userinfoText">이메일</span>
                    </div>
                    <div className="userInputFrame">
                        <input
                            type="email"
                            className="UserInput"
                            name="FindPwByEmail"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="이메일을 입력해주세요"
                        />
                    </div>

                    <div className="infoTextFrame">
                        <span className="userinfoText">전화번호</span>
                    </div>
                    <div className="userInputFrame">
                        <input
                            type="text"
                            className="UserInput"
                            name="FindPwByPhone"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="전화번호를 입력해주세요"
                        />
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div className="infoTextFrame">
                        <span className="userinfoText">새 비밀번호</span>
                    </div>
                    <div className="userInputFrame">
                        <input
                            type="password"
                            className="UserInput"
                            name="newPw"
                            value={newPw}
                            onChange={handlePasswordChange}
                            placeholder="새 비밀번호를 입력해주세요"
                        />
                    </div>

                    <div className="infoTextFrame">
                        <span className="userinfoText">새 비밀번호 확인</span>
                    </div>
                    <div className="userInputFrame">
                        <input
                            type="password"
                            className="UserInput"
                            name="confirmNewPw"
                            value={confirmPw}
                            onChange={e => setConfirmPw(e.target.value)}
                            placeholder="새 비밀번호를 다시 입력해주세요"
                            onFocus={() => setPasswordConfirmFocused(true)}
                            onBlur={() => setPasswordConfirmFocused(false)}
                        />
                    </div>
                </>
            )}

            {/* 결과 메시지를 위한 고정된 공간 */}
            <div className="result-message-container">
                {result && (
                    <span style={{ color: result.color, fontSize: '14px', fontWeight: '500' }}>
                        {result.text}
                    </span>
                )}
                {!passwordValid && (
                    <span style={{ color: 'red' }}>비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.(@$!%*#?&)</span>
                )}
                {passwordConfirmFocused && newPw !== confirmPw && (
                    <span style={{ color: "red" }}>비밀번호가 일치하지 않습니다.</span>
                )}
            </div>

            <div className="button-container">
                {step === 1 ? (
                    <button
                        type="button"
                        className="CheckOfId"
                        onClick={handleCheckUser}
                    >
                        사용자 확인
                    </button>
                ) : (
                    <button
                        type="button"
                        className="CheckOfId"
                        onClick={handlePwChange}
                    >
                        비밀번호 변경
                    </button>
                )}
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

export default FindPwModal;