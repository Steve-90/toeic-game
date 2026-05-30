/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefreshCw, Trash2, Calendar, BookOpen, Volume2, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { TOEICWord, IncorrectWord } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReflectionNotesProps {
  incorrectWords: IncorrectWord[];
  registeredWords: TOEICWord[];
  onRemoveIncorrectWord: (wordId: number) => void;
  onAddXP: (xp: number) => void;
}

export default function ReflectionNotes({
  incorrectWords,
  registeredWords,
  onRemoveIncorrectWord,
  onAddXP
}: ReflectionNotesProps) {
  const [activeTestWordId, setActiveTestWordId] = useState<number | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Load or sync continuous review settings
  const [continuousReview, setContinuousReview] = useState<boolean>(() => {
    const saved = localStorage.getItem('TOEIC_CONTINUOUS_REVIEW_MODE');
    return saved === 'true';
  });

  const toggleContinuousReview = () => {
    const nextVal = !continuousReview;
    setContinuousReview(nextVal);
    localStorage.setItem('TOEIC_CONTINUOUS_REVIEW_MODE', String(nextVal));
  };

  // Link incorrect word metadata with real word descriptors
  const failedWordsLink = incorrectWords.map(iw => {
    const matched = registeredWords.find(w => w.id === iw.wordId);
    return {
      metadata: iw,
      wordObj: matched
    };
  }).filter(item => item.wordObj !== undefined) as { metadata: IncorrectWord; wordObj: TOEICWord }[];

  const handlePronounce = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecheckQuiz = (target: TOEICWord) => {
    setActiveTestWordId(target.id);
    setFeedback(null);

    // Pick 3 distractors from all registered words
    const distractors = registeredWords
      .filter(w => w.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning);

    const pool = [target.meaning, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(pool);
    setCorrectIdx(pool.indexOf(target.meaning));
  };

  const handleTestSelection = (index: number, wordId: number) => {
    if (index === correctIdx) {
      setFeedback('correct');
      onAddXP(20); // +20 XP for successful re-evaluation
      setTimeout(() => {
        // Continuous review means we don't automatically delete the item from mistake book on 1st correct answer
        if (!continuousReview) {
          onRemoveIncorrectWord(wordId);
        }
        setActiveTestWordId(null);
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback('wrong');
    }
  };

  // Get dynamic Ebbinghaus warning label
  const getEbbinghausFactor = (wrongCount: number) => {
    if (wrongCount >= 3) {
      return { label: "⏳ 영구 망각 위험 (즉시 복습)", color: "text-red-600 bg-red-50 border-red-150" };
    }
    if (wrongCount === 2) {
      return { label: "⏳ 에빙하우스 2차 임계기 (주의)", color: "text-amber-600 bg-amber-50 border-amber-150" };
    }
    return { label: "⏳ 기초 망각 수치 (순환 학습)", color: "text-blue-600 bg-blue-50 border-blue-150" };
  };

  return (
    <div className="space-y-4">
      {/* Informative Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm flex items-start gap-3">
        <div className="bg-amber-50 flex-shrink-0 p-2.5 rounded-xl text-amber-500">
          <Calendar size={20} />
        </div>
        <div>
          <h4 className="font-bold text-xs text-slate-900">비밀 반성문 보관소 (Ebbinghaus Vault)</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
            한 번 반려된 이력이 있는 단어는 완벽한 장기 기억(Long-term memory)으로 영구 각인될 때까지 반성문 명단에서 이탈하지 않습니다.
          </p>
        </div>
      </div>

      {/* 🔄 Continuous Study Mode Toggle Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex justify-between items-center shadow-md">
        <div className="text-left space-y-0.5">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
            <RefreshCw size={11} className="animate-spin" />
            <span>오답 무한 반복 정복 시스템</span>
          </div>
          <p className="text-[9px] text-slate-400 leading-normal">
            활성화하면 정답을 맞혀도 단어가 자동 제거되지 않고 계속 리스트에 보관되어 연속 무한 복습을 수행할 수 있습니다.
          </p>
        </div>

        <button
          onClick={toggleContinuousReview}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-black tracking-tight transition duration-150 shrink-0 cursor-pointer ${
            continuousReview
              ? 'bg-blue-600 text-white shadow shadow-blue-800'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {continuousReview ? '무한 보관 ON' : '자동 삭제 ON'}
        </button>
      </div>

      {/* List of failed cards */}
      {failedWordsLink.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {failedWordsLink.map((item, i) => {
              const eb = getEbbinghausFactor(item.metadata.wrongCount);
              const isTesting = activeTestWordId === item.wordObj.id;

              return (
                <motion.div
                  key={item.wordObj.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-4 text-left relative overflow-hidden"
                >
                  {/* Decorative background logo */}
                  <div className="absolute top-0 right-0 h-16 w-16 pointer-events-none opacity-5">
                    <Trash2 size={64} className="text-red-500" />
                  </div>

                  {/* Header info */}
                  <div className="flex justify-between items-center text-[9px] border-b border-slate-100 pb-2.5">
                    <span className={`border px-2 py-0.5 rounded font-bold font-mono uppercase ${eb.color}`}>
                      {eb.label}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-black">
                        -{item.metadata.wrongCount}회 반려
                      </span>

                      {/* Manual Trash clear button */}
                      <button
                        onClick={() => {
                          if (confirm(`'${item.wordObj.word}' 단어를 이번 오답 리스트에서 즉시 수동 결재 제외하시겠습니까?`)) {
                            onRemoveIncorrectWord(item.wordObj.id);
                          }
                        }}
                        className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 p-1 rounded-md border border-slate-205 transition duration-150 cursor-pointer"
                        title="수동으로 제외하기"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Test block vs Normal display */}
                  {!isTesting ? (
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xl font-bold tracking-tight text-slate-900">
                              {item.wordObj.word}
                            </h4>
                            <button
                              onClick={() => handlePronounce(item.wordObj.word)}
                              className="bg-slate-100 p-1.5 rounded-full text-slate-600 hover:text-blue-600 transition cursor-pointer"
                              title="단어 발음 재생"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                          <p className="text-xs text-blue-600 font-black mt-1">
                            뜻: {item.wordObj.meaning}
                          </p>
                        </div>
                      </div>

                      {/* Collocation Memo with TTS */}
                      <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-105 text-left space-y-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[9px] text-blue-700 font-bold font-mono">
                            🔗 귀책 공식 (짝꿍 표현)
                          </span>
                          <button
                            onClick={() => handlePronounce(item.wordObj.collocation)}
                            className="text-[9px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                            title="짝꿍 표현 발음 재생"
                          >
                            <Volume2 size={10} />
                            <span>듣기</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-800 font-semibold italic">{item.wordObj.collocation}</p>
                      </div>

                      {/* Example sentences with Standard English Audio Playback */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-left space-y-1">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1">
                          <span className="text-[9px] text-slate-500 font-bold font-mono">
                            🏢 실전 비즈니스 이메일 예문
                          </span>
                          <button
                            onClick={() => handlePronounce(item.wordObj.example_en)}
                            className="flex items-center gap-1 text-[9px] bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded transition cursor-pointer font-black"
                            title="예문 발음 재생"
                          >
                            <Volume2 size={11} className="text-blue-500 animate-pulse" />
                            <span>듣기</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed italic">{item.wordObj.example_en}</p>
                        <p className="text-[11px] text-slate-500 leading-normal">{item.wordObj.example_ko}</p>
                      </div>

                      <button
                        onClick={() => startRecheckQuiz(item.wordObj)}
                        className="w-full bg-slate-100 border border-slate-250 text-slate-705 hover:bg-blue-50 hover:text-blue-700 font-extrabold text-[10px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:border-blue-200"
                      >
                        <RefreshCw size={11} />
                        <span>반성 검증 서류 재기안 (Re-Test)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5 bg-blue-50/20 p-3 rounded-xl border border-blue-100 relative">
                      {/* Interactive testing mode */}
                      <div className="text-center pb-1">
                        <span className="text-[9px] font-bold text-blue-600 tracking-wider">RE-CHECK TEST</span>
                        <h5 className="text-lg font-black tracking-tight text-slate-900 mt-0.5">
                          {item.wordObj.word} 의 올바른 뜻은?
                        </h5>
                      </div>

                      {/* Options stack */}
                      <div className="grid grid-cols-1 gap-1.5 font-sans">
                        {options.map((opt, optI) => {
                          let optClass = "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";
                          if (feedback === 'correct' && optI === correctIdx) {
                            optClass = "bg-emerald-50 border-emerald-305 text-emerald-700 font-bold shadow-sm";
                          } else if (feedback === 'wrong') {
                            if (optI === correctIdx) {
                              optClass = "bg-emerald-50 border-emerald-305 text-emerald-700 font-bold shadow-sm";
                            } else {
                              optClass = "bg-slate-50 text-slate-350 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={optI}
                              onClick={() => handleTestSelection(optI, item.wordObj.id)}
                              className={`w-full p-2.5 border rounded-xl text-left text-[11px] transition duration-150 flex justify-between items-center cursor-pointer ${optClass}`}
                              disabled={feedback !== null}
                            >
                              <span>{opt}</span>
                              {feedback === 'correct' && optI === correctIdx && (
                                <Check size={12} className="text-emerald-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {feedback === 'wrong' && (
                        <div className="text-center transition">
                          <p className="text-[10px] text-red-650 font-bold">❌ 아직 암기 상태가 미약합니다! 다시 숙지 요망.</p>
                          <button
                            onClick={() => setActiveTestWordId(null)}
                            className="text-[9px] text-slate-500 underline mt-1.5 block mx-auto cursor-pointer"
                          >
                            테스트 일단 뒤로가기
                          </button>
                        </div>
                      )}

                      {feedback === 'correct' && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl font-bold text-emerald-700 text-xs gap-1 opacity-90 animate-fade-in pointer-events-none">
                          <ShieldCheck size={16} />
                          <span>{continuousReview ? "반복 테스트 성공! (+20 XP)" : "반성 서류 최종 종결! (+20 XP)"}</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-2xl border border-slate-150 shadow-md text-center py-12 space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-3xl">
            🏆
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">보안 반성문 보관소가 완전히 청결합니다!</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              모든 기결재 서류 처리가 한 건의 과실도 없이 이루어져 영구 궤도에 정착했습니다. 아주 우수한 성과입니다!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
