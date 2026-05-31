/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Clock, ShieldAlert, Check, X, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { TOEICWord, Rank } from '../types';
import { RANK_INFOS } from '../data/words';
import { motion, AnimatePresence } from 'motion/react';

interface QuizConsoleProps {
  currentRank: Rank;
  heartCount: number;
  registeredWords: TOEICWord[];
  onAddXP: (xp: number) => void;
  onDeductHeart: () => void;
  onAddIncorrectWord: (wordId: number) => void;
  onNavigate: (tab: 'office' | 'words' | 'quiz' | 'reflection' | 'ceo' | 'exam') => void;
  onResetHearts: () => void;
}

interface Question {
  wordObj: TOEICWord;
  options: string[];
  correctIdx: number;
}

export default function QuizConsole({
  currentRank,
  heartCount,
  registeredWords,
  onAddXP,
  onDeductHeart,
  onAddIncorrectWord,
  onNavigate,
  onResetHearts
}: QuizConsoleProps) {
  const [selectedRank, setSelectedRank] = useState<Rank>(currentRank);
  const [selectedStage, setSelectedStage] = useState<number | 'all'>('all');

  // Synchronize on promotion
  useEffect(() => {
    setSelectedRank(currentRank);
    setSelectedStage('all');
  }, [currentRank]);

  // Dynamically calculate eligibleWords based on chosen Quiz Rank & Stage
  const eligibleWords = React.useMemo(() => {
    if (selectedStage === 'all') {
      return registeredWords.filter(w => {
        const rankOrder: Rank[] = ['인턴', '사원', '대리', '과장', 'CEO'];
        const currentOrderIdx = rankOrder.indexOf(currentRank);
        const wordOrderIdx = rankOrder.indexOf(w.rank_level);
        return wordOrderIdx <= currentOrderIdx;
      });
    } else {
      const rankCoreWords = registeredWords.filter(w => w.rank_level === selectedRank && w.id <= 1000);
      const startIdx = (Number(selectedStage) - 1) * 20;
      return rankCoreWords.slice(startIdx, startIdx + 20);
    }
  }, [registeredWords, selectedRank, selectedStage, currentRank]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback' | 'finished' | 'outofhearts'>('intro');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question
  const [timerActive, setTimerActive] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Sound triggers
  const playSoundEffect = (type: 'correct' | 'wrong' | 'timeout') => {
    // If we want simulated Web Audio, we can synthesize quick sounds
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(147, ctx.currentTime + 0.15); // D3
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'timeout') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
    } catch (e) {
      // AudioContext is not supported/blocked in iframe initially, ignore
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Procedural 4-choice questions selection
  const generateQuizSet = () => {
    if (eligibleWords.length < 4) {
      alert("공부한 기안서(단어) 수가 부족합니다! 먼저 [업무 보고]에서 몇 개의 기안서를 더 마스터해보세요.");
      return;
    }

    // Pick 5 random words for questions
    const shuffled = [...eligibleWords].sort(() => 0.5 - Math.random());
    const batch = shuffled.slice(0, Math.min(5, shuffled.length));

    const generated: Question[] = batch.map(targetWord => {
      // Pick 3 wrong options from other words
      const incorrectPool = eligibleWords.filter(w => w.word !== targetWord.word);
      const shuffledIncorrect = incorrectPool.sort(() => 0.5 - Math.random());
      
      const wrongMeanings = shuffledIncorrect.slice(0, 3).map(w => w.meaning);
      const options = [targetWord.meaning, ...wrongMeanings];
      
      // Shuffle choices
      const shuffledOptions = options.sort(() => 0.5 - Math.random());
      const correctIdx = shuffledOptions.indexOf(targetWord.meaning);

      return {
        wordObj: targetWord,
        options: shuffledOptions,
        correctIdx
      };
    });

    setQuestions(generated);
    setCurrentQIndex(0);
    setGameState('playing');
    setCorrectAnswersCount(0);
    setXpGained(0);
    startQuestion(0);
  };

  const startQuestion = (qIndex: number) => {
    setSelectedIdx(null);
    setTimeLeft(10);
    setTimerActive(true);
  };

  // Timer Tick implementation
  useEffect(() => {
    if (timerActive && gameState === 'playing') {
      timerRef.current = setTimeout(() => {
        if (timeLeft > 0) {
          setTimeLeft(prev => prev - 1);
        } else {
          // TIME TIMEOUT
          setTimerActive(false);
          handleAnswerSelect(-1); // treating -1 as a timeout
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive, gameState]);

  // Handle Answer Selection
  const handleAnswerSelect = (index: number) => {
    if (selectedIdx !== null) return; // ignore multiple clicks
    setTimerActive(false);
    setSelectedIdx(index);
    setGameState('feedback');

    const currentQ = questions[currentQIndex];
    if (index === currentQ.correctIdx) {
      // CORRECT ANSWER
      playSoundEffect('correct');
      setXpGained(prev => prev + 50);
      setCorrectAnswersCount(prev => prev + 1);
      onAddXP(50); // add to parent profile state
    } else {
      // WRONG ANSWER OR TIMEOUT
      if (index === -1) {
        playSoundEffect('timeout');
      } else {
        playSoundEffect('wrong');
      }
      onDeductHeart(); // deduct heart in parent profile
      onAddIncorrectWord(currentQ.wordObj.id); // add to Reflection Notebook
    }

    // Go to next question after 1.8 seconds delay so they can see the stamp and feedback
    setTimeout(() => {
      // Check if hearts are depleted
      // Need direct check of depleted state
      if (heartCount <= 1 && index !== currentQ.correctIdx) {
        setGameState('outofhearts');
      } else if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setGameState('playing');
        startQuestion(currentQIndex + 1);
      } else {
        setGameState('finished');
      }
    }, 1800);
  };

  const handleSelfReflectionSubmit = () => {
    // Write simulated apology letter, recharge hearts and return
    onResetHearts();
    setGameState('intro');
  };

  return (
    <div className="space-y-4">
      {/* Game view controller */}
      {gameState === 'intro' && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md text-slate-800 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-3xl border border-blue-100">
            📑
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] bg-blue-50/70 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-150 tracking-wider">
              결재 서류 심사 기안
            </span>
            <h3 className="font-extrabold text-base text-slate-900 mt-2">일일 단어 결재 처리 시뮬레이션</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              영어 단어를 보고 알맞은 결재(뜻)를 선택하세요. 한 문제당 <strong className="text-blue-600 font-bold">10초 제한</strong>이 적용됩니다.
              승인 시 <strong className="text-blue-600 font-bold">+50 XP</strong>를 획득하고, 반려 시(오답/시간초과) 하트 전고 카드가 까입니다!
            </p>
          </div>

          {/* Quiz Scope Settings */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3.5">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
              ⚙️ 퀴즈 범위 설정 (Scope Settings)
            </h4>

            {/* Mode selection: All unlocked vs Specific Stage */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedStage('all')}
                className={`py-2 px-3 text-[11px] font-bold rounded-lg transition text-center cursor-pointer ${
                  selectedStage === 'all'
                    ? 'bg-blue-600 text-white shadow shadow-blue-100'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                전체 직급 랜덤
              </button>
              <button
                type="button"
                onClick={() => setSelectedStage(1)}
                className={`py-2 px-3 text-[11px] font-bold rounded-lg transition text-center cursor-pointer ${
                  selectedStage !== 'all'
                    ? 'bg-blue-600 text-white shadow shadow-blue-105'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                지정 단계 집중
              </button>
            </div>

            {selectedStage !== 'all' && (
              <div className="space-y-3">
                {/* Chosen Rank */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block">직급 부서</span>
                  <div className="grid grid-cols-5 gap-1">
                    {(['인턴', '사원', '대리', '과장', 'CEO'] as Rank[]).map((rk) => {
                      const rankOrder = ['인턴', '사원', '대리', '과장', 'CEO'];
                      const currentIdx = rankOrder.indexOf(currentRank);
                      const thisIdx = rankOrder.indexOf(rk);
                      const isLocked = thisIdx > currentIdx;

                      return (
                        <button
                          key={rk}
                          disabled={isLocked}
                          onClick={() => setSelectedRank(rk)}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            selectedRank === rk
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{isLocked ? '🔒' : RANK_INFOS[rk]?.avatar}</span>
                          <span>{rk}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chose Stage Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold">학습 단계 ({selectedStage}단계)</span>
                    <span className="font-mono text-[9px] text-blue-600 font-bold">20단어</span>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-hide">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((stageNum) => (
                      <button
                        key={stageNum}
                        onClick={() => setSelectedStage(stageNum)}
                        className={`py-1.5 px-3 rounded-md border text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                          selectedStage === stageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {stageNum}단계
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Questions count info indicator */}
            <div className="text-[10px] text-slate-400 bg-slate-100 p-2.5 rounded-xl flex justify-between items-center">
              <span>퀴즈 출제 가능 단어 수:</span>
              <span className="font-bold font-mono text-slate-700">
                {eligibleWords.length}개 단어
              </span>
            </div>
          </div>

          <button
            onClick={generateQuizSet}
            disabled={eligibleWords.length < 4}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed font-extrabold text-xs text-white py-3.5 px-6 rounded-xl transition shadow active:scale-95 cursor-pointer shadow-blue-105"
          >
            {eligibleWords.length < 4
              ? '단어가 부족하여 시험 불가능 (최소 4개 필요)'
              : '서류 결재 업무 시작 (Start Quiz)'}
          </button>
        </div>
      )}

      {/* Play state */}
      {(gameState === 'playing' || gameState === 'feedback') && questions.length > 0 && (
        <div className="space-y-4">
          {/* Header Status Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Clock size={15} className={timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-slate-400"} />
              <span className={timeLeft <= 3 ? "text-red-600 animate-pulse font-bold" : ""}>
                잔여 승인 기한: {timeLeft}s
              </span>
            </div>
            <div className="text-[10px] bg-slate-100 text-slate-500 font-semibold font-mono tracking-wider px-2 py-0.5 rounded">
              서류 처리 {currentQIndex + 1} / {questions.length}
            </div>
          </div>

          {/* Time Limit Progress Bar */}
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 3 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            ></div>
          </div>

          {/* Target Word Question Card */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md min-h-48 relative overflow-hidden flex flex-col justify-between">
            {/* Stamp display on Feedback state */}
            {gameState === 'feedback' && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/75 pointer-events-none">
                {selectedIdx === questions[currentQIndex].correctIdx ? (
                  <motion.div
                    initial={{ scale: 2, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: -10, opacity: 1 }}
                    className="border-4 border-emerald-600 text-emerald-600 font-extrabold text-2xl uppercase tracking-widest px-6 py-2 rounded-xl bg-white shadow-lg flex items-center gap-1.5"
                  >
                    <ShieldCheck size={24} />
                    <span>결재 승인</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 2, rotate: 20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 10, opacity: 1 }}
                    className="border-4 border-red-600 text-red-650 font-extrabold text-2xl uppercase tracking-widest px-6 py-2 rounded-xl bg-white shadow-lg flex items-center gap-1.5"
                  >
                    <ShieldAlert size={24} />
                    <span>결재 반려</span>
                  </motion.div>
                )}
              </div>
            )}

            <div className="text-center py-6">
              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded font-mono mb-2 inline-block">
                VOCAB MEMO
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                {questions[currentQIndex].wordObj.word}
              </h2>
            </div>

            {/* Hint phrase collocation */}
            <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-center text-[10px] text-slate-500 italic">
              짝꿍 표현: {questions[currentQIndex].wordObj.collocation}
            </div>
          </div>

          {/* Choice Selection Columns */}
          <div className="grid grid-cols-1 gap-2.5">
            {questions[currentQIndex].options.map((opt, i) => {
              // Color formatting during feedback status
              let btnClass = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50';
              if (gameState === 'feedback') {
                if (i === questions[currentQIndex].correctIdx) {
                  btnClass = 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-sm';
                } else if (i === selectedIdx) {
                  btnClass = 'bg-red-50 border-red-300 text-red-700 font-bold';
                } else {
                  btnClass = 'bg-slate-50 border-slate-100 text-slate-350 opacity-60';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswerSelect(i)}
                  disabled={gameState === 'feedback'}
                  className={`w-full p-3.5 border rounded-2xl text-left text-xs transition-colors duration-200 flex items-center justify-between cursor-pointer ${btnClass}`}
                >
                  <span className="font-semibold leading-normal">{opt}</span>
                  {gameState === 'feedback' && i === questions[currentQIndex].correctIdx && (
                    <Check size={14} className="text-emerald-600 flex-shrink-0 ml-1.5" />
                  )}
                  {gameState === 'feedback' && i === selectedIdx && i !== questions[currentQIndex].correctIdx && (
                    <X size={14} className="text-red-600 flex-shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gameplay Finish Screen */}
      {gameState === 'finished' && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mx-auto text-white text-3xl shadow-md">
            🏆
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-100">
              서류 처리 보고서 정산 완결
            </span>
            <h3 className="font-extrabold text-base text-slate-900 mt-1">오늘의 결재를 성공적으로 처리했습니다!</h3>
            <p className="text-xs text-slate-400">
              상급자에게 모범이 될 만한 서류 처리력이었습니다. 누적 역량이 상승했습니다.
            </p>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl max-w-xs mx-auto border border-slate-150">
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-mono font-bold">가산 경험치</p>
              <p className="text-lg font-black text-blue-600 font-mono">+{xpGained} XP</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-mono font-bold">승인 성공 건수</p>
              <p className="text-lg font-black text-emerald-600 font-mono">{correctAnswersCount} / 5</p>
            </div>
          </div>

          <div className="flex gap-2 text-center max-w-sm mx-auto">
            <button
              onClick={() => onNavigate('office')}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition cursor-pointer"
            >
              집무실로 복귀
            </button>
            <button
              onClick={generateQuizSet}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition cursor-pointer shadow-sm shadow-blue-100"
            >
              한 번 더 결재하기
            </button>
          </div>
        </div>
      )}

      {/* Layoff / Depleted Hearts Panel (Self-Reflection letter creation) */}
      {gameState === 'outofhearts' && (
        <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl border border-red-900 text-center space-y-5">
          <div className="w-14 h-14 bg-red-950 text-red-500 border border-red-800 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
            🚨
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] bg-red-900/60 text-red-200 border border-red-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
              Suspended Operation
            </span>
            <h3 className="font-bold text-base text-slate-100 mt-2">체력 고갈로 과실 대기발령 처분</h3>
            <p className="text-xs text-slate-450 leading-relaxed max-w-sm mx-auto">
              퀴즈 오답률 초과로 직무 카드가 일시 차단되었습니다. 사장님께 올릴 사본 '자기 반성 보고서(시말서)'를 정직하게 작성하여 제출하시면 즉각 Hearts 출근 카드가 3개로 즉시 복구됩니다!
            </p>
          </div>

          {/* Letter Draft Form */}
          <div className="max-w-xs mx-auto text-left bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-[10px] text-zinc-350">
            <p className="text-[9px] text-zinc-500 border-b border-zinc-850 pb-1 uppercase font-bold">수신: 정광민 사장 / 인사과</p>
            <p>본인은 토익상사의 임직원으로서 부여받은 토익 필수 영단어 결재 업무 중, 상부 지침과 짝꿍 표현 숙지 상태의 부실로 다음과 같이 업무 과실을 일으켰습니다.</p>
            <ul className="list-disc pl-4 text-rose-450">
              <li>제한 시간 내 정답 미제출</li>
              <li>타동사의 명사와 전치사 오인 결재</li>
            </ul>
            <p>이에 깊이 반성하며, 에빙하우스 망각 주기에 부응하여 향후 짝꿍 표현과 비즈니스 이메일 예문을 완벽히 통암기할 것을 서약합니다.</p>
          </div>

          <button
            onClick={handleSelfReflectionSubmit}
            className="w-full bg-red-600 hover:bg-red-500 cursor-pointer text-white font-extrabold text-xs py-3 px-6 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-red-950"
          >
            <span>시말서 제출하여 Hearts 충전 및 복직</span>
          </button>
        </div>
      )}
    </div>
  );
}
