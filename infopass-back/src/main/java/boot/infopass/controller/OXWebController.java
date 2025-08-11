package boot.infopass.controller;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import boot.infopass.mapper.LobbyMapper;

@Controller
public class OXWebController {

	@Autowired
	private LobbyMapper lobby;
	
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

    static class Room {
        public int id;
        public String title;
        public int max;
        public String hostId;
        public String hostNick;
        public List<Player> players = new ArrayList<>();
        public int current() { return players.size(); }
    }

    static class GenericMsg {
        private String type;
        private String title;
        private int max;
        private String hostId;
        private String hostNick;
        private String userId;
        private String nickname;
        private int roomId;
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public int getMax() { return max; }
        public void setMax(int max) { this.max = max; }
        public String getHostId() { return hostId; }
        public void setHostId(String hostId) { this.hostId = hostId; }
        public String getHostNick() { return hostNick; }
        public void setHostNick(String hostNick) { this.hostNick = hostNick; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getNickname() { return nickname; }
        public void setNickname(String nickname) { this.nickname = nickname; }
        public int getRoomId() { return roomId; }
        public void setRoomId(int roomId) { this.roomId = roomId; }
    }

    private AtomicInteger seq = new AtomicInteger(1000);
    private Map<Integer, Room> rooms = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate template;

    public OXWebController(SimpMessagingTemplate template) {
        this.template = template;
    }

    @MessageMapping("/ox/rooms")
    public void rooms(GenericMsg msg) {
        broadcastRooms();
    }

    @MessageMapping("/ox/room.create")
    public void create(GenericMsg msg) {
        Room r = new Room();
        r.id = seq.getAndIncrement();
        r.title = msg.getTitle();
        r.max = msg.getMax();
        r.hostId = msg.getHostId();
        r.hostNick = msg.getHostNick();
        Player p = new Player(msg.getHostId(), msg.getHostNick(), true);
        r.players.add(p);
        rooms.put(r.id, r);

        // 전체 목록 & 방 상태 브로드캐스트
        broadcastRooms();
        broadcastRoom(r.id);

        // 방장에게 즉시 입장 트리거 (모두 수신 후 필터)
        template.convertAndSend("/topic/ox/created",
                Map.of("type","created","roomId", r.id, "hostId", r.hostId));
    }

    @MessageMapping("/ox/room.join")
    public void join(GenericMsg msg) {
        Room r = rooms.get(msg.getRoomId());
        if (r != null) {
            boolean alreadyIn = r.players.stream()
                .anyMatch(p -> p.userId.equals(msg.getUserId()));
            if (!alreadyIn && r.current() < r.max) {
                Player p = new Player(msg.getUserId(), msg.getNickname(), false);
                r.players.add(p);
                // host flag 유지
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
            	System.out.println("안녕: " + r.id);
                lobby.DeleteOXLobby(r.id);
                rooms.remove(r.id);
                broadcastRooms();
                return;
            }
            // 방장 위임
            if (r.hostId.equals(msg.getUserId())) {
                Player newHost = r.players.get(0);
                r.hostId = newHost.userId;
                r.hostNick = newHost.nickname;
                r.players.forEach(p -> p.host = p.userId.equals(r.hostId));
            }
            broadcastRoom(r.id);
            broadcastRooms();
        }
    }

    @MessageMapping("/ox/room.start")
    public void start(GenericMsg msg) {
        Room r = rooms.get(msg.getRoomId());
        if (r != null && r.hostId.equals(msg.getUserId())) {
            // 정원 다 찼을 때만 시작 허용 (프론트도 동일 검증)
            if (r.current() == r.max) {
                template.convertAndSend("/topic/ox/room." + r.id,
                        Map.of("type", "start", "roomId", r.id));
            }
        }
    }

    @MessageMapping("/ox/room.info")
    public void info(GenericMsg msg) {
        broadcastRoom(msg.getRoomId());
    }

    private void broadcastRooms() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Room r : rooms.values()) {
            list.add(Map.of(
                "id", r.id,
                "title", r.title,
                "hostId", r.hostId,
                "hostNick", r.hostNick,
                "max", r.max,
                "current", r.current()
            ));
        }
        template.convertAndSend("/topic/ox/lobby", Map.of("type", "rooms", "rooms", list));
    }

    private void broadcastRoom(int roomId) {
        Room r = rooms.get(roomId);
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
                           "hostId", r.hostId,
                           "hostNick", r.hostNick,
                           "max", r.max
                       ),
                       "players", ps));
        }
    }
}