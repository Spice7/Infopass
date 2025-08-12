package boot.infopass.controller;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import boot.infopass.dto.OXQuizDto;
import boot.infopass.mapper.LobbyMapper;
import boot.infopass.mapper.OxQuizMapper;

@Controller
public class OXWebController {

    @Autowired
    private LobbyMapper lobby;
    
    @Autowired
    private OxQuizMapper quizlist;

    static class Player {
        public String userId;
        public String nickname;
        public boolean host;
        public Player() {}
        public Player(String userId, String nickname, boolean host) {
            this.userId = userId;
            this.nickname = nickname;
            this.host = host;
        }
    }

    public static class Room {
        public int id;			//DB PK
        public String title;
        public int max_players;
        public String host_user_id;
        public String hostNick;
        public String gameType = "oxquiz";
        public String mode = "MULTI";
        public String status = "WAITING";
        public List<Player> players = new ArrayList<>();
        public Map<String, Integer> selectedChars = new HashMap<>(); // 캐릭터 선택
        //동일 문제용
        public List<OXQuizDto> quizList; // [{id,question,answer}, ...]
        public Long quizStartAt; // epoch ms
        public String myselcet; //내가 선택한 답
        public String enemyselect; // 상대방이 선택한 답
        public Map<Integer, Map<String, String>> answers = new ConcurrentHashMap<>();
        public int current() { return players.size(); }
    }

    static class GenericMsg {
        private String type;
        private String title;
        private Integer max;
        private String hostId;
        private String hostNick;
        private String userId;
        private String nickname;
        private Integer roomId;
        private Integer charNo; // 추가: 선택 캐릭터 번호
        private Integer qIndex;
        private String answer;
        // Getters/Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Integer getMax() { return max; }
        public void setMax(Integer max) { this.max = max; }
        public String getHostId() { return hostId; }
        public void setHostId(String hostId) { this.hostId = hostId; }
        public String getHostNick() { return hostNick; }
        public void setHostNick(String hostNick) { this.hostNick = hostNick; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getNickname() { return nickname; }
        public void setNickname(String nickname) { this.nickname = nickname; }
        public Integer getRoomId() { return roomId; }
        public void setRoomId(Integer roomId) { this.roomId = roomId; }
        public Integer getCharNo() { return charNo; }
        public void setCharNo(Integer charNo) { this.charNo = charNo; }
        public Integer getQIndex() { return qIndex; }
        public void setQIndex(Integer qIndex) { this.qIndex = qIndex; }
        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
    }

    private Map<Integer, Room> rooms = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate template;

    public OXWebController(SimpMessagingTemplate template) {
        this.template = template;
    }
    
    @MessageMapping("/ox/rooms")
    public void rooms(GenericMsg msg) {
    	checkemptyRooms();
        broadcastRooms();
    }

    @MessageMapping("/ox/room.create")
    public void create(GenericMsg msg) {
        Room r = new Room();
        r.title = msg.getTitle();
        r.max_players = msg.getMax();
        r.host_user_id = msg.getHostId();
        r.hostNick = msg.getHostNick();

        // DB Insert -> r.id에 생성된 PK가 세팅됨
        System.out.println(r);
        lobby.CreateOXLobby(r);

        Player p = new Player(msg.getHostId(), msg.getHostNick(), true);
        r.players.add(p);
        rooms.put(r.id, r);

        broadcastRooms();
        broadcastRoom(r.id);

        template.convertAndSend("/topic/ox/created",
                Map.of("type", "created", "roomId", r.id, "hostId", r.host_user_id));
    }

    @MessageMapping("/ox/room.join")
    public void join(GenericMsg msg) {
        Room r = rooms.get(msg.getRoomId());
        if (r != null) {
            boolean alreadyIn = r.players.stream()
                .anyMatch(p -> p.userId.equals(msg.getUserId()));
            if (!alreadyIn && r.current() < r.max_players) {
                Player p = new Player(msg.getUserId(), msg.getNickname(), false);
                r.players.add(p);
            }
            broadcastRoom(r.id);
            broadcastRooms();
        }
    }

    @MessageMapping("/ox/room.leave")
    public void leave(GenericMsg msg) {
        Room r = rooms.get(msg.getRoomId());
        if (r != null) {
            r.players.removeIf(p -> p.userId.equals(msg.getUserId()));
            
            if (r.players.isEmpty()) {
                // DB 삭제
                lobby.DeleteOXLobby(r.id);
                rooms.remove(r.id);
                broadcastRooms();
                return;
            }
            // 방장 위임
            if (r.host_user_id.equals(msg.getUserId())) {
                Player newHost = r.players.get(0);
                r.host_user_id = newHost.userId;
                r.hostNick = newHost.nickname;
                r.players.forEach(p -> p.host = p.userId.equals(r.host_user_id));
                lobby.UpdateHost(r);
            }
          
            broadcastRoom(r.id);
            broadcastRooms();
        }
    }

