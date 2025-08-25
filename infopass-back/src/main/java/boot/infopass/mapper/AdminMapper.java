package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.infopass.dto.UserDto;

@Mapper
public interface AdminMapper {
    
    // ==================== 사용자 CRUD ====================
    
    /**
     * 모든 사용자 조회 (관리자용)
     */
    List<UserDto> getAllUsers();
    
    /**
     * ID로 사용자 조회 (관리자용)
     */
    UserDto getUserById(Integer id);
    
    /**
     * 사용자 정보 수정 (관리자용)
     */
    int updateUser(UserDto userDto);
    
    /**
     * 새 사용자 추가 (관리자용)
     */
    int insertUser(UserDto userDto);
    
    /**
     * 사용자 삭제 (비활성화) (관리자용)
     */
    int deleteUser(Integer id);
    
    /**
     * 사용자 상태 변경 (관리자용)
     */
    int updateUserStatus(@Param("id") Integer id, @Param("enabled") Integer enabled);
    
    // ==================== 통계 및 관리 ====================
    
    /**
     * 전체 사용자 수
     */
    int getTotalUserCount();
    
    /**
     * 활성 사용자 수
     */
    int getActiveUserCount();
    
    /**
     * 관리자 사용자 수
     */
    int getAdminUserCount();
    
    /**
     * 오늘 가입한 사용자 수
     */
    int getNewUsersToday();
    
    /**
     * 사용자 검색 (관리자용)
     */
    List<UserDto> searchUsers(@Param("keyword") String keyword);
    
    /**
     * 사용자 권한별 조회 (관리자용)
     */
    List<UserDto> getUsersByType(@Param("usertype") String usertype);
    
    /**
     * 비활성 사용자 조회 (관리자용)
     */
    List<UserDto> getInactiveUsers();
}
