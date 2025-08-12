package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.BlankQuizDto;
import boot.infopass.dto.BlankSubmissionDto;
import boot.infopass.dto.BlankUserStatusDto;

@Mapper
public interface BlankQuizMapper {

    List<BlankQuizDto> selectQuizList();

    int insertSubmission(BlankSubmissionDto submission);

    int insertWrongAnswer(BlankSubmissionDto submission);

    int insertUserStatus(BlankUserStatusDto userStatus);
}
