
import './LegalDocs.css';

// QR 이미지 파일은 /public/coffee 폴더에 배치 (예: qr_dev1.png ... qr_dev5.png)
// account 필드는 계좌번호 또는 후원 URL 로 교체
const MEMBERS = [
	{ id: 'dev1', name: '이건호', role: '팀장', msg: '블록 게임 / 관리자 페이지', account: '토스뱅크 1000-1111-2222', qr: '/coffee/qr_dev1.png' },
	{ id: 'dev2', name: '이창연', role: '팀원', msg: '랭킹 / 스피드 퀴즈', account: '카카오 3333-44-55555', qr: '/coffee/qr_dev2.png' },
	{ id: 'dev3', name: '이정민', role: '팀원', msg: '로그인 / 회원가입 / 카드 퀴즈', account: '국민 666601-01-777777', qr: '/coffee/jung.jpg' },
	{ id: 'dev4', name: '박용희', role: '팀원', msg: '메인 페이지 UI / OX 퀴즈', account: '토스뱅크 1000-3523-4427', qr: '/coffee/dyd.png' },
	{ id: 'dev5', name: '김기범', role: '팀원', msg: '메인 페이지 / 마이페이지', account: '우리 1010-2020-3030', qr: '/coffee/gibum.png' },
];

const Coffee = () => {

	return (
		<div className="coffee-wrap" aria-labelledby="coffeeTitle">
			<header className="coffee-head">
				<h1 id="coffeeTitle">개발자에게 커피 쏘기 <b style={{color:'white'}}>☕</b></h1>
				<p className="sub">작은 후원이 서비스 유지와 기능 개선에 큰 힘이 됩니다. 고맙습니다!</p>
			</header>

			<div className="coffee-grid">
				{MEMBERS.map(m => (
					<article key={m.id} className="coffee-card" aria-label={`${m.name} 후원 정보`}>
						<div className="info">
							<div className="name-role">
								<span className="name">{m.name}</span>
								<span className="role">{m.role}</span>
							</div>
							<p className="msg">{m.msg}</p>
						</div>
						<div className="qr-box">
							<img src={m.qr} alt={`${m.name} 후원 QR`} loading="lazy" />
						</div>
					</article>
				))}
			</div>

			<section className="coffee-note" aria-labelledby="coffeeNoticeTitle">
				<h2 id="coffeeNoticeTitle">안내</h2>
				<ul>
					<li>후원은 즉시 처리되며 환불이 제한될 수 있습니다.</li>
					<li>도용/부정 결제 징후 발견 시 관련 정책에 따라 조치됩니다.</li>
					<li>계좌 또는 QR 이미지는 팀 사정에 따라 변경될 수 있습니다.</li>
				</ul>
			</section>
		</div>
	);
};

export default Coffee;
