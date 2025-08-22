package boot.infopass.dto;

import lombok.Data;

@Data
public class AdminUserStatsDto {
    private int totalUsers;      // 전체 사용자 수
    private int activeUsers;     // 활성 사용자 수
    private int adminUsers;      // 관리자 수
    private int newUsersToday;   // 오늘 가입한 사용자 수
    
    // 추가 통계 필드들 (필요시 확장 가능)
    private int inactiveUsers;   // 비활성 사용자 수
    private double activeRate;   // 활성화율
    
    public AdminUserStatsDto() {
        // 기본 생성자
    }
    
    public AdminUserStatsDto(int totalUsers, int activeUsers, int adminUsers, int newUsersToday) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.adminUsers = adminUsers;
        this.newUsersToday = newUsersToday;
        
        // 계산된 필드
        this.inactiveUsers = totalUsers - activeUsers;
        this.activeRate = totalUsers > 0 ? (double) activeUsers / totalUsers * 100 : 0;
    }
}
