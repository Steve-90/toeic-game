/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, 
  Shield, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Trophy, 
  Coffee, 
  Zap, 
  BookOpen, 
  ChevronRight,
  Skull,
  Award,
  Volume2
} from 'lucide-react';
import { TOEICWord, Rank } from '../types';
import { RANK_INFOS } from '../data/words';
import { motion, AnimatePresence } from 'motion/react';

interface WordGameRPGProps {
  currentRank: Rank;
  registeredWords: TOEICWord[];
  username: string;
  onAddXP: (xp: number) => void;
  onAddIncorrectWord: (wordId: number) => void;
}

// Monster configuration blueprints
interface Monster {
  name: string;
  emoji: string;
  maxHp: number;
  currentHp: number;
  level: number;
  attackName: string;
  backColor: string;
  description: string;
}

const MONSTER_BLUEPRINTS = [
  { name: '마감기한 골렘 (Deadline Golem)', emoji: '👺', maxHp: 80, attackName: '무차별 독촉장 발송', backColor: 'from-slate-800 to-red-950', description: '매 정시마다 독촉 이메일을 전송하여 정신력을 깎아먹는 괴물입니다.' },
  { name: '메일수신 불발 슬라임 (Fail-Mail Slime)', emoji: '👾', maxHp: 100, attackName: '반송 메일 에러 테러', backColor: 'from-slate-800 to-blue-950', description: '메일 주소 오타를 유도하여 서버에 에러 트래픽 폭탄을 먹입니다.' },
  { name: '반려 가고일 (Rejection Gargoyle)', emoji: '🐉', maxHp: 120, attackName: '서류 즉시 반려 레이저', backColor: 'from-slate-800 to-purple-950', description: '모든 완벽한 기서안을 한글 자간이 틀렸다는 이유로 반송합니다.' },
  { name: '야근 잔업 가고일 (Night Shift Specter)', emoji: '💀', maxHp: 150, attackName: '끝나지 않는 영혼 퇴근 지연', backColor: 'from-slate-900 to-amber-950', description: '밤 10시 정각에 신착 업무 메일 14건을 수신함에 밀어 넣습니다.' },
  { name: '서버 에러 블랙드래곤 (Server Down Dragon)', emoji: '🦖', maxHp: 200, attackName: '클라우드 연쇄 먹통 파이어', backColor: 'from-zinc-900 to-rose-950', description: '비즈니스 결재 망을 완전 마비시키는 최종 보스급 네트워크 폭군입니다.' }
];

