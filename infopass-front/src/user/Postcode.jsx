import DaumPostcode from "react-daum-postcode";
import Modal from "react-modal"; // 추가


const Postcode = ({isOpen, onClose, onaddressSelect }) =>{

    // 우편번호 상태
    const completeHandler = (data) =>{
        onaddressSelect({
            zonecode: data.zonecode,
            roadAddress: data.roadAddress
        });
        onClose();
    };

    // Modal 스타일
    const customStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10000, // 충분히 높은 z-index 설정
        },
        content: {
            left: "0",
            margin: "auto",
            width: "500px",
            height: "600px",
            padding: "10px",
            overflow: "hidden",
            zIndex: 10001, // overlay보다 더 높은 z-index 설정
        },
    };

    return(
        <div>
            <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}>
                <DaumPostcode onComplete={completeHandler} height="100%" />
                {/* 모달 내부에 닫기 버튼 추가 - 위치를 더 위쪽으로 조정 */}
                <button 
                    onClick={onClose} 
                    style={{ 
                        position: 'absolute', 
                        top: '5px', 
                        right: '5px', 
                        zIndex: 10002, 
                        background: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #ddd', 
                        borderRadius: '100px',
                        width: '25px',
                        height: '25px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#333',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    ×
                </button>
          </Modal>
        </div>
    );
}

export default Postcode;