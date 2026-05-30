/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, ShieldAlert, BadgeCheck, Check, CornerDownRight, X, UserX, UserCheck } from 'lucide-react';
import { Rank, TOEICWord } from '../types';
import { RANK_INFOS } from '../data/words';
import { motion, AnimatePresence } from 'motion/react';

interface PromotionExamProps {
  currentRank: Rank;
  registeredWords: TOEICWord[];
  onPromote: (newRank: Rank) => void;
  onAddXP: (xp: number) => void;
  onNavigate: (tab: 'office' | 'words' | 'quiz' | 'reflection' | 'ceo' | 'exam') => void;
}

interface ExamQuestion {
  wordObj: TOEICWord;
  options: string[];
  correctIdx: number;
}

export default function PromotionExam({
  currentRank,
  registeredWords,
  onPromote,
  onAddXP,
  onNavigate
}: PromotionExamProps) {
  const currentRankInfo = RANK_INFOS[currentRank];
  const nextRank = currentRankInfo.nextTitle;

  const [gameState, setGameState] = useState<'review' | 'testing' | 'passed' | 'failed'>('review');
  const [examQList, setExamQList] = useState<ExamQuestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  if (!nextRank) {
    return (
      <div className="bg-white rounded-2xl p-6 border text-center space-y-3">
        <Award className="mx-auto text-amber-500" size={36} />
        <h4 className="font-bold text-slate-800 text-sm">최종 진급 완료 (CEO)</h4>
        <p className="text-xs text-slate-400">토익상사 내에서 더 이상 올라갈 곳이 없이 극의에 도달했습니다!</p>
      </div>
    );
  }

  // Find all words matching their current rank level to base the exam on
  const rankWords = registeredWords.filter(w => w.rank_level === currentRank);

  const startExam = () => {
    if (rankWords.length < 5) {
      alert("단어 데이터베이스가 부족합니다! 돌발 훈련을 더 받아 단어를 확보하세요.");
      return;
    }

    // Pick 5 random words for high-stakes exam
    const shuffled = [...rankWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const questions: ExamQuestion[] = selected.map(targetWord => {
      // Find 3 distractors matching any level in registeredWords
      const incorrectPool = registeredWords.filter(w => w.word !== targetWord.word);
      const shuffledIncorrect = incorrectPool.sort(() => 0.5 - Math.random());
      const wrongOptions = shuffledIncorrect.slice(0, 3).map(w => w.meaning);

      const options = [targetWord.meaning, ...wrongOptions].sort(() => 0.5 - Math.random());
      
      return {
        wordObj: targetWord,
        options,
        correctIdx: options.indexOf(targetWord.meaning)
      };
    });

    setExamQList(questions);
    setActiveIdx(0);
    setSelectedIdx(null);
    setCorrectAnswersCount(0);
    setGameState('testing');
  };

  const handleSelection = (selectedOptionIndex: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(selectedOptionIndex);

    const question = examQList[activeIdx];
    const isCorrect = selectedOptionIndex === question.correctIdx;

    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    }

    // Go to next question after 1.2s delay
    setTimeout(() => {
      if (activeIdx < examQList.length - 1) {
        setActiveIdx(prev => prev + 1);
        setSelectedIdx(null);
      } else {
        // Exam Finished! Check grading threshold (at least 4 out of 5 correct answers)
        const finalCorrectCount = isCorrect ? correctAnswersCount + 1 : correctAnswersCount;
        if (finalCorrectCount >= 4) {
          setGameState('passed');
          onAddXP(150); // bonus 150 XP
          onPromote(nextRank); // execute state upgrade
        } else {
          setGameState('failed');
        }
      }
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {gameState === 'review' && (
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-md text-slate-800 text-left space-y-5">
          {/* Main Stamp badge */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <span className="text-[9px] bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                인사보고서 제 2026-99호
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2">승진 자격 심사 기안서</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">승진 대기 대상: {currentRank}</p>
            </div>
            <div className="text-4xl">📜</div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-sans">
            <p>본 기안서는 사원의 부서별 필수 토익 업무 역량 숙치 상태를 엄격히 자격 검증하여 <strong>{currentRank}</strong>에서 차기 리더급인 <strong>{nextRank}</strong> 선상으로 승진을 허가받기 위한 최종 내부 결재 심사 보고문입니다.</p>
            
            <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1 text-[11px] font-mono">
              <p className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1">
                <BadgeCheck size={14} className="text-blue-600" />
                인사 심사 과목 내역
              </p>
              <ul className="space-y-0.5 pt-1 text-slate-500">
                <li className="flex items-center gap-1">
                  <CornerDownRight size={10} />
                  대상: 현 직급({currentRank}) 범위 내 기출 단어 5선
                </li>
                <li className="flex items-center gap-1">
                  <CornerDownRight size={10} />
                  합격선: 5문항 중 <strong className="text-blue-600 font-bold">4문항 이상 정답</strong> 제출 필수
                </li>
                <li className="flex items-center gap-1">
                  <CornerDownRight size={10} />
                  영업 가산: 합격 시 <strong className="text-emerald-600 font-bold">+150 XP</strong> 및 직급 권한 즉시 상향조정
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={startExam}
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer font-extrabold text-xs text-white py-3.5 px-6 rounded-xl transition shadow shadow-blue-100 active:scale-95 text-center block"
          >
            심사 위원장 호출 및 시험 응시 (Pass the assessment)
          </button>
        </div>
      )}

      {/* Direct Multiple choice high stakes testing */}
      {gameState === 'testing' && examQList.length > 0 && (
        <div className="space-y-4 text-left">
          {/* Layout Status */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded">고극 심사</span>
              <h4 className="font-bold text-[11px] text-slate-100 mt-1">
                {currentRank} ➔ {nextRank} 실무 능력 필기고사
              </h4>
            </div>
            <span className="text-xs font-mono font-bold bg-zinc-800 text-amber-400 px-2 py-0.5 rounded">
              {activeIdx + 1} / 5 문항
            </span>
          </div>

          {/* Question Box Card */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md min-h-36 flex flex-col justify-between relative">
            {/* Visual feedback overlay */}
            {selectedIdx !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 pointer-events-none rounded-2xl">
                {selectedIdx === examQList[activeIdx].correctIdx ? (
                  <span className="text-emerald-600 font-black text-xl italic drop-shadow animate-ping">CORRECT APPROVED</span>
                ) : (
                  <span className="text-red-650 font-black text-xl italic drop-shadow animate-ping">CRITICAL FAILED</span>
                )}
              </div>
            )}

            <div>
              <span className="text-[9px] bg-slate-100 text-slate-400 font-bold px-1.5 py-0.5 rounded font-mono block w-max uppercase">
                EXAM PAPER
              </span>
              <p className="text-xs text-slate-500 font-bold mt-2.5">다음 기출 단어의 올바른 한국어 뜻을 최종 결정 서명하세요:</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {examQList[activeIdx].wordObj.word}
              </h3>
            </div>
          </div>

          {/* Options select list */}
          <div className="space-y-2.5">
            {examQList[activeIdx].options.map((opt, optIndex) => {
              let classNames = "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 cursor-pointer";
              if (selectedIdx !== null) {
                if (optIndex === examQList[activeIdx].correctIdx) {
                  classNames = "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold shadow-sm";
                } else if (optIndex === selectedIdx) {
                  classNames = "bg-red-50 border-red-300 text-red-700 font-bold";
                } else {
                  classNames = "bg-slate-50 border-slate-100 text-slate-350 opacity-50";
                }
              }

              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelection(optIndex)}
                  disabled={selectedIdx !== null}
                  className={`w-full p-3.5 border rounded-2xl text-left text-xs transition duration-150 ${classNames}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Passed Screen */}
      {gameState === 'passed' && (
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl border-2 border-amber-400 text-center space-y-6 overflow-hidden relative">
          <div className="absolute -right-10 -bottom-10 h-36 w-36 bg-amber-400 rounded-full blur-3xl opacity-10"></div>
          <div className="text-5xl animate-bounce">👑</div>
          <div className="space-y-1 text-center">
            <span className="text-[10px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              통과 승인
            </span>
            <h3 className="text-xl font-black text-amber-300 mt-2">사령장: 초고속 자격 승치 완료!</h3>
            <p className="text-xs text-slate-200 max-w-sm mx-auto leading-relaxed">
              축하합니다! 주주위원회와 사장 정광민의 재결로 당신의 직위 등급을 <strong className="text-amber-300">{currentRank}</strong>에서 <strong className="text-blue-300 font-bold">{nextRank}</strong>(으)로 최종 승격 보장 임명합니다!
            </p>
          </div>

          <div className="max-w-xs mx-auto p-4 bg-white/5 border border-white/15 rounded-xl flex items-center justify-between text-left">
            <div>
              <p className="text-[9px] text-zinc-400 font-mono">신규 임명 직급</p>
              <h5 className="text-sm font-bold text-amber-400">{nextRank}</h5>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-zinc-400 font-mono">자격 승지 보너스</p>
              <h5 className="text-sm font-extrabold text-emerald-400 font-mono">+150 XP</h5>
            </div>
          </div>

          <button
            onClick={() => onNavigate('office')}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-3.5 px-6 rounded-xl transition shadow active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
          >
            <UserCheck size={14} />
            <span>임명장 받고 부서 복귀하기</span>
          </button>
        </div>
      )}

      {/* Failed Screen */}
      {gameState === 'failed' && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md text-slate-800 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500 text-3xl">
            ❌
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              기안 결재 반려
            </span>
            <h3 className="font-extrabold text-base text-slate-900 mt-2">인사 고가 합격 수준 미달</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              승진 시험 결재가 반려되었습니다. 영단어 정답률이 기준치(4/5)를 충족하지 못했습니다. 단어 카드를 충분히 복습하시고 시재 기결하여 보강해 주세요.
            </p>
          </div>

          <div className="flex gap-2.5 text-center">
            <button
              onClick={() => {
                setGameState('review');
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
            >
              기안 철회
            </button>
            <button
              onClick={() => onNavigate('words')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow shadow-blue-100"
            >
              업무 보고 (공부하러 가기)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
