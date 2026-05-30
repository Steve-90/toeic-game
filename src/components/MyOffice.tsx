/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  Heart, 
  Clock, 
  Award, 
  CheckSquare, 
  Calendar, 
  Compass, 
  UserCheck, 
  Coffee, 
  Zap, 
  MessageSquare, 
  Volume2, 
  BadgeCheck,
  Edit3,
  Check,
  User
} from 'lucide-react';
import { Rank, UserProfile } from '../types';
import { RANK_INFOS } from '../data/words';
import { motion, AnimatePresence } from 'motion/react';

interface MyOfficeProps {
  profile: UserProfile;
  onClockIn: () => void;
  onNavigate: (tab: 'office' | 'words' | 'quiz' | 'reflection' | 'ceo' | 'exam' | 'rpg') => void;
  onDrinkCoffee?: () => void;
  onUpdateName?: (newName: string) => void;
}

interface CharacterState {
  classTitle: string;
  name: string;
  codename: string;
  description: string;
  item: string;
  passive: string;
  stats: {
    power: number; // 업무 기안력
    speed: number; // 결재 처리 속도
    focus: number;  // 비즈니스 리더십
  };
  backColor: string;
  characterVisual: string; // Dynamic styled emoji layout
  messages: string[];
}

const CHARACTER_STATES: Record<Rank, CharacterState> = {
  '인턴': {
    name: '신입 인턴 토순이 🐰',
    classTitle: '초짜 생존 인턴',
    codename: 'TOSUNI LV.1',
    description: '어안이 벙벙한 큰 눈으로 복사기와 탕비실을 배회하는 병아리 사원입니다.',
    item: '반짝이는 예비 임시 방문증 & 스프링 필기노트',
    passive: '신입의 불굴 의지 (출근 시 +80 XP 보너스 즉시 지원)',
    stats: { power: 15, speed: 20, focus: 25 },
    backColor: 'from-amber-50 to-orange-100 border-amber-250 text-amber-900',
    characterVisual: '🧹💨👶🐰',
    messages: [
      "“네?! 제가 오늘 복사를 200장 해야 된다고요?! 양면 버튼이 어디 있더라...”",
      "“토익 어휘를 완벽 무장해서 빨리 정직원 사원증을 발급받고 싶습니다!”",
      "“부장님 자리의 믹스커피가 안 끊기도록 채워두는 게 제 핵심 하루 임무입니다!”",
      "“아직 비즈니스 이메일 약어 수신처(cc) 참조 설정도 가슴이 떨립니다...”"
    ]
  },
  '사원': {
    name: '사원 토순이 🦊',
    classTitle: '눈빛 복귀 완료! 정직원',
    codename: 'TOSUNI LV.2',
    description: '정식 사원증을 목에 걸치고 눈빛이 번뜩이는 영재 실무 요원입니다.',
    item: '네이비 목걸이 정직원 사원증 & 회사 텀블러',
    passive: '사내 가속도 법칙 (서류결재 퀴즈 제한 시간 10초 유지 보장)',
    stats: { power: 45, speed: 52, focus: 58 },
    backColor: 'from-blue-50 to-indigo-100 border-blue-200 text-blue-900',
    characterVisual: '💻☕🏷️🦊',
    messages: [
      "“과장님이 기획서 영어 오타가 없다고 기분 좋게 믹스커피를 한 잔 내려주셨어요!”",
      "“드디어 탕비실 고급 원두커피 기계를 제 마음대로 마실 공식 자격이 생겼습니다.”",
      "“비밀인데... 토익 퀴즈를 맞힐 때마다 제 가상 월급이 소폭 오르는 기분이에요.”",
      "“다음 대리 승격 인사고과는 진짜 어렵다는데 미리 복습해 두어야겠어요.”"
    ]
  },
  '대리': {
    name: '에이스 대리 토순이 🐨',
    classTitle: '업무 전권 에이스 대리',
    codename: 'TOSUNI LV.3',
    description: '사무실의 진짜 주축. 듀얼 모니터 위에서 번개같은 속도로 일일 영어 결재를 완료합니다.',
    item: '프로용 소음차단 헤드폰 & 시원한 아메리카노 컵',
    passive: '연속 결재 버프 (서류 심사 정답 제출 시 경험치 상승 확률 증폭)',
    stats: { power: 75, speed: 82, focus: 79 },
    backColor: 'from-emerald-50 to-teal-100 border-emerald-250 text-emerald-900',
    characterVisual: '📊📁🎧🐨',
    messages: [
      "“음, 해외 바이어에게 송신할 메일의 어휘 검토가 끝났군. 결재 올려주게!”",
      "“제가 없을 때 부서 어휘 기안이 꼬였다면서 전무님이 믹스커피를 쏘셨습니다.”",
      "“영어 단어의 암기 정답 짝꿍 표현(Collocation)은 제 실무 생존 공식이죠.”",
      "“인사 심사에 합격해서 언젠가 저 거대한 사장실 가죽의자에 앉아보고야 말리라!”"
    ]
  },
  '과장': {
    name: '과장 토선생 🦁',
    classTitle: '최종 결재 수석 실무 사령관',
    codename: 'TOSUNI LV.4',
    description: '모든 부서의 영어 기획 및 계약 서류를 최종 검수하고 결재하는 카리스마 수장입니다.',
    item: '이탈리아 최고급 가죽 브리프케이스 & 가문 직인 도장',
    passive: '망각 정찰대 (오답 반성문 재시험 시 정답 힌트 즉각 포착 제공)',
    stats: { power: 90, speed: 78, focus: 88 },
    backColor: 'from-purple-50 to-fuchsia-100 border-purple-200 text-purple-900',
    characterVisual: '💼✒️👑🦁',
    messages: [
      "“에빙하우스 주기에 따르면, 하급자들이 기한 내 복습하지 않으면 업무 결손이 나네!”",
      "“글로벌 투자 유치를 위해 다국적 협상 어휘집을 실시간으로 독파하는 중일세.”",
      "“정광민 대표이사님과의 다이렉트 긴급 화상 대담도 이젠 떨리지 않는 직급이지.”",
      "“퇴근 퇴근 도장 찍기 전에 토익 퀴즈 5회 결재 완수했는지 직접 수사하겠네.”"
    ]
  },
  'CEO': {
    name: '토선생 회장님 🐯',
    classTitle: '토익 상사 글로벌 리더 최고 총수',
    codename: 'TOSUNI MAX LEVEL',
    description: '토익상사의 설립자이자 영단어 제국을 완전 정복한 전설 지존의 대영웅입니다.',
    item: '독일제 순금 만년필 & 사장단 전용 우주 중력 안마의자',
    passive: '황제의 위엄 (오답 소지 시 30% 확률로 출근 카드 하트 즉시 방어)',
    stats: { power: 99, speed: 99, focus: 99 },
    backColor: 'from-yellow-50 to-amber-200 border-yellow-300 text-amber-950',
    characterVisual: '👑🏅💎🐯',
    messages: [
      "“허허, 신입 인턴 시절 복사기 돌리며 어휘 공부를 하던 때가 주마등처럼 스쳐가는군!”",
      "“내 사전에 정답 반려란 없네. 전 세계 비즈니스 무대를 독점 결재 승인한 군주지!”",
      "“정광민 CEO의 AI 고문단 임원들과 특급 인공지능 전략을 매분 지휘하고 있네.”",
      "“토익 상사 임직원 전원의 명예의 전당 등극을 내 친히 재결하도록 하지!”"
    ]
  }
};

