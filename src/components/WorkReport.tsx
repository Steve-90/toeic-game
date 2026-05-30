/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, ChevronLeft, ChevronRight, BookOpen, Sparkles, Check, Bookmark, PlusCircle, HelpCircle } from 'lucide-react';
import { TOEICWord, Rank } from '../types';
import { INSTANT_TOEIC_WORDS, RANK_INFOS } from '../data/words';
import { motion, AnimatePresence } from 'motion/react';

interface WorkReportProps {
  currentRank: Rank;
  onAddXP: (xp: number) => void;
  registeredWords: TOEICWord[];
  onAddNewWord: (newWord: TOEICWord) => void;
}

export default function WorkReport({ currentRank, onAddXP, registeredWords, onAddNewWord }: WorkReportProps) {
  // Filter core pre-loaded words matching the rank or lower, or including any dynamically added words
  const eligibleWords = registeredWords.filter(w => {
    // If it's unlocked by rank level
    const rankOrder: Rank[] = ['인턴', '사원', '대리', '과장', 'CEO'];
    const currentOrderIdx = rankOrder.indexOf(currentRank);
    const wordOrderIdx = rankOrder.indexOf(w.rank_level);
    return wordOrderIdx <= currentOrderIdx;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedWordIds, setStudiedWordIds] = useState<number[]>([]);
  
  // AI secretary briefing state
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  // Dynamic Word recommended state
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  // Extract unlocked categories
  const rankInfo = RANK_INFOS[currentRank];
  const unlockedCategories = ['전체', ...rankInfo.unlockedCategories];

  // Filter based on selected category
  const filteredWords = selectedCategory === '전체' 
    ? eligibleWords 
    : eligibleWords.filter(w => w.category === selectedCategory);

  const activeWord: TOEICWord | undefined = filteredWords[currentIndex];

  // Native Speech Synthesis pronunciation helper
  const handlePronounce = (wordText: string) => {
    if ('speechSynthesis' in window) {
      // Cancel previous to prevent overlapping
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // slightly slower for better listening
      window.speechSynthesis.speak(utterance);
    } else {
      alert("이 웹 브라우저는 음성 음독(TTS)을 제공하지 않습니다.");
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setBriefing(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setBriefing(null);
    }
  };

  const handleMarkAsMastered = (wordId: number) => {
    if (!studiedWordIds.includes(wordId)) {
      setStudiedWordIds(prev => [...prev, wordId]);
      onAddXP(15); // +15 XP for studying and mastering a word
    }
  };

  // Get Custom AI briefing from secretary
  const handleRequestBriefing = async () => {
    if (!activeWord) return;
    setLoadingBriefing(true);
    setBriefing(null);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: activeWord.word,
          meaning: activeWord.meaning,
          collocation: activeWord.collocation,
          exampleEn: activeWord.example_en,
          exampleKo: activeWord.example_ko,
          userRank: currentRank
        })
      });
      const data = await response.json();
      if (data.error) {
        setBriefing(`오류가 발생했습니다: ${data.error}`);
      } else {
        setBriefing(data.result);
      }
    } catch (err) {
      setBriefing("비서실 통신 장애로 모바일 보고서를 가져오지 못했습니다. 잠시 후 새로고침해 보세요!");
    } finally {
      setLoadingBriefing(false);
    }
  };

  // Generate dynamic recommendation with Gemini API
  const handleRequestDynamicWord = async () => {
    setLoadingRecommend(true);
    setRecommendError(null);
    try {
      const response = await fetch('/api/generate-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRank: currentRank })
      });
      const data = await response.json();
      if (data.success && data.word) {
        const w = data.word;
        const compiledWord: TOEICWord = {
          id: Date.now(), // unique ID
          category: w.category || '인사/채용',
          rank_level: currentRank,
          word: w.word,
          meaning: w.meaning,
          collocation: w.collocation,
          example_en: w.example_en,
          example_ko: w.example_ko
        };
        // Add to our main active words array
        onAddNewWord(compiledWord);
        // Find inside filtered list
        setSelectedCategory('전체');
        // Set index to the end so it points to the newly added item
        setTimeout(() => {
          setCurrentIndex(eligibleWords.length); // length will be the newly updated one inside parent
          setShowAnswer(true);
          // Auto brief new word description generated
          if (w.office_mission) {
            setBriefing(`💬 [비서실의 특수 임무 전달]\n${w.office_mission}`);
          }
        }, 150);
        onAddXP(30); // Give +30 XP bonus for doing custom business training!
      } else {
        setRecommendError("단어 생성 실패");
      }
    } catch (err) {
      setRecommendError("AI 네트워크 응답이 지연되고 있습니다. 비서실 내부 수리 요청 중입니다.");
    } finally {
      setLoadingRecommend(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Unlocked Categories list */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 block">결재 부서 선택 (Categories)</label>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {unlockedCategories.map((cat, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
                setShowAnswer(false);
                setBriefing(null);
              }}
              className={`text-[11px] py-1.5 px-3.5 rounded-full font-bold transition whitespace-nowrap border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top-level action buttons */}
      <div className="bg-slate-905 p-4 rounded-3xl flex justify-between items-center text-white border border-slate-800 shadow-md relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <span className="text-[8px] bg-blue-500/20 text-blue-400 font-mono tracking-widest uppercase px-2 py-0.5 rounded-full block w-max font-bold border border-blue-500/10">
            INFINITE AI TASK FORCE
          </span>
          <h4 className="font-extrabold text-xs mt-1 text-slate-100">오늘의 돌발 특수 업무 기안</h4>
          <p className="text-[9px] text-zinc-400">Gemini가 이 직급에 꼭 맞는 리포트 영어 단어 1개를 추가 추천합니다.</p>
        </div>
        <button
          onClick={handleRequestDynamicWord}
          disabled={loadingRecommend}
          className="bg-blue-600 hover:bg-blue-505 disabled:opacity-50 text-white font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer relative z-10"
        >
          <Sparkles size={11} className={loadingRecommend ? "animate-spin" : ""} />
          <span>업무 할당</span>
        </button>
      </div>

      {recommendError && (
        <div className="p-2.5 bg-red-50 border border-red-150 text-[10px] text-red-600 rounded-xl text-center">
          ⚠️ {recommendError}
        </div>
      )}

      {/* 3. Word Flashcard Viewer */}
      {filteredWords.length > 0 && activeWord ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-md p-5 relative overflow-hidden flex flex-col justify-between min-h-80">
            {/* Header detail */}
            <div className="flex justify-between items-start text-[10px] border-b border-slate-100 pb-2.5 mb-4 text-slate-400">
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-bold font-mono">
                DEPT: {activeWord.category}
              </span>
              <span className="font-mono text-slate-400">
                기안서 {currentIndex + 1} / {filteredWords.length}
              </span>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              {/* Word Spelling */}
              <div className="flex items-center gap-1.5 justify-center">
                <h3 className="text-3xl font-black tracking-tight text-slate-900 select-all">
                  {activeWord.word}
                </h3>
                <button
                  onClick={() => handlePronounce(activeWord.word)}
                  className="bg-slate-100 hover:bg-slate-200 hover:scale-105 active:scale-95 p-1.5 rounded-full text-blue-600 transition cursor-pointer"
                  title="Pronounce"
                >
                  <Volume2 size={15} />
                </button>
              </div>

              {/* Revealed detail */}
              {showAnswer ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3.5 w-full"
                >
                  {/* Meaning */}
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">부서 승인 공인 번역</p>
                    <p className="text-lg font-black text-blue-600 tracking-tight">{activeWord.meaning}</p>
                  </div>

                  {/* Collocation */}
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-105 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] bg-blue-200/55 text-blue-700 font-bold px-2 py-0.5 rounded-full inline-block font-mono border border-blue-250/20">
                        🔗 암기 정답 공식 (짝꿍 표현)
                      </span>
                      <button
                        onClick={() => handlePronounce(activeWord.collocation)}
                        className="flex items-center gap-1 text-[9px] bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded transition cursor-pointer font-bold"
                        title="공식 발음 재생"
                      >
                        <Volume2 size={10} />
                        <span>듣기</span>
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 italic">{activeWord.collocation}</p>
                  </div>

                  {/* Business contextual sentence */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-left space-y-1">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1">
                      <span className="text-[9px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded inline-block font-mono">
                        🏢 실전 비즈니스 이메일 예문
                      </span>
                      <button
                        onClick={() => handlePronounce(activeWord.example_en)}
                        className="flex items-center gap-1 text-[9px] bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-2.5 py-0.5 rounded transition cursor-pointer font-black"
                        title="예문 발음 재생"
                      >
                        <Volume2 size={11} className="animate-pulse" />
                        <span>듣기</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed italic">{activeWord.example_en}</p>
                    <p className="text-[11px] text-slate-500 leading-normal">{activeWord.example_ko}</p>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer transition active:scale-95 flex items-center gap-1.5 shadow-blue-100"
                >
                  <BookOpen size={13} />
                  <span>결재문 열어 번역 확인하기</span>
                </button>
              )}
            </div>

            {/* Bottom Actions Card Bar */}
            <div className="flex gap-2.5 border-t border-slate-100 pt-4 mt-4">
              <button
                onClick={() => handleMarkAsMastered(activeWord.id)}
                disabled={studiedWordIds.includes(activeWord.id)}
                className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-2 px-3 rounded-xl border transition cursor-pointer ${
                  studiedWordIds.includes(activeWord.id)
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Check size={13} />
                <span>{studiedWordIds.includes(activeWord.id) ? '결재 완료' : '업무 숙지 기안'}</span>
              </button>

              <button
                onClick={handleRequestBriefing}
                disabled={loadingBriefing}
                className="bg-purple-50 text-purple-600 border border-purple-150 hover:bg-purple-100 font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1 text-[11px] disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={13} className={loadingBriefing ? "animate-pulse" : ""} />
                <span>📢 비서실 기밀 브리핑</span>
              </button>
            </div>
          </div>

          {/* AI Briefing Drawer/Overlay */}
          <AnimatePresence>
            {(briefing || loadingBriefing) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-[#111827] text-slate-100 rounded-2xl p-4 border border-slate-800 shadow-lg space-y-2 relative"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-bold">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>정광민 대표이사 직속 특훈 브리핑</span>
                  </div>
                  <button 
                    onClick={() => setBriefing(null)} 
                    className="text-xs text-slate-500 hover:text-white transition cursor-pointer"
                  >
                    닫기
                  </button>
                </div>

                {loadingBriefing ? (
                  <div className="py-5 flex items-center justify-center gap-2.5 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    <span>사무 비서실 통신 기밀 분석 중...</span>
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-850">
                    {briefing}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination Controllers */}
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-white border border-slate-250 text-slate-600 font-semibold text-xs py-2 px-4 rounded-xl shadow-sm hover:bg-slate-50 disabled:opacity-40 select-none cursor-pointer transition flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              이전 서류
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentIndex + 1} / {filteredWords.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredWords.length - 1}
              className="bg-white border border-slate-250 text-slate-600 font-semibold text-xs py-2 px-4 rounded-xl shadow-sm hover:bg-slate-50 disabled:opacity-40 select-none cursor-pointer transition flex items-center gap-1"
            >
              다음 서류
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-7 rounded-2xl border border-slate-150 shadow-md text-center py-10">
          <BookOpen className="mx-auto text-slate-300 mb-2.5" size={32} />
          <h4 className="font-bold text-sm text-slate-800">해당 부서에 준비된 기안서가 없습니다.</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">승진하면 더 다양한 부서와 직급 단어 카드가 해제됩니다.</p>
        </div>
      )}
    </div>
  );
}
