package boot.infopass.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import boot.infopass.dto.AdminUserStatsDto;
import boot.infopass.dto.UserDto;
import boot.infopass.mapper.AdminMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AdminService {
    
    @Autowired
    private AdminMapper adminMapper;
    
    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;
    
    /**
     * 모든 사용자 조회 (관리자용)
     */
    public List<UserDto> getAllUsers() {
        try {
            List<UserDto> users = adminMapper.getAllUsers();
            log.info("관리자가 사용자 목록을 조회했습니다. 총 {}명", users.size());
            return users;
        } catch (Exception e) {
            log.error("사용자 목록 조회 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("사용자 목록을 불러올 수 없습니다.", e);
        }
    }
    
    /**
     * 특정 사용자 조회 (관리자용)
     */
    public UserDto getUserById(Integer id) {
        try {
            UserDto user = adminMapper.getUserById(id);
            if (user != null) {
                log.info("관리자가 사용자 정보를 조회했습니다. ID: {}", id);
                // 비밀번호 필드는 null로 설정 (보안)
                user.setPassword(null);
            }
            return user;
        } catch (Exception e) {
            log.error("사용자 조회 중 오류 발생. ID: {}, 오류: {}", id, e.getMessage());
            throw new RuntimeException("사용자 정보를 불러올 수 없습니다.", e);
        }
    }
    
    /**
     * 사용자 정보 수정 (관리자용)
     */
    public UserDto updateUser(Integer id, UserDto userDto) {
        try {
            userDto.setId(id);
            
            // 관리자는 비밀번호를 수정할 수 없음 (보안상 이유)
            userDto.setPassword(null);
            
            int result = adminMapper.updateUser(userDto);
            if (result > 0) {
                log.info("관리자가 사용자 정보를 수정했습니다. ID: {}, 이름: {}", id, userDto.getName());
                return getUserById(id);
            } else {
                throw new RuntimeException("사용자 정보 수정에 실패했습니다.");
            }
        } catch (Exception e) {
            log.error("사용자 수정 중 오류 발생. ID: {}, 오류: {}", id, e.getMessage());
            throw new RuntimeException("사용자 정보를 수정할 수 없습니다.", e);
        }
    }
    
    /**
     * 새 사용자 추가 (관리자용)
     */
    public UserDto createUser(UserDto userDto) {
        try {
            // 비밀번호 암호화
            if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
                String encodedPassword = bCryptPasswordEncoder.encode(userDto.getPassword());
                userDto.setPassword(encodedPassword);
            } else {
                throw new IllegalArgumentException("비밀번호는 필수입니다.");
            }
            
            // 기본값 설정
            if (userDto.getUsertype() == null) {
                userDto.setUsertype("USER");
            }
            if (userDto.getEnabled() == null) {
                userDto.setEnabled(1);
            }
            if (userDto.getExp() == null) {
                userDto.setExp(0);
            }
            if (userDto.getLevel() == null) {
                userDto.setLevel(1);
            }
            
            int result = adminMapper.insertUser(userDto);
            if (result > 0) {
                log.info("관리자가 새 사용자를 추가했습니다. 이메일: {}, 이름: {}", 
                        userDto.getEmail(), userDto.getName());
                
                // 생성된 사용자 정보 반환 (비밀번호 제외)
                UserDto createdUser = getUserById(userDto.getId());
                return createdUser;
            } else {
                throw new RuntimeException("사용자 추가에 실패했습니다.");
            }
        } catch (Exception e) {
            log.error("사용자 추가 중 오류 발생. 이메일: {}, 오류: {}", userDto.getEmail(), e.getMessage());
            throw new RuntimeException("새 사용자를 추가할 수 없습니다.", e);
        }
    }
    
    /**
     * 사용자 삭제 (실제로는 비활성화) (관리자용)
     */
    public boolean deleteUser(Integer id) {
        try {
            // 삭제 전 사용자 정보 조회 (로그용)
            UserDto user = getUserById(id);
            if (user == null) {
                log.warn("삭제하려는 사용자가 존재하지 않습니다. ID: {}", id);
                return false;
            }
            
            // 관리자 자신을 삭제하려는 경우 방지
            if ("ADMIN".equals(user.getUsertype())) {
                log.warn("관리자 계정은 삭제할 수 없습니다. ID: {}", id);
                throw new IllegalArgumentException("관리자 계정은 삭제할 수 없습니다.");
            }
            
            int result = adminMapper.deleteUser(id);
            if (result > 0) {
                log.info("관리자가 사용자를 비활성화했습니다. ID: {}, 이름: {}", id, user.getName());
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            log.error("사용자 삭제 중 오류 발생. ID: {}, 오류: {}", id, e.getMessage());
            throw new RuntimeException("사용자를 삭제할 수 없습니다.", e);
        }
    }
    
    /**
     * 사용자 계정 활성화/비활성화 (관리자용)
     */
    public boolean toggleUserStatus(Integer id) {
        try {
            UserDto user = getUserById(id);
            if (user == null) {
                return false;
            }
            
            // 현재 상태의 반대로 변경
            int newStatus = user.getEnabled() == 1 ? 0 : 1;
            int result = adminMapper.updateUserStatus(id, newStatus);
            
            if (result > 0) {
                log.info("관리자가 사용자 상태를 변경했습니다. ID: {}, 새 상태: {}", 
                        id, newStatus == 1 ? "활성" : "비활성");
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            log.error("사용자 상태 변경 중 오류 발생. ID: {}, 오류: {}", id, e.getMessage());
            throw new RuntimeException("사용자 상태를 변경할 수 없습니다.", e);
        }
    }
    
    /**
     * 사용자 통계 조회 (관리자용)
     */
    public AdminUserStatsDto getUserStats() {
        try {
            AdminUserStatsDto stats = new AdminUserStatsDto();
            stats.setTotalUsers(adminMapper.getTotalUserCount());
            stats.setActiveUsers(adminMapper.getActiveUserCount());
            stats.setAdminUsers(adminMapper.getAdminUserCount());
            stats.setNewUsersToday(adminMapper.getNewUsersToday());
            
            log.info("관리자가 사용자 통계를 조회했습니다.");
            return stats;
        } catch (Exception e) {
            log.error("사용자 통계 조회 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("사용자 통계를 불러올 수 없습니다.", e);
        }
    }
}