export default function MyOffice({ profile, onClockIn, onNavigate, onDrinkCoffee, onUpdateName }: MyOfficeProps) {
  const currentRankInfo = RANK_INFOS[profile.currentRank];
  const nextRank = currentRankInfo.nextTitle;
  const xpThreshold = currentRankInfo.xpRequired;
  
  // Progress ratio towards the next promotion exam
  const xpProgress = Math.min(100, (profile.totalXP / xpThreshold) * 100);
  const isEligibleForPromotion = profile.totalXP >= xpThreshold && nextRank !== null;

  const currentCharacter = CHARACTER_STATES[profile.currentRank];
  const [bubbleText, setBubbleText] = useState<string>('');
  const [isDialogueClicked, setIsDialogueClicked] = useState<boolean>(false);
  const [showCoffeeNotification, setShowCoffeeNotification] = useState<boolean>(false);

  // Name changing state parameters
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editingText, setEditingText] = useState<string>('');

  const submitNameChange = () => {
    if (editingText.trim() && onUpdateName) {
      onUpdateName(editingText.trim());
      setIsEditingName(false);
    }
  };

  // Set initial dialogue text based on rank
  useEffect(() => {
    if (currentCharacter) {
      setBubbleText(currentCharacter.messages[0]);
    }
  }, [profile.currentRank]);

  const handleTapVoice = () => {
    const list = currentCharacter.messages;
    const currentIdx = list.indexOf(bubbleText);
    const nextIdx = (currentIdx + 1) % list.length;
    setBubbleText(list[nextIdx]);
    setIsDialogueClicked(true);
    setTimeout(() => setIsDialogueClicked(false), 300);

    // Dynamic clean audio effect to reinforce gamification reward
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.15); // G5 note
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  };

  const handleOfficeCoffee = () => {
    if (profile.heartCount >= 3) {
      alert("출근 카드의 체력(❤️)이 모두 완충 상태입니다! 무분별한 믹스 카페인 연속 흡입은 지양바랍니다.");
      return;
    }
    
    if (onDrinkCoffee) {
      onDrinkCoffee();
      setShowCoffeeNotification(true);
      setTimeout(() => setShowCoffeeNotification(false), 2000);

      // Play soft coffee drinking slurping sound effect
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {}
    }
  };

  const getDayLabel = () => {
    const today = new Date();
    const list = ['일', '월', '화', '수', '목', '금', '토'];
    return `${today.getMonth() + 1}월 ${today.getDate()}일 (${list[today.getDay()]}요일)`;
  };

  return (
    <div className="space-y-4 text-slate-800 pb-4">
      {/* 1. Header Banner showing Credentials */}
      <div className="relative bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 overflow-hidden">
        {/* Decorative office background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] bg-blue-500/20 tracking-widest text-blue-400 font-mono font-black px-2.5 py-1 rounded-full uppercase border border-blue-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
              OFFICE DECK ACTIVE
            </span>
            <div className="flex gap-1 bg-slate-950/40 p-1 rounded-full border border-slate-850">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1 }}
                  animate={i < profile.heartCount ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="px-0.5"
                >
                  <Heart
                    size={13}
                    className={`transition-colors duration-300 ${
                      i < profile.heartCount ? 'fill-rose-500 text-rose-500' : 'text-slate-700 fill-transparent'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700 shadow">
              {currentRankInfo.avatar}
            </div>
            <div className="flex-1 text-left">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">현재 인사 배치</p>
              {isEditingName ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    maxLength={10}
                    placeholder="이름 입력"
                    className="bg-slate-850 text-white text-xs border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 w-28 font-bold"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        submitNameChange();
                      }
                    }}
                  />
                  <button
                    onClick={submitNameChange}
                    className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition cursor-pointer"
                    title="저장"
                  >
                    <Check size={11} />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] text-slate-300 transition cursor-pointer"
                    title="취소"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-black text-white tracking-tight leading-none">
                    {profile.userId} <span className="text-blue-400 font-extrabold">{profile.currentRank}</span>
                  </h2>
                  <button
                    onClick={() => {
                      setEditingText(profile.userId);
                      setIsEditingName(true);
                    }}
                    className="text-slate-500 hover:text-white p-0.5 rounded-lg transition cursor-pointer"
                    title="이름 수정하기"
                  >
                    <Edit3 size={11} />
                  </button>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">가산 명예 XP</p>
              <p className="text-base font-black font-mono text-emerald-400">{profile.totalXP.toLocaleString()}</p>
            </div>
          </div>

          {/* Symmetrical Blue progress meter */}
          <div className="space-y-1 pt-1 text-left">
            <div className="flex justify-between text-[10px] font-bold text-blue-300 uppercase tracking-tight">
              <span>{profile.currentRank}</span>
              {nextRank ? (
                <span>차기 승격: {nextRank}</span>
              ) : (
                <span>최고위 완결</span>
              )}
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-400 text-right italic font-mono">
              {nextRank ? `승진과 심사까지 ${Math.max(0, xpThreshold - profile.totalXP)} XP 필요` : '토익 마스터 최고 존엄'}
            </p>
          </div>
        </div>
      </div>

      {/* 1.5 🐰 NEW CHARACTER DEVELOPMENT PLATFORM AND HUB 🐰 */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-md p-5 text-left space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <span className="text-[9px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">
              {currentCharacter.codename}
            </span>
            <h3 className="font-black text-slate-900 text-base mt-1 tracking-tight">
              나의 성장 동반자 <span className="text-blue-600 font-black">{currentCharacter.name}</span>
            </h3>
          </div>
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-705 flex flex-col items-center justify-center relative shadow-lg text-2xl select-none"
          >
            <div className="absolute top-1 left-1.5 text-[8px] font-black text-blue-400 font-mono tracking-widest opacity-85">RANK</div>
            <div className="pt-2 text-center text-3xl">
              {profile.currentRank === '인턴' ? '🐰' : 
               profile.currentRank === '사원' ? '🦊' : 
               profile.currentRank === '대리' ? '🐨' : 
               profile.currentRank === '과장' ? '🦁' : '🐯'}
            </div>
          </motion.div>
        </div>

        {/* Character Visual Render Layout */}
        <div className={`p-4 rounded-3xl bg-gradient-to-br ${currentCharacter.backColor} border text-left scale-100 relative overflow-hidden transition-all duration-500 shadow-inner flex flex-col md:flex-row gap-4 items-center`}>
          <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
          
          {/* Spectacular Upgrade Visual Costume Panel */}
          <div className="w-full md:w-36 shrink-0 h-40 bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-700/60 shadow-lg select-none">
            {/* Ambient Background Glow matching the Rank */}
            {profile.currentRank === '인턴' && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.15),transparent_70%)] animate-pulse"></div>
            )}
            {profile.currentRank === '사원' && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)] animate-pulse"></div>
            )}
            {profile.currentRank === '대리' && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),transparent_70%)] animate-pulse"></div>
            )}
            {profile.currentRank === '과장' && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25),transparent_70%)] animate-pulse"></div>
            )}
            {profile.currentRank === 'CEO' && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.3),transparent_70%)]">
                <div className="absolute inset-0 bg-[linear-gradient(217deg,rgba(245,158,11,.15),rgba(139,92,246,0)_70.71%)]"></div>
              </div>
            )}

            {/* Glowing Spotlight Ray */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-40 bg-gradient-to-b from-white/10 to-transparent transform origin-top rotate-[-12deg] skew-x-12 filter blur-[2px] opacity-75 pointer-events-none"></div>

            {/* Multi-layered character decoration frames */}
            {profile.currentRank === 'CEO' && (
              <div className="absolute -inset-1 border-2 border-dashed border-amber-500/30 rounded-xl animate-spin" style={{ animationDuration: '30s' }}></div>
            )}
            {profile.currentRank === '과장' && (
              <div className="absolute inset-1.5 border border-purple-500/20 rounded-xl"></div>
            )}

            {/* Outer Level badge */}
            <div className="absolute top-2 left-2.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-slate-850 border border-slate-700 text-blue-400 font-mono tracking-widest col">
              Lvl.{profile.currentRank === '인턴' ? 1 : profile.currentRank === '사원' ? 2 : profile.currentRank === '대리' ? 3 : profile.currentRank === '과장' ? 4 : 5}
            </div>

            {/* Rotating Star sparks */}
            <div className="absolute top-2 right-2 flex gap-0.5 text-[8px] animate-pulse">
              {Array.from({ length: profile.currentRank === '인턴' ? 1 : profile.currentRank === '사원' ? 2 : profile.currentRank === '대리' ? 3 : profile.currentRank === '과장' ? 4 : 5 }).map((_, i) => (
                <span key={i}>⭐️</span>
              ))}
            </div>

            {/* Animated Character Costume Avatar */}
            <div className="relative mt-2 flex flex-col items-center">
              {/* Floating particles */}
              <AnimatePresence>
                {profile.currentRank === 'CEO' && (
                  <>
                    <motion.span animate={{ y: [-15, -35], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute text-xs pointer-events-none top-0 left-8">✨</motion.span>
                    <motion.span animate={{ y: [-10, -40], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.3 }} className="absolute text-xs pointer-events-none top-0 -left-8">💎</motion.span>
                  </>
                )}
                {profile.currentRank === '대리' && (
                  <motion.span animate={{ y: [-10, -30], opacity: [0, 1, 0], rotate: 360 }} transition={{ repeat: Infinity, duration: 1.8 }} className="absolute text-[10px] pointer-events-none top-4 left-6">💫</motion.span>
                )}
              </AnimatePresence>

              {/* Character headgear / outfits based on promotion */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Crown / Hat section */}
                {profile.currentRank === 'CEO' && (
                  <motion.span animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-xl absolute -top-5 z-20">👑</motion.span>
                )}
                {profile.currentRank === '과장' && (
                  <span className="text-base absolute -top-4 z-20">🎩</span>
                )}
                {profile.currentRank === '대리' && (
                  <span className="text-sm absolute -top-4 z-20">🎧</span>
                )}
                {profile.currentRank === '사원' && (
                  <span className="text-[11px] absolute -top-3.5 z-20">🧢</span>
                )}
                {profile.currentRank === '인턴' && (
                  <span className="text-[9px] absolute -top-3 z-20">🎓</span>
                )}

                {/* Base Animal Avatar */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-5xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] cursor-pointer"
                  title="눌러서 소통"
                  onClick={handleTapVoice}
                >
                  {profile.currentRank === '인턴' ? '🐰' : 
                   profile.currentRank === '사원' ? '🦊' : 
                   profile.currentRank === '대리' ? '🐨' : 
                   profile.currentRank === '과장' ? '🦁' : '🐯'}
                </motion.div>

                {/* Costume Outfit Badge */}
                <div className="absolute -bottom-2.5 bg-slate-950/80 border border-slate-700/80 px-2 py-0.5 rounded-full text-[8px] font-black text-white leading-none font-mono tracking-tighter shadow flex items-center gap-1 whitespace-nowrap">
                  {profile.currentRank === '인턴' && <span>👕 실습 작업복</span>}
                  {profile.currentRank === '사원' && <span className="text-blue-400">👔 사원 유니폼</span>}
                  {profile.currentRank === '대리' && <span className="text-emerald-400">🧥 스마트 블레이저</span>}
                  {profile.currentRank === '과장' && <span className="text-purple-400">🧥 명품 수트 jacket</span>}
                  {profile.currentRank === 'CEO' && <span className="text-amber-400">✨ 황제 천궁 망토</span>}
                </div>
              </div>
            </div>

            {/* Held Weapon/Item and Title */}
            <div className="absolute bottom-1 w-full text-center px-1">
              <span className="text-[8px] text-slate-400 font-extrabold truncate block">
                장비: {currentCharacter.item.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Description layout */}
          <div className="flex-1 space-y-3 z-10">
            <span className="text-[9px] font-black tracking-widest bg-white/70 text-slate-850 px-2.5 py-1 rounded-full inline-block font-mono border border-slate-950/5">
              👔 {currentCharacter.classTitle}
            </span>
            <p className="text-xs font-semibold leading-relaxed text-slate-800">
              {currentCharacter.description}
            </p>

            {/* Trait Gear Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="bg-white/40 p-2 rounded-xl border border-white/50">
                <p className="text-slate-500 font-extrabold uppercase text-[8px] tracking-wide">장착 무기 / 아이템</p>
                <p className="font-extrabold text-slate-900 truncate mt-0.5">{currentCharacter.item}</p>
              </div>
              <div className="bg-white/40 p-2 rounded-xl border border-white/50">
                <p className="text-slate-500 font-extrabold uppercase text-[8px] tracking-wide">패시브 전술 스킬</p>
                <p className="font-extrabold text-blue-900 truncate mt-0.5">{currentCharacter.passive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Character Dialogue Speech Balloon (Interactive tap) */}
        <div className="relative pt-1">
          <div className="absolute left-6 -top-2 w-3.5 h-3.5 bg-slate-900 border-l border-t border-slate-900 transform rotate-45"></div>
          <div 
            onClick={handleTapVoice}
            className={`w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] border border-slate-800 text-white rounded-2xl p-3.5 text-xs font-bold leading-relaxed cursor-pointer transition shadow-md flex items-start gap-2.5 relative select-none ${isDialogueClicked ? "scale-95" : ""}`}
            title="토순이 클릭하여 다음 대사 듣기"
          >
            <div className="w-6 h-6 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow shadow-blue-500/20">
              <Volume2 size={13} className="animate-pulse" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[11px] font-medium leading-relaxed italic text-slate-100">
                {bubbleText}
              </p>
              <span className="absolute bottom-1 right-2 text-[8px] font-black text-slate-500 font-mono flex items-center gap-0.5">
                TAP TO TALK 👉
              </span>
            </div>
          </div>
        </div>

        {/* Leveling-up Attribute Radar Meter */}
        <div className="border border-slate-100 p-3.5 rounded-2xl bg-slate-50 text-left space-y-2">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">토포스 사원 성장 기량 지표 (STATUS METER)</p>
          <div className="space-y-2">
            {/* Status bar 1: Power */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>📘 영어 어휘 기안 실무력 (Vocal Power)</span>
                <span className="font-mono text-blue-600 font-black">{currentCharacter.stats.power}/100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentCharacter.stats.power}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-blue-600 h-full rounded-full"
                ></motion.div>
              </div>
            </div>

            {/* Status bar 2: Speed */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>⚡ 결재 제출 신속 처리력 (Review Speed)</span>
                <span className="font-mono text-purple-600 font-black">{currentCharacter.stats.speed}/100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentCharacter.stats.speed}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-purple-600 h-full rounded-full"
                ></motion.div>
              </div>
            </div>

            {/* Status bar 3: Focus */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>👑 글로벌 비즈니스 리더십 (Global Leadership)</span>
                <span className="font-mono text-amber-600 font-black">{currentCharacter.stats.focus}/100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentCharacter.stats.focus}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-amber-500 h-full rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Promotion Exam Notice (Trigger Banner) */}
      {isEligibleForPromotion && (
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-gradient-to-r from-red-650 to-blue-700 text-white p-4.5 rounded-2xl shadow-xl border-2 border-amber-400 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 text-7xl opacity-10 pointer-events-none font-bold">PROMOTED</div>
          <div className="relative text-left flex justify-between items-center z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full animate-bounce">승인 완료</span>
                <span className="text-xs font-semibold text-amber-200">초고속 직위 업그레이드 기회!</span>
              </div>
              <h3 className="font-bold text-sm mt-1">{profile.currentRank} ➔ {nextRank} 승진 심사 자격 획득!</h3>
              <p className="text-[10px] text-slate-200 mt-0.5">심사를 통과하면 캐릭터의 신규 코스튬 및 추가 패시브 특전이 개방됩니다.</p>
            </div>
            <button
              onClick={() => onNavigate('exam')}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition ml-2 shrink-0 cursor-pointer"
            >
              인사심사 받기
            </button>
          </div>
        </motion.div>
      )}

      {/* 2.5 ☕ 사내 탕비실 믹스커피 무제한 충전기 (Caffeine Station) ☕ */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/60 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div className="flex-1 text-left space-y-1">
          <span className="text-[9px] bg-orange-150 text-orange-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            ☕ 사내 보행 탕비실
          </span>
          <h3 className="font-extrabold text-sm text-stone-850">인사 기안 지원용 믹스커피 머신</h3>
          <p className="text-[10px] text-stone-600 leading-normal">
            출근 카드 체력(❤️)이 모자랄 경우 회사의 일등 믹스커피 맥스웰을 타세요! 출근 카드를 즉시 최고 한도(3개)까지 만충시켜 드립니다.
          </p>
        </div>
        
        <button
          onClick={handleOfficeCoffee}
          className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold text-xs py-3 px-3 w-20 rounded-xl shadow-md transition flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Coffee size={18} className="animate-bounce" />
          <span className="text-[9px] tracking-tight">커피 완충</span>
        </button>
      </div>

      <AnimatePresence>
        {showCoffeeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-12 left-1/2 transform -translate-x-1/2 bg-slate-900/95 border border-slate-800 text-emerald-400 font-bold text-xs py-2 px-4 rounded-full shadow-2xl z-50 flex items-center gap-1.5"
          >
            <span>☕</span>
            <span>달달한 믹스커피 완료! 체력 하트 완충 완료!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Attendance Stamp Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4.5 rounded-2xl shadow-md flex justify-between items-center">
        <div className="text-left">
          <div className="flex items-center gap-1 text-[10px] text-emerald-100 opacity-90">
            <Calendar size={12} />
            <span>{getDayLabel()} 출결 결재</span>
          </div>
          <h3 className="font-bold text-sm mt-1">오늘 출근 카드 찍으셨나요?</h3>
          <p className="text-[10px] text-emerald-100 opacity-90 mt-0.5">출근 도장을 완료하는 즉시 보너스 +80 XP와 하트가 전부 충전됩니다 (하루 1회).</p>
        </div>
        <button
          onClick={onClockIn}
          className="bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 font-black text-xs py-2.5 px-3 rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <UserCheck size={14} className="animate-bounce" />
          <span>출석 도장</span>
        </button>
      </div>

      {/* 5. Business Operations List (To-Dos) */}
      <div className="space-y-3 Pt-2">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-1 text-left">오늘의 필수 승진 직무 기안 (GUIDE)</h3>
        
        <div className="space-y-3">
          {/* Task 1: Vocab Study */}
          <div
            onClick={() => onNavigate('words')}
            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all duration-200 shadow-sm cursor-pointer group hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-extrabold text-sm border border-blue-105 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shrink-0">
              01
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-slate-850 transition-colors group-hover:text-blue-600 leading-tight">
                [기안 어휘 배양] 비즈니스 핵심 보고서
              </h4>
              <p className="text-[10px] text-slate-450 mt-0.5">상황별 빈출 영단어 기명 및 짝꿍 표현 훈련</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Task 2: Quiz Engine */}
          <div
            onClick={() => onNavigate('quiz')}
            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-rose-500 transition-all duration-200 shadow-sm cursor-pointer group hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 font-extrabold text-sm border border-rose-105 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-200 shrink-0">
              02
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-slate-850 transition-colors group-hover:text-rose-600 leading-tight">
                [서류 결재] 스파르타 연속 결재 시뮬레이션
              </h4>
              <p className="text-[10px] text-slate-450 mt-0.5">반려 오답 시 하트 차감 • 퀴즈 통과 시 대량 XP 가산</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-rose-450 flex items-center justify-center shrink-0">
              <div className="w-2 h-2 bg-rose-450 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Task 3: Mistakes Review */}
          <div
            onClick={() => onNavigate('reflection')}
            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 transition-all duration-200 shadow-sm cursor-pointer group hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 bg-amber-55 rounded-xl flex items-center justify-center text-amber-600 font-extrabold text-sm border border-amber-105 group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors duration-200 shrink-0">
              ⚠️
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-slate-850 transition-colors group-hover:text-amber-600 leading-tight">
                [기밀 오답 회고록] 비밀 반성문 서류 복구
              </h4>
              <p className="text-[10px] text-slate-450 mt-0.5">자주 깎이는 망각 오류 단어의 격리 심사 및 재인증</p>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded font-mono uppercase tracking-wider shrink-0">
              Review
            </span>
          </div>

          {/* Task 4: AI Special Consultant */}
          <div
            onClick={() => onNavigate('ceo')}
            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-purple-500 transition-all duration-200 shadow-sm cursor-pointer group hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 bg-purple-55 rounded-xl flex items-center justify-center text-purple-600 font-extrabold text-sm border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200 shrink-0">
              🤖
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-slate-850 transition-colors group-hover:text-purple-600 leading-tight">
                [AI 고문 비서실] 정광민 대표이사 밀착 면담 룸
              </h4>
              <p className="text-[10px] text-slate-450 mt-0.5">대표이사 비장의 원포인트 꿀팁 인공지능 개인 과외</p>
            </div>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-bold rounded font-mono uppercase tracking-wider shrink-0">
              Special
            </span>
          </div>

          {/* Task 5: RPG Word Monster Hunt Game */}
          <div
            onClick={() => onNavigate('rpg')}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl hover:border-red-500 transition-all duration-200 shadow-md cursor-pointer group hover:-translate-y-0.5 text-white"
          >
            <div className="w-11 h-11 bg-red-950/70 rounded-xl flex items-center justify-center text-red-500 font-extrabold text-lg border border-red-900 group-hover:bg-red-650 group-hover:text-white transition-colors duration-200 shrink-0 animate-pulse">
              ⚔️
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-slate-100 group-hover:text-red-400 transition-colors leading-tight flex items-center gap-1.5">
                <span>[토익 사냥터] RPG 비즈니스 괴물 처단전</span>
                <span className="text-[8px] bg-red-500 px-1.5 py-0.2 rounded text-white uppercase font-black tracking-wider animate-bounce font-mono">RPG</span>
              </h4>
              <p className="text-[10px] text-indigo-200 mt-0.5">배운 단어를 칼과 도장 무기로 무장해 비즈니스 에러 몬스터 사냥!</p>
            </div>
            <span className="px-2 py-0.5 bg-red-950 text-red-400 text-[8px] font-black rounded border border-red-900 font-mono uppercase tracking-wider shrink-0">
              Battle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
