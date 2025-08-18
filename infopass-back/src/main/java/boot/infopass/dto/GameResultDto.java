package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("result")
public class GameResultDto {
    private int id;
    private Integer lobbyId;
    private int userId;
    private Integer score;
    private Integer userRank;       
    private Integer userRankPoint;  
    private String gameType;        // quiz, oxquiz, block, card
    private Timestamp createdAt;
    private String resultType;      // "multi" or "single"
}