    @MessageMapping("/ox/room.start")
    public void start(GenericMsg msg) {
        Room r = rooms.get(msg.getRoomId());
        r.status= "PLAYING";
        if (r != null && r.host_user_id.equals(msg.getUserId())) {
            if (r.current() == r.max_players) {
            	lobby.UpdateStatus(r);
                template.convertAndSend("/topic/ox/room." + r.id,
                        Map.of("type", "start", "roomId", r.id));
            }
        }
    }

    @MessageMapping("/ox/room.char")
    public void selectChar(GenericMsg msg) {
        Room r = rooms.get(msg.getRoomId());
        if (r == null) return;
        if (msg.getCharNo() == null) return;

        // 이미 다른 유저가 선택했는지 확인
        boolean takenByOther = r.selectedChars.entrySet().stream()
                .anyMatch(e -> Objects.equals(e.getValue(), msg.getCharNo())
                        && !Objects.equals(e.getKey(), msg.getUserId()));
        if (takenByOther) {
            // 거부 응답(선택 불가) - 클라이언트가 처리할 수 있게 알림
            template.convertAndSend("/topic/ox/room." + r.id,
                    Map.of("type", "charDenied", "userId", msg.getUserId(), "charNo", msg.getCharNo()));
            return;
        }

        // 내 이전 선택이 있었다면 갱신
        r.selectedChars.put(msg.getUserId(), msg.getCharNo());

        // 현황 브로드캐스트
        Set<Integer> taken = new HashSet<>(r.selectedChars.values());
        template.convertAndSend("/topic/ox/room." + r.id,
                Map.of("type", "char",
                        "roomId", r.id,
                        "taken", taken,
                        "selections", r.selectedChars));

        // 모두 선택 완료 → 동일 퀴즈 세트 생성 및 전송
        if (r.selectedChars.size() == r.current() && r.current() >= 2) {
        	ensureQuizSet(r); // 퀴즈 세트가 없으면 생성
            r.status = "PLAYING";
            try { lobby.UpdateStatus(r); } catch (Exception ignore) {}
            template.convertAndSend("/topic/ox/room." + r.id,
                    Map.of(
                        "type", "quizSet",
                        "roomId", r.id,
                        "startAt", r.quizStartAt,      // 동시 시작용 타임스탬프(ms)
                        "duration", 5,              // 초 단위(프론트 TIMER_DURATION과 동일)
                        "quizList", r.quizList         // 동일 문제 세트
                    ));
        }
    }
    
    @MessageMapping("/ox/room.answer")
    public void handleAnswer(@Payload Map<String, Object> payload) {
        // 1. 서버가 받은 원본 데이터를 그대로 출력합니다.
//        System.out.println("[RAW_PAYLOAD_RECEIVED] " + payload);

        // 2. Map에서 데이터를 직접 추출합니다.
        Integer roomId = (Integer) payload.get("roomId");
        // userId는 프론트에서 문자열로 오므로 String으로 받습니다.
        String userId = String.valueOf(payload.get("userId")); 
        Integer qIndex = (Integer) payload.get("qIndex");
        String answer = (String) payload.get("answer");

        // 3. 추출한 데이터로 로그를 다시 찍어봅니다.
//        System.out.printf("[MANUAL_PARSE] Room: %d, User: %s, Q_Index: %d, Submitted: %s%n",
//            roomId, userId, qIndex, answer);

        // 4. 기존 로직을 추출한 데이터로 수행합니다.
        Room r = rooms.get(roomId);
        if (r == null || qIndex == null || userId == null) return;

        Map<String, String> questionAnswers = r.answers.computeIfAbsent(
            qIndex, k -> new ConcurrentHashMap<>()
        );
        questionAnswers.put(userId, answer);
        System.out.println(questionAnswers);
    }

