import React, { useContext } from 'react';
import { LoginContext } from '../../user/LoginContextProvider';
import BlockLoading from './loading/BlockLoading';
import { useBlockGame } from './hooks/useBlockGame';
import BlockHeader from './components/BlockHeader';
import QuestionSection from './components/QuestionSection';
import Workspace from './components/Workspace';
import ActionSection from './components/ActionSection';
import { CompletionMessage, CorrectMessage, IncorrectMessage } from './components/ResultMessages';

const BlockMain = () => {
  const { userInfo } = useContext(LoginContext);
  const {
    blocklyDivRef,
    workspaceRef,
    currentQuestion,
    isLoading,
    error,
    solvedQuestions,
    isCorrect,
    showNextButton,
    showCompletionMessage,
    toolbox,
    checkAnswer,
    generateXml,
    generateJavaCode,
    goToNextQuestion,
    resetGame,
    resetBlocks,
  } = useBlockGame(userInfo);

  if (isLoading) return <BlockLoading />;

  if (!userInfo) {
    return (
      <div className="error">
        <p>로그인이 필요합니다.</p>
        <p>로그인 후 다시 시도해주세요.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={resetGame}>다시 시도</button>
      </div>
    );
  }

  if (showCompletionMessage) {
    return <CompletionMessage onReset={resetGame} />;
  }

  return (
    <div className="block-main">
      <BlockHeader onReset={resetGame} />
      <QuestionSection question={currentQuestion} solvedCount={solvedQuestions.size} />
      <Workspace
        blocklyDivRef={blocklyDivRef}
        workspaceRef={workspaceRef}
        toolbox={toolbox}
        questionBlocks={currentQuestion?.question_blocks}
      />
      <ActionSection
        showNextButton={showNextButton}
        checkAnswer={checkAnswer}
        generateXml={generateXml}
        generateJavaCode={generateJavaCode}
        resetBlocks={resetBlocks}
        goToNextQuestion={goToNextQuestion}
        disabled={!currentQuestion}
      />
      {isCorrect && <CorrectMessage />}
      {!isCorrect && currentQuestion && isCorrect !== null && <IncorrectMessage />}
    </div>
  );
};

export default BlockMain;