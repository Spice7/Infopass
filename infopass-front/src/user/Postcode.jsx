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
            padding: "0",
            overflow: "hidden",
            zIndex: 10001, // overlay보다 더 높은 z-index 설정
        },
    };

    return(
        <div>
            <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}>
                <DaumPostcode onComplete={completeHandler} height="100%" />
                {/* 모달 내부에 닫기 버튼 추가 */}
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1001, background: 'none', border: 'none', fontSize: '1.2em',
                cursor: 'pointer' }}>X</button>
          </Modal>
        </div>
    );
}

export default Postcode;