export default function WordGameRPG({ 
  currentRank, 
  registeredWords, 
  username, 
  onAddXP, 
  onAddIncorrectWord 
}: WordGameRPGProps) {
  // Use words appropriate to or below current rank level
  const eligibleWords = registeredWords.filter(w => {
    const rankOrder: Rank[] = ['인턴', '사원', '대리', '과장', 'CEO'];
    const currentOrderIdx = rankOrder.indexOf(currentRank);
    const wordOrderIdx = rankOrder.indexOf(w.rank_level);
    return wordOrderIdx <= currentOrderIdx;
  });

  // RPG stats state
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMaxHp] = useState<number>(100);
  const [playerMp, setPlayerMp] = useState<number>(0); // Mana/Skill Points (0 to 100)
  const [stageLevel, setStageLevel] = useState<number>(1);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // Active monster state
  const [monster, setMonster] = useState<Monster | null>(null);

  // Active combat round state
  const [activeWord, setActiveWord] = useState<TOEICWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctIdx, setCorrectIdx] = useState<number>(-1);
  const [answeredIdx, setAnsweredIdx] = useState<number | null>(null);
  const [timerCount, setTimerCount] = useState<number>(10);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  
  // Audio & Animation states
  const [playerAttackType, setPlayerAttackType] = useState<'normal' | 'skill' | 'idle'>('idle');
  const [monsterAttackType, setMonsterAttackType] = useState<'attack' | 'idle'>('idle');
  const [damagePopup, setDamagePopup] = useState<{ amount: number; isPlayer: boolean } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Character metadata matching actual MyOffice.tsx definition
  const characterEmojiMap: Record<Rank, string> = {
    '인턴': '🐰',
    '사원': '🦊',
    '대리': '🐨',
    '과장': '🦁',
    'CEO': '🐯'
  };

  const weaponMap: Record<Rank, string> = {
    '인턴': '연필과 지우개 ✏️',
    '사원': '네이비 정직원 사원증 📛',
    '대리': '아이스 아메리카노 텀블러 🥤',
    '과장': '명품 만년필과 직인 도장 ✒️',
    'CEO': '순금 프레지던트 결재인 💎'
  };

  const skillNameMap: Record<Rank, string> = {
    '인턴': '필기 복사 연타 소환! 📄',
    '사원': '동기 부여 정시퇴근 스트라이크! ⚡',
    '대리': '수입 통관 전권 단호박 메일 폭격! 📨',
    '과장': '반려 사유 직인 대포! 🌋',
    'CEO': '최고 존엄 예산 승인 썬더볼트! ⚡💎🐯'
  };

  // 1. Initial Spawning of Monster
  useEffect(() => {
    spawnMonster(1);
    addLog(`🎮 ${username} ${currentRank}님이 토익 RPG 던전에 진입하셨습니다!`);
  }, [currentRank]);

  // 2. Loop & spawn game round words
  useEffect(() => {
    if (monster && monster.currentHp > 0 && !isGameOver) {
      nextRound();
    }
  }, [monster?.level, gamesPlayed]);

  // 3. Countdown timer logic
  useEffect(() => {
    if (answeredIdx !== null || isGameOver || !activeWord) return;

    if (timerCount <= 0) {
      handleTimeout();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimerCount(prev => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerCount, answeredIdx, isGameOver, activeWord]);

  // Spawn monster Helper
  const spawnMonster = (lvl: number) => {
    const blueprintIndex = (lvl - 1) % MONSTER_BLUEPRINTS.length;
    const bp = MONSTER_BLUEPRINTS[blueprintIndex];
    // Scale HP and Difficulty according to level multiplier
    const scaledMaxHp = bp.maxHp + (lvl - 1) * 35;
    
    setMonster({
      name: bp.name,
      emoji: bp.emoji,
      maxHp: scaledMaxHp,
      currentHp: scaledMaxHp,
      level: lvl,
      attackName: bp.attackName,
      backColor: bp.backColor,
      description: bp.description
    });
    setStageLevel(lvl);
  };

  // Add Log helper
  const addLog = (log: string) => {
    setBattleLogs(prev => [log, ...prev].slice(0, 8)); // keep last 8 logs
  };

  // Spawns vocabulary round
  const nextRound = () => {
    if (eligibleWords.length === 0) {
      addLog("⚠️ 결재할 단어 서류가 소진되었습니다!");
      return;
    }

    // Pick random target word
    const targetWord = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
    setActiveWord(targetWord);
    setAnsweredIdx(null);
    setTimerCount(10);

    // Pick distractors
    const pool = eligibleWords.filter(w => w.id !== targetWord.id);
    const distractors = pool
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning);

    while (distractors.length < 3) {
      distractors.push('업무 연장 지침');
    }

    const shuffledOptions = [targetWord.meaning, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(shuffledOptions);
    setCorrectIdx(shuffledOptions.indexOf(targetWord.meaning));
  };

  const handleTimeout = () => {
    if (isGameOver || !activeWord) return;
    setAnsweredIdx(-99); // Flag timeout
    triggerMonsterAttack("마감 초과 회피 불능 공습!");
  };

  // TTS pronounce
  const handlePronounce = () => {
    if (activeWord && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeWord.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Attack handler
  const handleAttackOption = (selectedIdx: number) => {
    if (answeredIdx !== null || !monster || !activeWord) return;
    setAnsweredIdx(selectedIdx);

    const isCorrect = selectedIdx === correctIdx;

    if (isCorrect) {
      // Player Strikes! Damage calculation depends on word hardness or rank
      let damage = 25 + Math.floor(Math.random() * 10);
      let isCritical = Math.random() < 0.25;
      if (isCritical) {
        damage = Math.floor(damage * 1.5);
      }

      // Add special SP/mana points
      const spEarned = 25;
      const nextMp = Math.min(100, playerMp + spEarned);
      setPlayerMp(nextMp);

      // Trigger critical animation or normal animation
      setPlayerAttackType(isCritical ? 'skill' : 'normal');
      setDamagePopup({ amount: damage, isPlayer: false });

      // Apply damage to Monster
      const nextHp = Math.max(0, monster.currentHp - damage);
      setMonster(prev => prev ? { ...prev, currentHp: nextHp } : null);

      addLog(`✨ 정답! [${activeWord.word}] -> '${activeWord.meaning}'`);
      addLog(`⚔️ ${characterEmojiMap[currentRank]} ${username}님이 [${weaponMap[currentRank]}]로 공격! ${isCritical ? '💥치명타!!! ' : ''}-${damage} HP 피해!`);

      // Read audio
      handlePronounce();

      // Check if monster died
      if (nextHp <= 0) {
        setTimeout(() => {
          handleMonsterDefeat();
        }, 1200);
      } else {
        // Monster survive check - proceed to next rounds shortly
        setTimeout(() => {
          setPlayerAttackType('idle');
          setDamagePopup(null);
          setGamesPlayed(prev => prev + 1);
        }, 1500);
      }
    } else {
      // Wrong Answer!
      // Add word to incorrect list so player will review it later!
      onAddIncorrectWord(activeWord.id);
      
      addLog(`❌ 틀렸습니다! [${activeWord.word}]의 실제 뜻은 '${activeWord.meaning}'입니다.`);
      triggerMonsterAttack(monster.attackName);
    }
  };

  // Monster counter strike
  const triggerMonsterAttack = (attackName: string) => {
    if (!monster) return;
    setMonsterAttackType('attack');
    
    // Damage scaling with stage level
    const baseDamage = 15;
    const scalingDamage = (stageLevel - 1) * 3;
    const monsterDmg = baseDamage + scalingDamage + Math.floor(Math.random() * 8);

    setDamagePopup({ amount: monsterDmg, isPlayer: true });

    const nextPlayerHp = Math.max(0, playerHp - monsterDmg);
    setPlayerHp(nextPlayerHp);

    addLog(`☣️ [${monster.emoji} ${monster.name}]의 카운터 어택! '[${attackName}]' 폭렬!! -${monsterDmg} HP 피격!`);

    if (nextPlayerHp <= 0) {
      setTimeout(() => {
        setIsGameOver(true);
        addLog(`💀 ${username}님이 야근 피로로 과로사(기절) 하였습니다... ☕ 커피 수혈이 시급합니다!`);
      }, 1000);
    } else {
      setTimeout(() => {
        setMonsterAttackType('idle');
        setDamagePopup(null);
        setGamesPlayed(prev => prev + 1);
      }, 1500);
    }
  };

  // Monster Defeated trigger
  const handleMonsterDefeat = () => {
    if (!monster) return;
    const goldBonus = 50 + stageLevel * 10;
    const xpReward = 30 + stageLevel * 5;

    setScore(prev => prev + goldBonus);
    onAddXP(xpReward);

    addLog(`🎉 축하합니다! ${monster.emoji} [${monster.name}] 완벽 퇴치 성공!`);
    addLog(`💎 상여금 보너스 +${goldBonus}원 획득! 명예 가산점 +${xpReward} XP 취득!`);

    setPlayerAttackType('idle');
    setDamagePopup(null);

    // Spawn next monster
    setTimeout(() => {
      spawnMonster(stageLevel + 1);
    }, 1000);
  };

  // Ultimate Skill Attack
  const handleUltimateSkill = () => {
    if (playerMp < 100 || answeredIdx !== null || !monster || isGameOver) return;
    
    // Consume MP
    setPlayerMp(0);
    setPlayerAttackType('skill');

    // Massive damage
    const ultDamage = 80 + Math.floor(Math.random() * 40);
    setDamagePopup({ amount: ultDamage, isPlayer: false });

    // Apply
    const nextHp = Math.max(0, monster.currentHp - ultDamage);
    setMonster(prev => prev ? { ...prev, currentHp: nextHp } : null);

    addLog(`⚡🔥 [${skillNameMap[currentRank]}] 소환 폭음!!!`);
    addLog(`👑 ${characterEmojiMap[currentRank]} 전직급 수뇌 공격 개진! ${monster.emoji}의 내부 시스템을 완전 결재 붕괴시킵니다! -${ultDamage} HP 피해!`);

    if (nextHp <= 0) {
      setTimeout(() => {
        handleMonsterDefeat();
      }, 1200);
    } else {
      setTimeout(() => {
        setPlayerAttackType('idle');
        setDamagePopup(null);
        setGamesPlayed(prev => prev + 1);
      }, 1500);
    }
  };

  // Revive player / Recover Hp
  const handleHealWithCoffee = () => {
    setPlayerHp(100);
    setPlayerMp(30); // give some starting mana
    setIsGameOver(false);
    setAnsweredIdx(null);
    setTimerCount(10);
    addLog("☕ 핫 아메리카노 커피 원액 주입 완료! HP가 100% 한계 각성 완충되었습니다.");
    nextRound();
  };

  // Total Reset
  const handleRetreat = () => {
    setPlayerHp(100);
    setPlayerMp(0);
    setScore(0);
    spawnMonster(1);
    setIsGameOver(false);
    addLog("🏹 던전 로비로 후퇴하여 무기 전력을 재정비했습니다.");
  };

  return (
    <div className="space-y-4 font-sans text-left">
      {/* Dynamic Upper Intro */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-wider uppercase font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono animate-pulse">
              LIVE BATTLE
            </span>
            <span className="text-[11px] font-semibold text-slate-400">사무실의 영웅 대결</span>
          </div>
          <h3 className="text-sm font-black text-white">👾 실전 토익 소탕 작전 (RPG Word Slasher)</h3>
          <p className="text-[10px] text-slate-400">
            결재한 영단어들로 결재 파워를 충전해 업무를 망치려는 괴물을 검투 사냥해 보세요! 
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-slate-500 font-bold">TOTAL SCORE</span>
          <span className="text-xs font-black text-amber-400 font-mono">₩{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Battle Arena Section */}
      <div className="bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl relative min-h-[290px] flex flex-col justify-between">
        {/* Sky background layer with level indicator */}
        <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none"></div>

        {/* Level / Area info board */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800/60 flex justify-between items-center z-10 text-[9px] font-mono tracking-wider font-extrabold text-blue-400">
          <span>STAGE AREA.0{stageLevel}</span>
          <span className="text-amber-400 flex items-center gap-1">
            <Trophy size={10} />
            <span>최대 결 수: {stageLevel - 1}마리 돌파 완료</span>
          </span>
        </div>

        {/* Visual Combat Stage (Arena Display) */}
        <div className="flex-1 p-5 grid grid-cols-2 items-center justify-center gap-6 relative select-none z-10">
          {/* Floating Damage Popup overlay */}
          <AnimatePresence>
            {damagePopup && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: -25, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute left-1/2 top-10 -translate-x-1/2 font-black text-xl z-30 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] filter ${
                  damagePopup.isPlayer ? 'text-red-500 font-serif' : 'text-amber-400 font-mono animate-bounce'
                }`}
              >
                💢 {damagePopup.isPlayer ? `피해! -${damagePopup.amount} HP` : `CRITICAL! -${damagePopup.amount} HP`}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player (Hero) Character Box */}
          <div className="flex flex-col items-center space-y-2 justify-center h-full relative">
            <div className="text-[9px] text-slate-400 font-bold bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/80">
              {username} ({currentRank})
            </div>

            {/* Render with combat attack translations */}
            <motion.div
              animate={
                playerAttackType === 'normal' 
                  ? { x: [0, 45, -20, 0], scale: [1, 1.1, 1, 1] } 
                  : playerAttackType === 'skill'
                  ? { y: [0, -35, 15, 0], rotate: [0, 360, 0], scale: [1, 1.25, 0.95, 1] }
                  : { y: [0, -3, 0] }
              }
              transition={{ repeat: playerAttackType === 'idle' ? Infinity : 0, duration: playerAttackType === 'idle' ? 2 : 0.6 }}
              className="text-6xl relative"
            >
              {characterEmojiMap[currentRank]}
              
              {/* Charge FX or visual indicator */}
              {playerMp >= 100 && (
                <div className="absolute -inset-2 border border-yellow-400 rounded-full animate-ping opacity-60"></div>
              )}
            </motion.div>

            {/* HP and SP Progress Bar Layout */}
            <div className="w-28 space-y-1">
              {/* HP Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold">
                  <span>정신력 (HP)</span>
                  <span className={playerHp <= 30 ? "text-red-500 animate-pulse font-extrabold" : "text-white"}>{playerHp}/{playerMaxHp}</span>
                </div>
                <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      playerHp <= 30 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Mana Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-[8px] text-slate-450 font-bold">
                  <span>결재 전력 (SP)</span>
                  <span className="text-blue-400">{playerMp}/100</span>
                </div>
                <div className="w-full bg-slate-850 h-1 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${playerMp}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Monster (Enemy) Box */}
          {monster && (
            <div className="flex flex-col items-center space-y-2 justify-center h-full border-l border-slate-900/60 pl-4">
              <div className="text-[9px] text-slate-400 font-bold bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/80 max-w-[130px] truncate">
                Lvl.{monster.level} {monster.name.split(' ')[0]}
              </div>

              <motion.div
                animate={
                  monsterAttackType === 'attack'
                    ? { x: [0, -45, 10, 0] }
                    : { scale: [1, 1.04, 1] }
                }
                transition={{ repeat: monsterAttackType === 'idle' ? Infinity : 0, duration: 1.8 }}
                className="text-6.5xl drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)]"
              >
                {monster.emoji}
              </motion.div>

              {/* Monster HP bar */}
              <div className="w-28 space-y-0.5">
                <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold">
                  <span>괴물 HP</span>
                  <span className="text-red-400 font-mono">{monster.currentHp}/{monster.maxHp}</span>
                </div>
                <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${(monster.currentHp / monster.maxHp) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[8px] text-slate-500 leading-none truncate text-center pt-0.5">{monster.description.slice(0, 15)}...</p>
              </div>
            </div>
          )}
        </div>

        {/* Realtime Action Logs display */}
        <div className="p-3 bg-slate-900/40 border-t border-slate-900/70 text-[9px] font-mono whitespace-nowrap overflow-x-auto text-slate-300 space-y-0.5 min-h-16 flex flex-col justify-end">
          {battleLogs.slice(0, 3).reverse().map((log, logI) => (
            <div key={logI} className="truncate">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center shadow-2xl text-white space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center mx-auto text-3xl">
              💀
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-red-400">KO! 서류 피로로 인한 실신 상태</h4>
              <p className="text-[10px] text-slate-405 leading-relaxed max-w-xs mx-auto">
                업무량의 지속적인 압박과 기한 만료 수치로 머리가 마비되었습니다! 탕비실 커피 긴급 원액 수혈을 하거나 로비로 후퇴해야 합니다.
              </p>
            </div>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={handleHealWithCoffee}
                className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Coffee size={13} />
                <span>커피 원액 수혈 회복</span>
              </button>
              <button
                onClick={handleRetreat}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[11px] py-2.5 px-4 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>기밀 던전 1단계 퇴각</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Question Panel */}
      {!isGameOver && activeWord && (
        <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm space-y-3">
          {/* Header & timer countdown */}
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-slate-800 font-mono">TARGET APPLICANT:</span>
              <span className="text-blue-600 font-black text-xs font-sans tracking-wide underline decoration-wavy">{activeWord.word}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-450 font-mono font-bold">
              <span>시간 제한:</span>
              <span className={`font-black text-xs ${timerCount <= 3 ? 'text-red-500 animate-ping font-mono' : 'text-slate-800'}`}>
                {timerCount}s
              </span>
            </div>
          </div>

          {/* Target translation trigger banner */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center relative">
            <div className="space-y-0.5">
              <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase font-mono block">회사 실무 핵심 타겟</span>
              <p className="text-xl font-black text-slate-900 tracking-tight">{activeWord.word}</p>
            </div>
            <button
              onClick={handlePronounce}
              className="p-2 bg-white text-slate-650 hover:text-blue-600 border border-slate-205 rounded-full shadow-xs transition cursor-pointer"
              title="발음 듣기"
            >
              <Volume2 size={15} />
            </button>
          </div>

          {/* Combat Actions (4 choice options) */}
          <div className="space-y-1.5">
            <span className="text-[8px] pl-0.5 font-black tracking-widest text-slate-400 block uppercase">공격 기안 대안 선택 (COMMENCE COMBAT)</span>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${answeredIdx !== null ? 'pointer-events-none' : ''}`}>
              {options.map((opt, optI) => {
                let btnStyle = "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";

                if (answeredIdx !== null) {
                  if (optI === correctIdx) {
                    btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                  } else if (optI === answeredIdx) {
                    btnStyle = "bg-red-50 border-red-301 text-red-800 font-bold";
                  } else {
                    btnStyle = "bg-slate-50/55 text-slate-300 border-slate-100 opacity-55";
                  }
                }

                return (
                  <button
                    key={optI}
                    disabled={answeredIdx !== null}
                    onClick={() => handleAttackOption(optI)}
                    className={`w-full p-3 border rounded-xl text-[11px] font-bold text-left transition duration-150 flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {answeredIdx !== null && optI === correctIdx && (
                      <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 rounded uppercase font-black font-mono">strike</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ultimate Charge button */}
          <div className="pt-1.5 border-t border-slate-100 flex gap-2">
            <button
              disabled={playerMp < 100 || answeredIdx !== null}
              onClick={handleUltimateSkill}
              className={`w-full py-2.5 px-4 rounded-xl text-[11px] font-black transition duration-200 flex items-center justify-center gap-2 cursor-pointer border ${
                playerMp >= 100 && answeredIdx === null
                  ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:scale-[1.02] border-yellow-400 text-white shadow-lg animate-pulse'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <Zap size={11} className={playerMp >= 100 ? "text-white fill-current" : "text-slate-350"} />
              <span>직급 필살 전체 기안 폭기 대포 (ULTIMATE SKILL)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