    @MessageMapping("/ox/room.reveal")
    public void revealAnswers(@Payload Map<String, Object> payload) {
        Integer roomId = (Integer) payload.get("roomId");
        Integer qIndex = (Integer) payload.get("qIndex");

        Room r = rooms.get(roomId);
        if (r == null || qIndex == null) return;
        if (r.quizList == null || qIndex >= r.quizList.size()) return;

        // 1. 해당 문제의 정답을 가져옵니다.
        String correctAnswer = r.quizList.get(qIndex).getAnswer() ==1? "O" : "X";
        System.out.println("문제의 답 : "  +correctAnswer);
        
        // 2. 해당 문제에 대해 플레이어들이 제출한 답안 목록을 가져옵니다.
        Map<String, String> questionAnswers = r.answers.getOrDefault(qIndex, new HashMap<>());
        System.out.println("플레이어들이 제출한 답안 목록 : "+ questionAnswers);
        // 3. 각 플레이어의 결과를 계산하여 담을 맵을 생성합니다.
        Map<String, Map<String, String>> results = new HashMap<>();
        for (Player p : r.players) {
            String submittedAnswer = questionAnswers.getOrDefault(p.userId, null); // 플레이어가 제출한 답
            System.out.println("플레이어가 제출한 답 : " + submittedAnswer);
            String result = (submittedAnswer != null && submittedAnswer.equals(correctAnswer)) ? "correct" : "wrong";
            
            results.put(p.userId, Map.of(
                "submitted", submittedAnswer == null ? "" : submittedAnswer, // 무엇을 제출했는지
                "result", result  // 결과가 맞았는지 틀렸는지
            ));
        }
        
        System.out.println("[REVEAL_RESULT] For Room " + roomId + ": " + results);

        // 4. 방에 있는 모든 클라이언트에게 정답과 결과 데이터를 방송(broadcast)합니다.
        template.convertAndSend("/topic/ox/room." + roomId,
            Map.of(
                "type", "reveal",
                "qIndex", qIndex,
                "correctAnswer", correctAnswer,
                "results", results,
                "QList", r.quizList,
                "hostId", r.host_user_id
            ));
    }

    private void ensureQuizSet(Room r) {
        if (r.quizList != null && !r.quizList.isEmpty() && r.quizStartAt != null) return;

        // TODO: 실제 DB에서 동일한 문제 세트를 가져오도록 변경
        // 예시용 더미(프론트와 동일 구조 {id,question,answer})
        List<OXQuizDto> list = new ArrayList<>();
        list = quizlist.GetAllQuiz();
        // 예: 10문제 샘플
        r.quizList = list;
        r.quizStartAt = System.currentTimeMillis() + 3000; // 3초 뒤 동시 시작
    }
    
    @MessageMapping("/ox/room.info")
    public void info(GenericMsg msg) {
        broadcastRoom(msg.getRoomId());
    }
    
    private void checkemptyRooms() {
    	 List<Room> dbRooms = lobby.GetAllLobbys();
    	 for(Room r : dbRooms) {
    		 Room mem = rooms.get(r.id);
    		 int memCurrent = (mem ==null ? 0 : mem.current());
    		 System.out.println(r.id + "의 인원수 : " + memCurrent);
    		 boolean isWaiting = "WAITING".equalsIgnoreCase(
                     r.status == null ? "WAITING" : r.status);
    		 
    		 if(isWaiting && memCurrent==0) {
    			 lobby.DeleteOXLobby(r.id);
    		 }
    		 
    	 }
    }
    private void broadcastRooms() {
        List<Room> dbRooms = lobby.GetAllLobbys();
        System.out.println("rooms size = " + (dbRooms == null ? "null" : dbRooms.size()));
        List<Map<String, Object>> list = new ArrayList<>();
        for (Room r : dbRooms) {
            // 메모리 상의 방(플레이어 목록 보유)
            Room mem = rooms.get(r.id);
            int current = (mem != null ? mem.current() : 0);
            String hostNick = (mem != null && mem.hostNick != null) ? mem.hostNick : (r.hostNick != null ? r.hostNick : "");
            String hostId = (mem != null && mem.host_user_id != null) ? mem.host_user_id : (r.host_user_id != null ? r.host_user_id : "");

            list.add(Map.of(
                "id", r.id,
                "title", r.title != null ? r.title : "",
                "hostId", hostId,         // 프론트 표준 키
                "host_user_id", hostId,   // 호환 키(프론트에서 둘 다 인식)
                "hostNick", hostNick,
                "max", r.max_players,
                "current", current        // 메모리 기준 인원 수
            ));
        }
        template.convertAndSend("/topic/ox/lobby",
                Map.of("type", "rooms", "rooms", list));
    }


    private void broadcastRoom(int roomId) {
        Room r = rooms.get(roomId);
        System.out.println(r);
        if (r != null) {
            List<Map<String,Object>> ps = new ArrayList<>();
            for (Player p : r.players) {
                ps.add(Map.of(
                    "userId", p.userId,
                    "nickname", p.nickname,
                    "isHost", p.host
                ));
            }
            template.convertAndSend("/topic/ox/room." + roomId,
                Map.of("type","room",
                       "room", Map.of(
                           "id", r.id,
                           "title", r.title,
                           "hostId", r.host_user_id,
                           "hostNick", r.hostNick,
                           "max", r.max_players
                       ),
                       "players", ps));
        }
    }
}
