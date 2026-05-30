/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, TOEICWord, IncorrectWord } from './types';
import { INSTANT_TOEIC_WORDS } from './data/words';
import DeskTable from './components/DeskTable';
import MyOffice from './components/MyOffice';
import WorkReport from './components/WorkReport';
import QuizConsole from './components/QuizConsole';
import ReflectionNotes from './components/ReflectionNotes';
import PromotionExam from './components/PromotionExam';
import CeoChat from './components/CeoChat';
import WordGameRPG from './components/WordGameRPG';
import { Briefcase, BookOpen, Layers, ClipboardCheck, MessageCircle, RefreshCw, Swords } from 'lucide-react';

const PROFILE_KEY = 'TOEIC_CORP_USER_PROFILE_V1';
const INCORRECT_KEY = 'TOEIC_CORP_INCORRECT_V1';
const WORDS_KEY = 'TOEIC_CORP_WORDS_V1';
const BOOKMARKS_KEY = 'TOEIC_CORP_BOOKMARKS_V1';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>({
    userId: "김인턴",
    currentRank: "인턴",
    totalXP: 0,
    heartCount: 3,
    lastCheckedIn: "",
    dailyCompletedCount: 0,
    quizCount: 0
  });

  const [registeredWords, setRegisteredWords] = useState<TOEICWord[]>(INSTANT_TOEIC_WORDS);
  const [incorrectWords, setIncorrectWords] = useState<IncorrectWord[]>([]);
  const [bookmarkedWordIds, setBookmarkedWordIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'office' | 'words' | 'quiz' | 'reflection' | 'ceo' | 'exam' | 'rpg'>('office');

  // Trigger floating XP indicator bubbles
  const [floatingXp, setFloatingXp] = useState<string | null>(null);

  // Initialize and load persistent data
  useEffect(() => {
    // 1. Load User Profile
    const localProfile = localStorage.getItem(PROFILE_KEY);
    if (localProfile) {
      try {
        setProfile(JSON.parse(localProfile));
      } catch (e) {
        console.error("Failed to parse local profile:", e);
      }
    }

    // 2. Load custom added vocabulary
    const localWords = localStorage.getItem(WORDS_KEY);
    if (localWords) {
      try {
        setRegisteredWords(JSON.parse(localWords));
      } catch (e) {
        console.error("Failed to parse local vocabulary:", e);
      }
    }

    // 3. Load incorrect notes list
    const localIncorrect = localStorage.getItem(INCORRECT_KEY);
    if (localIncorrect) {
      try {
        setIncorrectWords(JSON.parse(localIncorrect));
      } catch (e) {
        console.error("Failed to parse local mistakes:", e);
      }
    }

    // 4. Load bookmarked word IDs
    const localBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    if (localBookmarks) {
      try {
        setBookmarkedWordIds(JSON.parse(localBookmarks));
      } catch (e) {
        console.error("Failed to parse bookmarks:", e);
      }
    }
  }, []);

  // Sync profile storage changes
  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  };

  // State manipulation triggers: Add user experience (XP)
  const handleAddXP = (xp: number) => {
    const updatedProfile = {
      ...profile,
      totalXP: profile.totalXP + xp
    };
    saveProfile(updatedProfile);

    // Trigger visual popup bubble
    setFloatingXp(`+${xp} XP`);
    setTimeout(() => {
      setFloatingXp(null);
    }, 1500);
  };

  // State manipulation: deduct hear count on failure
  const handleDeductHeart = () => {
    const updatedProfile = {
      ...profile,
      heartCount: Math.max(0, profile.heartCount - 1)
    };
    saveProfile(updatedProfile);
  };

  // State manipulation: Clock-in/Check-in daily
  const handleClockIn = () => {
    const todayLabel = new Date().toDateString();
    if (profile.lastCheckedIn === todayLabel) {
      alert("출근 도장은 하루에 한 번만 찍을 수 있습니다! 내일 다시 출근해 주세요.");
      return;
    }

    const updatedProfile = {
      ...profile,
      heartCount: 3,
      lastCheckedIn: todayLabel
    };
    saveProfile(updatedProfile);
    handleAddXP(80); // +80 XP bonus daily check-in
    alert("📢 오늘도 성실하게 출근 완료! 출근 지원금 +80 XP 및 Hearts가 모두 완충되었습니다.");
  };

  // Directly drink coffee from container layout
  const handleDrinkCoffeeAndRestore = () => {
    const updatedProfile = {
      ...profile,
      heartCount: 3
    };
    saveProfile(updatedProfile);
  };

  // Words recommendation registration
  const handleAddNewWord = (newWord: TOEICWord) => {
    const updatedList = [...registeredWords, newWord];
    setRegisteredWords(updatedList);
    localStorage.setItem(WORDS_KEY, JSON.stringify(updatedList));
  };

  // Incorrect vocabulary list management
  const handleAddIncorrectWord = (wordId: number) => {
    const extant = incorrectWords.find(item => item.wordId === wordId);
    let updated: IncorrectWord[];

    if (extant) {
      updated = incorrectWords.map(item =>
        item.wordId === wordId
          ? { ...item, wrongCount: item.wrongCount + 1 }
          : item
      );
    } else {
      updated = [
        ...incorrectWords,
        {
          wordId,
          wrongCount: 1,
          addedAt: new Date().toISOString(),
          reviewCount: 0
        }
      ];
    }
    setIncorrectWords(updated);
    localStorage.setItem(INCORRECT_KEY, JSON.stringify(updated));
  };

  const handleRemoveIncorrectWord = (wordId: number) => {
    const updated = incorrectWords.filter(item => item.wordId !== wordId);
    setIncorrectWords(updated);
    localStorage.setItem(INCORRECT_KEY, JSON.stringify(updated));
  };

  // Toggle Bookmark logic
  const handleToggleBookmark = (wordId: number) => {
    setBookmarkedWordIds(prev => {
      const updated = prev.includes(wordId)
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Execute promotion level up
  const handlePromote = (newRank: typeof profile.currentRank) => {
    const updatedProfile = {
      ...profile,
      currentRank: newRank,
      heartCount: 3 // auto refill
    };
    saveProfile(updatedProfile);
  };

  const handleResetHearts = () => {
    const updatedProfile = {
      ...profile,
      heartCount: 3
    };
    saveProfile(updatedProfile);
  };

  // Clear data and restart the career
  const handleResetCareer = () => {
    if (confirm("정말로 신입 사원의 이력과 경험치를 소멸시키고 인턴부터 다시 재입사하시겠습니까? (이력 삭제)")) {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(WORDS_KEY);
      localStorage.removeItem(INCORRECT_KEY);
      localStorage.removeItem(BOOKMARKS_KEY);
      window.location.reload();
    }
  };

  // Direct change of the profile username
  const handleUpdateName = (newName: string) => {
    if (!newName.trim()) return;
    const updatedProfile = {
      ...profile,
      userId: newName.trim()
    };
    saveProfile(updatedProfile);
  };

  return (
    <DeskTable
      heartCount={profile.heartCount}
      onDrinkCoffee={handleDrinkCoffeeAndRestore}
      xpPoints={profile.totalXP}
      completedQuizzCount={profile.quizCount}
    >
      {/* 1. App Top Nav Bar Header inside Phone wrapper */}
      <div className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('office')}>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-md shadow-blue-200">
            TC
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-sm text-slate-800 leading-none">TOEIC CORP.</span>
            <span className="text-[8px] font-bold text-slate-400 tracking-widest mt-0.5 uppercase">LTD. ENTERPRISE</span>
          </div>
        </div>

        {/* Dynamic Heart pill inside premium header */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 shadow-sm animate-pulse">
            <span className="text-rose-500 text-[11px]">❤️</span>
            <span className="font-bold text-rose-600 text-xs font-mono">{profile.heartCount}/3</span>
          </div>

          {/* Cumulative XP score */}
          <div className="relative">
            <span className="text-[10px] bg-slate-900 text-slate-100 py-1 px-2.5 rounded-full font-bold font-mono border border-slate-800 shadow-sm select-none">
              {profile.totalXP} XP
            </span>
            {floatingXp && (
              <span className="absolute -bottom-6 right-2 text-xs text-blue-600 font-extrabold animate-bounce font-mono">
                {floatingXp}
              </span>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetCareer}
            className="text-slate-300 hover:text-rose-500 p-0.5 rounded-full transition"
            title="인사 이력 초기화"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body Contents container */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 scrollbar-hide text-left">
        {activeTab === 'office' && (
          <MyOffice
            profile={profile}
            onClockIn={handleClockIn}
            onNavigate={setActiveTab}
            onDrinkCoffee={handleDrinkCoffeeAndRestore}
            onUpdateName={handleUpdateName}
          />
        )}

        {activeTab === 'words' && (
          <WorkReport
            currentRank={profile.currentRank}
            onAddXP={handleAddXP}
            registeredWords={registeredWords}
            onAddNewWord={handleAddNewWord}
            bookmarkedWordIds={bookmarkedWordIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizConsole
            currentRank={profile.currentRank}
            heartCount={profile.heartCount}
            registeredWords={registeredWords}
            onAddXP={handleAddXP}
            onDeductHeart={handleDeductHeart}
            onAddIncorrectWord={handleAddIncorrectWord}
            onNavigate={setActiveTab}
            onResetHearts={handleResetHearts}
          />
        )}

        {activeTab === 'reflection' && (
          <ReflectionNotes
            incorrectWords={incorrectWords}
            registeredWords={registeredWords}
            onRemoveIncorrectWord={handleRemoveIncorrectWord}
            onAddXP={handleAddXP}
          />
        )}

        {activeTab === 'ceo' && (
          <CeoChat
            currentRank={profile.currentRank}
            totalXP={profile.totalXP}
          />
        )}

        {activeTab === 'exam' && (
          <PromotionExam
            currentRank={profile.currentRank}
            registeredWords={registeredWords}
            onPromote={handlePromote}
            onAddXP={handleAddXP}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'rpg' && (
          <WordGameRPG
            currentRank={profile.currentRank}
            registeredWords={registeredWords}
            username={profile.userId}
            onAddXP={handleAddXP}
            onAddIncorrectWord={handleAddIncorrectWord}
          />
        )}
      </div>

      {/* 3. Bottom Device Tab Bar Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-150 py-1.5 px-2 flex justify-around items-center z-30">
        <button
          onClick={() => setActiveTab('office')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'office' ? 'text-blue-600 font-extrabold animate-pulse' : 'text-slate-400 hover:text-slate-500'
          }`}
        >
          <Briefcase size={16} />
          <span className="text-[9px] mt-1 font-bold">집무실</span>
        </button>

        <button
          onClick={() => setActiveTab('words')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'words' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-500'
          }`}
        >
          <BookOpen size={16} />
          <span className="text-[9px] mt-1 font-bold">업무보고</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'quiz' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-500'
          }`}
        >
          <ClipboardCheck size={16} />
          <span className="text-[9px] mt-1 font-bold">서류결재</span>
        </button>

        <button
          onClick={() => setActiveTab('reflection')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'reflection' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-500'
          }`}
        >
          <Layers size={16} />
          <span className="text-[9px] mt-1 font-bold">반성문</span>
        </button>

        <button
          onClick={() => setActiveTab('ceo')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'ceo' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-500'
          }`}
        >
          <MessageCircle size={16} />
          <span className="text-[9px] mt-1 font-bold">AI특집</span>
        </button>

        <button
          onClick={() => setActiveTab('rpg')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'rpg' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-500'
          }`}
        >
          <Swords size={16} className={activeTab === 'rpg' ? 'animate-bounce text-red-500' : ''} />
          <span className="text-[9px] mt-1 font-bold">사냥터 (RPG)</span>
        </button>
      </div>
    </DeskTable>
  );
}
