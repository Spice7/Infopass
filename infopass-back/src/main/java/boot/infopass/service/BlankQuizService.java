package boot.infopass.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.BlankQuizDto;
import boot.infopass.dto.BlankSubmissionDto;
import boot.infopass.dto.BlankUserStatusDto;
import boot.infopass.mapper.BlankQuizMapper;

@Service
public class BlankQuizService {
    @Autowired
    private BlankQuizMapper blankQuizeMapper;

    public List<BlankQuizDto> getQuizList(){
        return blankQuizeMapper.selectQuizList();
    }

    public void submitAnswer(BlankSubmissionDto submission){
        blankQuizeMapper.insertSubmission(submission);
    }

    public void recordWrongAnswer(BlankSubmissionDto submissionDto){
        blankQuizeMapper.insertWrongAnswer(submissionDto);
    }

    public void insertUserStatus(BlankUserStatusDto userStatus){
        blankQuizeMapper.insertUserStatus(userStatus);
    }

}
