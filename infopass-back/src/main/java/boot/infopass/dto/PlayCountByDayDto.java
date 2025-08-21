package boot.infopass.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayCountByDayDto {
	private String date; // yyyy-MM-dd
	private String gameType; // oxquiz | block | card | blank
	private int count;
}


