/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, ChevronRight, CornerDownRight, MessageSquare, Briefcase } from 'lucide-react';
import { Rank } from '../types';

interface Message {
  sender: 'user' | 'ceo';
  text: string;
  time: string;
}

interface CeoChatProps {
  currentRank: Rank;
  totalXP: number;
}

export default function CeoChat({ currentRank, totalXP }: CeoChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ceo',
      text: `이봐, ${currentRank}! 내가 바로 토익상사의 대표이사 정광민 사장이야. 단어 공부는 제대로 하고 있는 건가? 모르는 단어가 있거나, 비즈니스 영어 팁이 필요하면 언제든 나에게 결재 서류 올리듯이 메시지 보내게. 아주 친절하게(?) 피드백을 줄 테니!`,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const timeStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMsg,
      time: timeStr
    }]);

    setLoading(true);

    try {
      const response = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userRank: currentRank,
          totalXP: totalXP
        })
      });
      const data = await response.json();
      
      const reply = data.result || "음, 결재 보고가 늦는군. 네트워크 상태를 다시 기안해보게나.";
      
      setMessages(prev => [...prev, {
        sender: 'ceo',
        text: reply,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ceo',
        text: "사무실 통신망에 장애가 있군. 잠시 후에 다시 보고하게!",
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl border border-slate-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-3xl">👔</span>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping"></span>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-100">정광민 대표이사</span>
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">CEO</span>
            </div>
            <p className="text-[11px] text-slate-300">토익상사 직속 족집게 코칭 룸</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-black/30 px-2 py-1 rounded">
          <Briefcase size={12} className="text-amber-500" />
          <span>내 직급: {currentRank}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 font-sans text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Profile Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm border border-slate-700">
                {msg.sender === 'user' ? '👤' : '👔'}
              </div>

              {/* Speech bubble */}
              <div>
                <div className={`text-[11px] text-slate-400 mb-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {msg.sender === 'user' ? '나 (신청자)' : '정광민 사장'}
                </div>
                <div className={`p-3 rounded-2xl whitespace-pre-line leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <div className={`text-[10px] text-slate-500 mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm border border-slate-700">
                👔
              </div>
              <div>
                <div className="text-[11px] text-slate-400 mb-1">정광민 사장</div>
                <div className="p-3 bg-slate-800 rounded-2xl rounded-tl-none border border-slate-700 text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs">기안서 결재 검토 중...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="사장님께 토익 전치사, 자동사, 팁 등을 질문하세요..."
          className="flex-1 bg-slate-950 text-white text-xs border border-slate-700 rounded-xl px-4 py-3 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-900"
          disabled={loading || !input.trim()}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
