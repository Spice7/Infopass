# Infopass
<img width="2540" height="1190" alt="image" src="https://github.com/user-attachments/assets/1a4de878-29d0-470e-95f7-5eb4472cd47d" />


# 쇼핑몰 프로젝트
쌍용아카데미 제4강의장 1조

## 목차
1. 개요
2. 팀소개
3. 기술 스택
4. ERD
5. 주요기능
6. 프로젝트 시연
7. 후기

# 1. 개요
**[게임 기반 학습 플랫폼 개발 프로젝트 개요]**

정보처리기사 수험생들을 위한 새로운 학습 경험을 제공합니다. 퀴즈와 게임을 접목한 학습은 수험생의 흥미와 학습 지속성을 강화합니다. 멀티플레이 기능을 통해 다른 수험생들과 경쟁하고 협력하며 학습 시너지를 높일 수 있습니다. 또한, 오답 노트나 진도율 관리 등 다양한 부가 서비스를 제공하여 개인 맞춤형 학습을 지원합니다. 이처럼 효율성과 재미를 동시에 잡은 학습 경험으로 수험생들의 합격을 돕습니다.


**주요 기능:**

+ 메인페이지 (현대적이고 유저친화적인 UI) 
+ 회원가입 및 로그인 (관리자, 일반 사용자)
+ 게임 싱글플레이 / 멀티플레이(로비)
+ 게임 상세 페이지 ( 게임 소개, 게임플레이 영상)
+ 게임 오답 페이지 ( 틀린 문제 해설 )
+ 마이페이지(게임 기록 조회페이지, 오답노트 페이지, 문의 페이지)
+ 관리자 페이지 ( 통계, 문의 및 게임관리)
+ 유저 랭킹 페이지( 사용자 순위 통계 처리 )


# 2. 팀소개
+ **팀장**  박용희 @dydgml428
+ **팀원**  손현정 @yjyj0234
+ **팀원**  현승윤 @hyeonsy99
+ **팀원**  이창연 @changyeonyes
+ **팀원**  원주희 @juxxi054
  
## 2.1 역할 분담
### **이건호**
+ 관리자페이지
+ 블록게임 
+ 데이터베이스/서버 관리 및 구축
+ 프로젝트 배포

  
### **박용희**
+ 프로젝트 UI 담당
+ 메인페이지
+ 게임 상세페이지 
+ OX퀴즈게임
  
### **이정민**
+ 로그인/회원가입 페이지
+ 카드게임 

### **김기범**
+ 관리자 페이지
  
### **이창연**
+ 실시간/주간 랭킹 페이지
+ 스피트 퀴즈 싱글/멀티플레이 페이지

# 3. 기술 스택
SPRING BOOT, SPRING SECURITY, JWT, NGNIX, AWS EC2, DOCKER, REDIS, MYSQL, MYBATIS, STOMP, REACT, AXIOS, MATERIAL UI
  
# 4. ERD
<img width="2254" height="1612" alt="image" src="https://github.com/user-attachments/assets/192a5764-7139-4757-8c70-3e60b8740ecb" />


# 5. 시스템 아키텍쳐
<img width="2160" height="1136" alt="image" src="https://github.com/user-attachments/assets/e761d27b-3db4-4407-83d9-44c01c1a7559" />




# 5. 주요기능
## - 5.1 메인 페이지
<img width="2540" height="1190" alt="image" src="https://github.com/user-attachments/assets/18e8f324-53a0-43d4-a45b-0c0ed2ae1f70" />


<br>

## - 5.2 관리자 상품 등록/관리 (카테고리별)
|<img width="841" alt="스크린샷 2025-06-16 오후 5 13 49" src="https://github.com/user-attachments/assets/6afb2c30-ca49-489d-ae7a-abebf53f0556" />|
|-|
|상품 수정 페이지|

|<img width="769" alt="스크린샷 2025-06-16 오후 5 13 38" src="https://github.com/user-attachments/assets/16db363c-cd2f-4d0e-beef-31781a5a59f9" />|
|-|
|상품 관리 페이지|

### 관리자 페이지 주요 기술 포인트
#### aws s3 연결
이미지파일을 aws s3에 올리고 db에는 aws s3 url을 연결하였습니다.
처음에는 DB에 BLOB(Binary Large Object)형식으로 이미지파일을 업로드 했었는데, 이미지 파일이 많아지면 
DB가 올려져 있는 aws의 비용문제와 서버 과부하로 인한 속도 저하가 일어나기 때문에 aws s3를 도입하게 되었습니다.
해당 방식을 통해 비용을 감소시키고 속도를 향상시켰습니다
<br>
<br>
#### 유연하고 확장가능한 상품 db 설계
![image](https://github.com/user-attachments/assets/2c91e49d-13ad-4a1a-894e-91959b6f4498)

한 상품에 여러 색깔과 각 색깔에 대한 사이즈, 수량이 다르기 때문에 한 상품의 여러 색깔,사이즈,수량을 상품 옵션이라는 테이블로 만들었습니다.
해당 방식을 통해 product 테이블과 product_option 테이블을 1:N 관계로 분리하여 설계 및 구현하였습니다.
중복 데이터를 최소화하고 데이터 일관성 및 커리 효율성을 높였습니다.



<br>

     
## - 5.7 상세 페이지 

### 상세페이지 기술 설명

|<img width="2574" height="1256" alt="image" src="https://github.com/user-attachments/assets/a9f9d441-7f6e-426e-96e0-97ee4e91ab42" />
|-|
|유저 랭킹 주간/실시간 페이지|

![스크린샷 2025-06-13 155159](https://github.com/user-attachments/assets/46657762-8372-4aaf-9320-5571c0e01f81)
|-|
|상품 관리 페이지 문의 및 리뷰 구현|
<br>

■ 복합 인터페이스 & SPA급 UX <br>
모달, 탭, 슬라이드 패널 등 → 실제 쇼핑몰에서 요구되는 다양한 UI/UX를 JSP+JS만으로 부드럽게 구현 <br>
■ 데이터 기반 동적 UI & 완전 모듈화 <br>
DAO/DTO 패턴 활용 → 상품/옵션/회원/찜/문의/리뷰 등 다양한 DB 데이터와 실시간 연동 <br>
DB 연동 및 상태 변경 → 각종 정보(상품/옵션/회원/리뷰/문의 등) 조회·삽입·수정 완비 <br>
JSP Include 구조 → 리뷰, 문의, 모달, 안내 등 각 기능별 파일 분리 유지보수와 재사용성 극대화 <br>
세션 및 상태 관리 → 로그인/비로그인 별로 찜, 장바구니, 문의작성 등 UI·기능 제어




  
# 6. 프로젝트 시연

# 7. 보완 & 개선 

# 8. 후기







