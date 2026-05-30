/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  RefreshCw, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Play, 
  ListRestart,
  Trophy
} from 'lucide-react';
import { TOEICWord, Rank } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SentenceGameProps {
  currentRank: Rank;
  registeredWords: TOEICWord[];
  onAddXP: (xp: number) => void;
}

type QuestionDirection = 'ENG_TO_KOR' | 'KOR_TO_ENG';
type GameplayType = 'BLIND_CARD' | 'QUIZ_4_CHOICE';

export default function SentenceGame({ currentRank, registeredWords, onAddXP }: SentenceGameProps) {
  // 1. Filter words unlocked by current rank
  const eligibleWords = registeredWords.filter(w => {
    const rankOrder: Rank[] = ['인턴', '사원', '대리', '과장', 'CEO'];
    const currentOrderIdx = rankOrder.indexOf(currentRank);
    const wordOrderIdx = rankOrder.indexOf(w.rank_level);
    return wordOrderIdx <= currentOrderIdx;
  });

  // Unique categories from eligible words
  const categories = ['전체', ...Array.from(new Set(eligibleWords.map(w => w.category)))];

  // Options State
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [direction, setDirection] = useState<QuestionDirection>('ENG_TO_KOR'); // English prompt vs Korean prompt
  const [gameplay, setGameplay] = useState<GameplayType>('BLIND_CARD'); // Self-reveal vs 4-choice

  // Game list tracking
  const [gameWords, setGameWords] = useState<TOEICWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Game states
  const [isBlinded, setIsBlinded] = useState(true);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number>(-1);
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [hasScoredCurrent, setHasScoredCurrent] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Visual effects
  const [correctAnim, setCorrectAnim] = useState<boolean>(false);
  const [wrongAnim, setWrongAnim] = useState<boolean>(false);
  const [xpGranted, setXpGranted] = useState<number | null>(null);

  // Initialize and filter when category/registeredWords changes
  useEffect(() => {
    let filtered = selectedCategory === '전체' 
      ? eligibleWords 
      : eligibleWords.filter(w => w.category === selectedCategory);
    
    // Shuffle the list of sentences for optimal gameplay
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setGameWords(shuffled);
    setCurrentIndex(0);
    setIsBlinded(true);
    setSelectedQuizIdx(null);
    setHasScoredCurrent(false);
    setIsCompleted(false);
  }, [selectedCategory, registeredWords, currentRank]);

  // Generate 4-choice options when active item changes or gameplay switches or direction switches
  const activeWord = gameWords[currentIndex];

  useEffect(() => {
    if (!activeWord || gameplay !== 'QUIZ_4_CHOICE') return;

    // Distractors from other words in eligibleWords
    const distractionsPool = eligibleWords.filter(w => w.id !== activeWord.id);
    
    let correctMeaning = direction === 'ENG_TO_KOR' ? activeWord.example_ko : activeWord.example_en;
    
    // Pick 3 distractors
    const distractors = distractionsPool
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => direction === 'ENG_TO_KOR' ? w.example_ko : w.example_en);

    // If there aren't enough distractors, fill in with dummy strings
    while (distractors.length < 3) {
      distractors.push(direction === 'ENG_TO_KOR' ? '업무 협의가 지연되고 있습니다.' : 'Please refer to the attachment.');
    }

    const compiledOptions = [correctMeaning, ...distractors].sort(() => 0.5 - Math.random());
    setQuizOptions(compiledOptions);
    setCorrectOptionIdx(compiledOptions.indexOf(correctMeaning));
    setSelectedQuizIdx(null);
    setHasScoredCurrent(false);
  }, [activeWord, gameplay, direction]);

  const handlePronounce = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakActiveSentence = () => {
    if (activeWord) {
      handlePronounce(activeWord.example_en);
    }
  };

  // Next Question handling
  const handleNextWord = () => {
    if (currentIndex < gameWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsBlinded(true);
      setSelectedQuizIdx(null);
      setHasScoredCurrent(false);
      setXpGranted(null);
    } else {
      setIsCompleted(true);
    }
  };

  // Skip / Previous handling
  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsBlinded(true);
      setSelectedQuizIdx(null);
      setHasScoredCurrent(false);
      setXpGranted(null);
    }
  };

  // Action: Self-blind memory succeed
  const handleBlindCardSuccess = () => {
    setIsBlinded(false);
    if (!hasScoredCurrent) {
      onAddXP(10);
      setXpGranted(10);
      setHasScoredCurrent(true);
      setCorrectAnim(true);
      speakActiveSentence(); // Auto-read English sentence when solved
      setTimeout(() => setCorrectAnim(false), 1200);
    }
  };

  // Action: Quiz option selected
  const handleQuizChoice = (idx: number) => {
    if (selectedQuizIdx !== null) return; // already answered
    setSelectedQuizIdx(idx);

    if (idx === correctOptionIdx) {
      setCorrectAnim(true);
      onAddXP(15); // Quiz is harder, +15 XP!
      setXpGranted(15);
      setHasScoredCurrent(true);
      speakActiveSentence(); // Auto play voice
      setTimeout(() => setCorrectAnim(false), 1200);
    } else {
      setWrongAnim(true);
      setTimeout(() => setWrongAnim(false), 800);
    }
  };

  // Reset current game progress
  const restartGameProgress = () => {
    const shuffled = [...gameWords].sort(() => 0.5 - Math.random());
    setGameWords(shuffled);
    setCurrentIndex(0);
    setIsBlinded(true);
    setSelectedQuizIdx(null);
    setHasScoredCurrent(false);
    setIsCompleted(false);
    setXpGranted(null);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Dynamic header summary banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-4 rounded-3xl border border-blue-800 shadow-md text-white">
        <div className="flex items-start justify-between">
          <div className="space-y-1 text-left">
            <span className="text-[8px] bg-blue-500/30 text-blue-300 font-bold px-2 py-0.5 rounded-full inline-block tracking-widest uppercase font-mono">
              Business Sentence Blitz
            </span>
            <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
              🎯 실전 비즈니스 이메일 예문 정복 게임
            </h3>
            <p className="text-[10px] text-indigo-200 leading-normal">
              토익 실제 빈출 단어들이 들어간 비즈니스 서류의 예문을 한/영 블라인드로 번갈아 가며 암기해 보세요!
            </p>
          </div>
          <button 
            onClick={restartGameProgress}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            title="게임 새로고침"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Controller Area */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-3.5 text-left">
        {/* Row 1: Category Selection */}
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">부서 예문 필터링</span>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] py-1 px-2.5 rounded-full font-extrabold border transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5 border-t border-slate-100">
          {/* Row 2: Direction option */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">기안 방향 (영해 번갈아 외우기)</span>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-150">
              <button
                onClick={() => setDirection('ENG_TO_KOR')}
                className={`text-[10px] py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center ${
                  direction === 'ENG_TO_KOR'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                영어 ➔ 한글 맞추기
              </button>
              <button
                onClick={() => setDirection('KOR_TO_ENG')}
                className={`text-[10px] py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center ${
                  direction === 'KOR_TO_ENG'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                한글 ➔ 영어 맞추기
              </button>
            </div>
          </div>

          {/* Row 3: Gameplay mode option */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">기안 훈련 타입 (훈련 모드)</span>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-150">
              <button
                onClick={() => setGameplay('BLIND_CARD')}
                className={`text-[10px] py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center ${
                  gameplay === 'BLIND_CARD'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                블라인드 셀프 암기
              </button>
              <button
                onClick={() => setGameplay('QUIZ_4_CHOICE')}
                className={`text-[10px] py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center ${
                  gameplay === 'QUIZ_4_CHOICE'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                실전 4지선다 기결재
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Stage */}
      {isCompleted ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-md text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-3xl animate-bounce">
            🏆
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-slate-800">예문 결재 트레이닝 세션 완료!</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              선택한 카테고리의 모든 업무 예문 검토가 완료되었습니다. 귀하의 즉각적인 이메일 제안 능력이 엄청나게 강화되었습니다!
            </p>
          </div>
          <button
            onClick={restartGameProgress}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-105 inline-flex items-center gap-1 cursor-pointer"
          >
            <ListRestart size={13} />
            <span>새로운 기안 세션으로 처음부터 업무 시작</span>
          </button>
        </div>
      ) : activeWord ? (
        <div className="space-y-4">
          <div className={`bg-white rounded-3xl border shadow-md p-5 pb-6 text-left relative overflow-hidden min-h-[300px] flex flex-col justify-between transition-all duration-300 ${
            correctAnim ? 'border-emerald-300 bg-emerald-50/10' : wrongAnim ? 'border-red-300 bg-red-50/10' : 'border-slate-150'
          }`}>
            {/* Stage level header */}
            <div className="flex justify-between items-center text-[9px] border-b border-slate-100 pb-2.5 text-slate-400">
              <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-extrabold">
                {activeWord.category}
              </span>
              <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                <span>진행:</span>
                <span className="font-bold text-slate-800">{currentIndex + 1}</span>
                <span>/</span>
                <span>{gameWords.length}</span>
              </div>
            </div>

            {/* Cue prompt word and display */}
            <div className="flex-1 py-4 flex flex-col justify-center">
              <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                핵심 타겟 어원: <span className="text-blue-600 underline font-extrabold">{activeWord.word}</span> ({activeWord.meaning})
              </span>

              {/* Direction prompt text */}
              <div className="mt-2 text-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80 min-h-20 flex items-center justify-center">
                <span className="text-sm font-black text-slate-800 leading-relaxed text-center">
                  {direction === 'ENG_TO_KOR' ? activeWord.example_en : activeWord.example_ko}
                </span>
                {direction === 'ENG_TO_KOR' && (
                  <button
                    onClick={speakActiveSentence}
                    className="p-1.5 ml-2 bg-white text-blue-600 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 rounded-full transition shrink-0 cursor-pointer"
                    title="음성 재생"
                  >
                    <Volume2 size={13} />
                  </button>
                )}
              </div>

              {/* XP rewarded bubble inside game stage */}
              {xpGranted && (
                <div className="text-center mt-2">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black font-mono animate-pulse">
                    ✔️ 완벽 보고! +{xpGranted} XP 획득
                  </span>
                </div>
              )}

              {/* Game interaction block */}
              <div className="mt-5">
                {gameplay === 'BLIND_CARD' ? (
                  /* 1. Self Blind Card interactive area */
                  <div className="space-y-4">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">블라인드 숨김 해석 내용</span>
                    <AnimatePresence mode="wait">
                      {isBlinded ? (
                        <motion.button
                          key="blinded"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={handleBlindCardSuccess}
                          className="w-full py-6 px-4 bg-slate-900 text-slate-400 rounded-2xl border border-slate-800 cursor-pointer flex flex-col items-center justify-center gap-2 select-none hover:bg-slate-850 transition duration-200"
                        >
                          <EyeOff size={18} className="text-blue-500 animate-bounce" />
                          <p className="text-[11px] font-black text-slate-200">🔒 기업 기밀 훈련 필터로 블라인드됨</p>
                          <p className="text-[9px] text-slate-500">머리속으로 해석을 연상한 후, 눌러서 결재 정답을 대조하세요.</p>
                        </motion.button>
                      ) : (
                        <motion.div
                          key="revealed"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-150 text-center flex flex-col justify-center items-center gap-2"
                        >
                          <div className="flex items-center gap-1 text-[9px] text-blue-700 font-bold font-mono">
                            <Eye size={12} />
                            <span>기밀 번역 대조 해제</span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-800 leading-relaxed max-w-xs">
                            {direction === 'ENG_TO_KOR' ? activeWord.example_ko : activeWord.example_en}
                          </p>
                          {direction === 'KOR_TO_ENG' && (
                            <button
                              onClick={speakActiveSentence}
                              className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-[10px] text-blue-600 font-bold border border-blue-200 rounded-full cursor-pointer transition shadow-xs mt-1"
                            >
                              <Volume2 size={11} />
                              <span>영어 예문 발음 듣기</span>
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* 2. 4-Choice quiz interactive area */
                  <div className="space-y-2.5">
                    <span className="text-[9px] text-slate-450 uppercase tracking-widest block font-extrabold">알맞은 번역 결재 서류를 선택하세요</span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {quizOptions.map((opt, i) => {
                        let btnStyle = 'border-slate-200 text-slate-850 hover:bg-slate-50 active:scale-[0.99]';
                        
                        if (selectedQuizIdx !== null) {
                          if (i === correctOptionIdx) {
                            btnStyle = 'border-emerald-350 bg-emerald-50 text-emerald-800 font-bold shadow-xs';
                          } else if (i === selectedQuizIdx) {
                            btnStyle = 'border-red-305 bg-red-10 text-red-700 font-bold';
                          } else {
                            btnStyle = 'border-slate-100 bg-slate-50 text-slate-350 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handleQuizChoice(i)}
                            disabled={selectedQuizIdx !== null}
                            className={`w-full p-3 border rounded-xl text-left text-[11px] leading-relaxed transition-all duration-150 flex justify-between items-center cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {selectedQuizIdx !== null && i === correctOptionIdx && (
                              <Check size={12} className="text-emerald-600 font-black shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next / Prev Navigation inside game board */}
            <div className="flex gap-3 justify-between items-center border-t border-slate-100 pt-4 mt-3">
              <button
                onClick={handlePrevWord}
                disabled={currentIndex === 0}
                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3.5 py-2 text-[10px] font-bold text-slate-600 rounded-xl transition disabled:opacity-40 cursor-pointer flex items-center gap-0.5"
              >
                <ChevronLeft size={12} />
                <span>이전 문장</span>
              </button>

              {gameplay === 'BLIND_CARD' && (
                <button
                  onClick={() => setIsBlinded(prev => !prev)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-[9px] font-black rounded-lg transition shrink-0 cursor-pointer"
                >
                  {isBlinded ? "미리보기" : "다시 숨기기"}
                </button>
              )}

              <button
                onClick={handleNextWord}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2 text-[10px] rounded-xl transition shadow shadow-blue-100 hover:scale-[1.03] active:scale-[0.98] cursor-pointer flex items-center gap-0.5"
              >
                <span>{currentIndex === gameWords.length - 1 ? '훈련 종료' : '다음 문장'}</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-md text-center py-12">
          <p className="text-xs text-slate-500 font-extrabold font-mono">가용할 수 있는 예문 목록이 발견되지 않았습니다.</p>
          <p className="text-[10px] text-slate-400 mt-1">승진 시험을 보고 직급이 오르면 더 많은 예문들이 해금됩니다!</p>
        </div>
      )}
    </div>
  );
}
