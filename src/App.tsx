/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import confetti from 'canvas-confetti';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Users, 
  FileText, 
  CheckSquare, 
  TrendingUp,
  MessageSquare,
  PlayCircle,
  Award,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  MousePointer2
} from 'lucide-react';

// --- Types ---

type SlideType = 'content' | 'mcq' | 'scenario' | 'summary' | 'title';

interface Option {
  id: string;
  text: string;
  feedback: string;
  isCorrect?: boolean;
}

interface Slide {
  id: number;
  title: string;
  type: SlideType;
  content?: string[];
  narration: string;
  subtitle?: string;
  question?: string;
  options?: Option[];
  icon: React.ReactNode;
  accentColor: string;
}

// --- Slide Data ---

const SLIDES: Slide[] = [
  {
    id: 1,
    title: "Recruitment & Selection Overview",
    subtitle: "Understanding Structured Hiring",
    type: 'title',
    narration: "Welcome to this module on Recruitment and Selection. Today, we'll explore how structured hiring leads to better talent acquisition and long-term organizational success. Click Begin Learning to start the module.",
    icon: <Users className="w-16 h-16" />,
    accentColor: "indigo"
  },
  {
    id: 2,
    title: "Introduction",
    type: 'content',
    content: [
      "Recruitment: Attracting and identifying potential candidates.",
      "Selection: Evaluating and choosing the best fit for the role.",
      "Goal: Aligning talent with organizational needs."
    ],
    narration: "Recruitment and selection are two sides of the same coin. While recruitment focuses on attracting a diverse pool of talent, selection is the critical process of filtering and identifying the individual who best fits the role and company culture. Click on each card to reveal more details, then click Next when you're ready.",
    icon: <Info className="w-12 h-12" />,
    accentColor: "blue"
  },
  {
    id: 3,
    title: "The Recruitment Cycle",
    type: 'content',
    content: [
      "1. Identify Hiring Need: Analyze the gap in the team and define the role requirements.",
      "2. Obtain Approval: Secure budget and headcount clearance from management.",
      "3. Sourcing Candidates: Post jobs and reach out to potential talent through various channels.",
      "4. Interviewing: Conduct structured assessments to evaluate skills and fit.",
      "5. Final Selection: Make the offer to the best candidate and begin onboarding."
    ],
    narration: "A structured recruitment cycle ensures consistency. It starts with identifying a genuine need, getting the necessary approvals, sourcing through various channels, conducting rigorous interviews, and finally, making an informed selection. Click the cards to explore the steps, then click Next to continue.",
    icon: <TrendingUp className="w-12 h-12" />,
    accentColor: "emerald"
  },
  {
    id: 4,
    title: "Key Documents",
    type: 'content',
    content: [
      "Job Description (JD): Defines roles, responsibilities, and requirements.",
      "Interview Assessment Sheet (IAS): Standardizes candidate evaluation.",
      "Importance: Ensures objectivity and compliance."
    ],
    narration: "Two documents are vital: The Job Description, or JD, which acts as your roadmap for the role, and the Interview Assessment Sheet, which ensures every candidate is evaluated against the same objective criteria. Click on the cards to learn more, then click Next to proceed.",
    icon: <FileText className="w-12 h-12" />,
    accentColor: "orange"
  },
  {
    id: 5,
    title: "Approval Mechanism",
    type: 'content',
    content: [
      "Budgeted Position: Already part of the annual workforce plan.",
      "New Position: Requires additional justification and budget approval.",
      "Process: Ensures financial and strategic alignment."
    ],
    narration: "Before hiring begins, we must confirm the position type. Budgeted positions are pre-approved in the annual plan, while new positions require extra justification to ensure they align with our current strategic goals. Explore the differences by clicking the cards, then click Next.",
    icon: <CheckSquare className="w-12 h-12" />,
    accentColor: "purple"
  },
  {
    id: 6,
    title: "Importance of the Job Description",
    type: 'content',
    content: [
      "Pre-reading the JD is non-negotiable.",
      "Helps align interview questions with core competencies.",
      "Prevents bias and ensures a professional candidate experience."
    ],
    narration: "Never walk into an interview without reviewing the JD. It's your primary tool for ensuring your questions are relevant and that you're measuring what actually matters for success in the role. Click the cards for more info, then click Next to move on.",
    icon: <FileText className="w-12 h-12" />,
    accentColor: "rose"
  },
  {
    id: 7,
    title: "Interview Levels",
    type: 'content',
    content: [
      "HR Round: Culture fit and basic hygiene checks.",
      "Technical Round: Skills and domain expertise assessment.",
      "Managerial Round: Final alignment and team fit."
    ],
    narration: "Interviews typically happen in stages. HR assesses culture fit, the technical round deep-dives into specific skills, and the managerial round ensures the candidate is the right long-term fit for the team. Click each level to see the details, then click Next.",
    icon: <Users className="w-12 h-12" />,
    accentColor: "violet"
  },
  {
    id: 8,
    title: "Knowledge Check",
    type: 'mcq',
    question: "What should an interviewer review before conducting an interview?",
    options: [
      { id: 'a', text: "Candidate profile", feedback: "While important, this isn't the primary document that defines the role requirements.", isCorrect: false },
      { id: 'b', text: "Job Description (JD)", feedback: "Correct! The JD is the blueprint for the role and ensures you ask the right questions. Click Next to continue.", isCorrect: true },
      { id: 'c', text: "Office location", feedback: "This is a logistical detail, not a core part of the selection criteria. Try another option.", isCorrect: false },
      { id: 'd', text: "Salary range", feedback: "Salary is usually handled by HR and isn't the focus of the competency assessment. Try again.", isCorrect: false }
    ],
    narration: "Let's test your knowledge. Based on what we've discussed, what is the most critical document to review before starting an interview? Please select the best option from the list below.",
    icon: <MessageSquare className="w-12 h-12" />,
    accentColor: "sky"
  },
  {
    id: 9,
    title: "Scenario Challenge",
    type: 'scenario',
    question: "Scenario: You are about to interview a candidate, but you realized you haven't reviewed the Job Description. The candidate is already in the waiting room.",
    options: [
      { 
        id: 'a', 
        text: "Proceed anyway", 
        feedback: "Risk: You might ask irrelevant questions or miss key competencies. This leads to poor hiring decisions. Try a more professional approach.", 
        isCorrect: false 
      },
      { 
        id: 'b', 
        text: "Review the JD before starting", 
        feedback: "Best Practice: Take 5 minutes to align. It's better to start slightly late than to conduct an ineffective interview. Great choice! Click Next to finish the module.", 
        isCorrect: true 
      },
      { 
        id: 'c', 
        text: "Ask candidate about the role", 
        feedback: "Unprofessional: This makes the interviewer look unprepared and shifts the burden of role definition to the candidate. Select a better option.", 
        isCorrect: false 
      },
      { 
        id: 'd', 
        text: "Cancel the interview", 
        feedback: "Extreme: This damages the employer brand. A quick review is a better alternative than a full cancellation. Try again.", 
        isCorrect: false 
      }
    ],
    narration: "Now, let's look at a real-world scenario. You're busy and forgot to prep. What's the most professional way to handle this situation? Choose one of the options to see the outcome.",
    icon: <Award className="w-12 h-12" />,
    accentColor: "amber"
  },
  {
    id: 10,
    title: "Summary",
    type: 'summary',
    content: [
      "Follow a structured hiring process.",
      "Prepare by reviewing the JD and Assessment Sheets.",
      "Focus on objectivity to make better hiring decisions."
    ],
    narration: "In summary, structured hiring isn't just a process—it's a commitment to quality. By preparing properly and using the right tools, you ensure we hire the best talent for our future. Thank you for completing this module. You can click Restart if you'd like to review the content again.",
    icon: <CheckCircle2 className="w-16 h-16" />,
    accentColor: "emerald"
  }
];

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-8 shadow-inner">
    <motion.div 
      className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.8, ease: "circOut" }}
    />
  </div>
);

const VoiceoverButton = ({ isPlaying, isLoading, onPlay, onStop }: { isPlaying: boolean; isLoading: boolean; onPlay: () => void; onStop: () => void }) => (
  <button
    onClick={isPlaying ? onStop : onPlay}
    disabled={isLoading}
    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-sm ${
      isPlaying 
        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {isLoading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : isPlaying ? (
      <VolumeX className="w-4 h-4" />
    ) : (
      <Volume2 className="w-4 h-4" />
    )}
    <span>{isLoading ? 'Generating...' : isPlaying ? 'Stop Audio' : 'Play Audio'}</span>
  </button>
);

const TypingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

const AnimatedIcon = ({ icon, color }: { icon: React.ReactNode; color: string }) => {
  const getAccentClass = (color: string) => {
    const map: Record<string, string> = {
      indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
      blue: "text-blue-600 bg-blue-50 border-blue-100",
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
      orange: "text-orange-600 bg-orange-50 border-orange-100",
      purple: "text-purple-600 bg-purple-50 border-purple-100",
      rose: "text-rose-600 bg-rose-50 border-rose-100",
      violet: "text-violet-600 bg-violet-50 border-violet-100",
      sky: "text-sky-600 bg-sky-50 border-sky-100",
      amber: "text-amber-600 bg-amber-50 border-amber-100",
    };
    return map[color] || map.indigo;
  };

  return (
    <motion.div
      animate={{ 
        y: [0, -8, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`p-4 rounded-3xl shadow-lg ${getAccentClass(color)}`}
    >
      {icon}
    </motion.div>
  );
};

const AudioVisualizer = ({ isPlaying, analyser }: { isPlaying: boolean; analyser: AnalyserNode | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgba(99, 102, 241, ${barHeight / 100})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, analyser]);

  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={30} 
      className={`transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};

export default function App() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [direction, setDirection] = useState(1);
  const [revealedItems, setRevealedItems] = useState<number[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'>('Kore');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const currentSlide = SLIDES[currentSlideIndex];

  // --- Voiceover Logic ---
  const stopVoiceover = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsAudioPlaying(false);
  };

  const generateVoiceover = async (textToSpeak: string) => {
    if (isAudioLoading || isMuted) return;
    
    // Stop any existing audio
    stopVoiceover();
    setIsAudioLoading(true);
    
    try {
      // Initialize AudioContext on first use
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: textToSpeak }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const context = audioContextRef.current;
        
        // Decode base64 to ArrayBuffer
        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert to Int16Array (L16 PCM)
        // Ensure even byte length for Int16Array
        const bufferToUse = bytes.byteLength % 2 === 0 ? bytes.buffer : bytes.buffer.slice(0, bytes.byteLength - 1);
        const int16Data = new Int16Array(bufferToUse);
        
        // Create AudioBuffer (Mono, 24kHz)
        const audioBuffer = context.createBuffer(1, int16Data.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        
        // Normalize to [-1, 1]
        for (let i = 0; i < int16Data.length; i++) {
          channelData[i] = int16Data[i] / 32768;
        }
        
        // Play
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        
        if (analyserRef.current) {
          source.connect(analyserRef.current);
          analyserRef.current.connect(context.destination);
        } else {
          source.connect(context.destination);
        }

        source.onended = () => setIsAudioPlaying(false);
        source.start();
        sourceNodeRef.current = source;
        setIsAudioPlaying(true);
      }
    } catch (error) {
      console.error("Voiceover generation failed:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  // --- Navigation ---
  const handleStart = () => {
    setHasStarted(true);
    handleNext();
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlideIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setRevealedItems([]);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setDirection(-1);
      setCurrentSlideIndex(prev => prev - 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setRevealedItems([]);
    }
  };

  const handleOptionSelect = (id: string) => {
    if (showFeedback) return;
    setSelectedOption(id);
    setShowFeedback(true);
    
    // Speak feedback if it's an interaction slide
    const option = currentSlide.options?.find(o => o.id === id);
    if (option) {
      generateVoiceover(option.feedback);
    }
  };

  const toggleReveal = (idx: number) => {
    if (revealedItems.includes(idx)) {
      setRevealedItems(revealedItems.filter(i => i !== idx));
    } else {
      setRevealedItems([...revealedItems, idx]);
      // Optionally speak the revealed text
      const item = currentSlide.content?.[idx];
      if (item && item.includes(':')) {
        generateVoiceover(item.split(':')[1].trim());
      }
    }
  };

  // --- Effects ---
  useEffect(() => {
    window.scrollTo(0, 0);
    // Auto-play narration when slide changes (if module is ready or it's the first slide)
    if (isReady && !isMuted) {
      generateVoiceover(currentSlide.narration);
    }

    // Trigger confetti on summary slide
    if (currentSlide.type === 'summary') {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [currentSlideIndex, hasStarted, isMuted]);

  useEffect(() => {
    return () => {
      stopVoiceover();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // --- Theme Colors ---
  const getAccentClass = (color: string) => {
    const map: Record<string, string> = {
      indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
      blue: "text-blue-600 bg-blue-50 border-blue-100",
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
      orange: "text-orange-600 bg-orange-50 border-orange-100",
      purple: "text-purple-600 bg-purple-50 border-purple-100",
      rose: "text-rose-600 bg-rose-50 border-rose-100",
      violet: "text-violet-600 bg-violet-50 border-violet-100",
      sky: "text-sky-600 bg-sky-50 border-sky-100",
      amber: "text-amber-600 bg-amber-50 border-amber-100",
    };
    return map[color] || map.indigo;
  };

  const getButtonAccent = (color: string) => {
    const map: Record<string, string> = {
      indigo: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
      blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
      emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
      orange: "bg-orange-600 hover:bg-orange-700 shadow-orange-200",
      purple: "bg-purple-600 hover:bg-purple-700 shadow-purple-200",
      rose: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
      violet: "bg-violet-600 hover:bg-violet-700 shadow-violet-200",
      sky: "bg-sky-600 hover:bg-sky-700 shadow-sky-200",
      amber: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
    };
    return map[color] || map.indigo;
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4 font-sans text-slate-900 selection:bg-indigo-100">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col min-h-[700px] relative">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50 pointer-events-none" />

        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${getAccentClass(currentSlide.accentColor)}`}>
              <motion.div
                key={currentSlide.id}
                initial={{ scale: 0.5, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {React.cloneElement(currentSlide.icon as React.ReactElement, { className: "w-6 h-6" })}
              </motion.div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Pathway</h2>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Module 01</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Recruitment & Selection</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-1">
              <button
                onClick={() => {
                  if (isMuted) {
                    setIsMuted(false);
                    generateVoiceover(currentSlide.narration);
                  } else {
                    setIsMuted(true);
                    stopVoiceover();
                  }
                }}
                className={`p-2 rounded-full transition-all ${
                  isMuted 
                    ? 'text-slate-400 hover:text-slate-600' 
                    : 'text-indigo-600 bg-white shadow-sm'
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              <button
                onClick={() => generateVoiceover(currentSlide.narration)}
                disabled={isAudioLoading || isMuted}
                className={`p-2 rounded-full transition-all ${
                  isAudioLoading || isMuted
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
                }`}
                title="Replay Narration"
              >
                {isAudioLoading ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
              </button>

              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value as any)}
                className="bg-transparent text-[10px] font-bold text-slate-500 px-2 outline-none cursor-pointer hover:text-indigo-600"
                title="Select Voice"
              >
                <option value="Kore">Kore</option>
                <option value="Puck">Puck</option>
                <option value="Charon">Charon</option>
                <option value="Fenrir">Fenrir</option>
                <option value="Zephyr">Zephyr</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <AudioVisualizer isPlaying={isAudioPlaying} analyser={analyserRef.current} />
            </div>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`p-2 rounded-xl transition-all ${
                showTranscript 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-slate-50 text-slate-400 hover:text-indigo-600 border border-slate-200'
              }`}
              title="Toggle Transcript"
            >
              <FileText size={18} />
            </button>

            <div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-500">
              {currentSlide.id.toString().padStart(2, '0')} / {SLIDES.length.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-10 pt-4">
          <ProgressBar current={currentSlide.id} total={SLIDES.length} />
        </div>

        {/* Transcript Overlay */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-10 py-4 bg-indigo-50/80 backdrop-blur-sm border-b border-indigo-100 z-20"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                <p className="text-sm font-medium text-indigo-900 leading-relaxed italic">
                  "<TypingText text={currentSlide.narration} />"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 px-10 py-6 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1">
                
                {/* Title Slide Layout */}
                {currentSlide.type === 'title' && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <AnimatedIcon icon={currentSlide.icon} color={currentSlide.accentColor} />
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-5xl font-black text-slate-900 mt-10 mb-6 tracking-tighter leading-tight max-w-2xl"
                    >
                      {currentSlide.title}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-2xl text-slate-400 font-medium tracking-tight"
                    >
                      {currentSlide.subtitle}
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mt-12 flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-xl shadow-indigo-200 cursor-pointer hover:bg-indigo-700 transition-all active:scale-95"
                      onClick={handleStart}
                    >
                      <span>Begin Learning</span>
                      <ChevronRight size={20} />
                    </motion.button>
                  </div>
                )}

                {/* Content Slide Layout with Click to Reveal */}
                {currentSlide.type === 'content' && (
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentSlide.title}</h2>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <MousePointer2 size={12} />
                        <span>Click cards to reveal details</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {currentSlide.content?.map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          onClick={() => toggleReveal(idx)}
                          className={`
                            group cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300
                            ${revealedItems.includes(idx) 
                              ? `border-indigo-200 bg-indigo-50/30 shadow-md` 
                              : 'border-slate-100 bg-white hover:border-indigo-100 hover:shadow-lg hover:-translate-y-1'}
                          `}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`
                              w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all
                              ${revealedItems.includes(idx) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
                            `}>
                              {idx + 1}
                            </div>
                            <span className={`text-lg font-bold transition-colors ${revealedItems.includes(idx) ? 'text-indigo-900' : 'text-slate-700'}`}>
                              {item.split(':')[0]}
                            </span>
                            <div className="ml-auto">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${revealedItems.includes(idx) ? 'border-indigo-500 bg-indigo-500 text-white rotate-180' : 'border-slate-200 text-slate-300'}`}>
                                <ChevronRight size={14} />
                              </div>
                            </div>
                          </div>
                          <AnimatePresence>
                            {revealedItems.includes(idx) && item.includes(':') && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 pt-4 border-t border-indigo-100 overflow-hidden"
                              >
                                <p className="text-slate-600 leading-relaxed font-medium">
                                  {item.split(':')[1].trim()}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MCQ Layout */}
                {currentSlide.type === 'mcq' && (
                  <div className="py-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-10">{currentSlide.title}</h2>
                    
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 text-slate-200">
                        <Sparkles size={48} />
                      </div>
                      <p className="text-2xl font-bold text-slate-800 leading-snug relative z-10">
                        {currentSlide.question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSlide.options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(option.id)}
                          disabled={showFeedback}
                          className={`
                            group relative flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all
                            ${selectedOption === option.id 
                              ? (option.isCorrect ? 'border-emerald-500 bg-emerald-50 shadow-emerald-100 shadow-xl' : 'border-rose-500 bg-rose-50 shadow-rose-100 shadow-xl') 
                              : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1'}
                            ${showFeedback && !option.isCorrect && selectedOption !== option.id ? 'opacity-40 grayscale' : ''}
                          `}
                        >
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm transition-all
                            ${selectedOption === option.id 
                              ? (option.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') 
                              : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
                          `}>
                            {selectedOption === option.id 
                              ? (option.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />) 
                              : option.id.toUpperCase()}
                          </div>
                          <span className="text-lg font-bold text-slate-700">{option.text}</span>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`mt-8 p-6 rounded-2xl flex gap-4 items-start shadow-lg ${
                            currentSlide.options?.find(o => o.id === selectedOption)?.isCorrect 
                              ? 'bg-emerald-600 text-white shadow-emerald-200' 
                              : 'bg-rose-600 text-white shadow-rose-200'
                          }`}
                        >
                          <div className="mt-1 p-2 bg-white/20 rounded-lg">
                            {currentSlide.options?.find(o => o.id === selectedOption)?.isCorrect 
                              ? <CheckCircle2 size={24} /> 
                              : <XCircle size={24} />}
                          </div>
                          <div>
                            <p className="text-xl font-black mb-1 tracking-tight">
                              {currentSlide.options?.find(o => o.id === selectedOption)?.isCorrect ? 'Excellent!' : 'Not quite...'}
                            </p>
                            <p className="text-sm font-medium opacity-90 leading-relaxed">
                              {currentSlide.options?.find(o => o.id === selectedOption)?.feedback}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Scenario Layout */}
                {currentSlide.type === 'scenario' && (
                  <div className="py-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-10">{currentSlide.title}</h2>
                    
                    <div className="flex gap-6 mb-10">
                      <div className="shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
                          <Users size={32} />
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-900 text-white p-8 rounded-3xl rounded-tl-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="flex items-center gap-3 mb-4">
                          <div className="px-3 py-1 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">Hiring Manager</div>
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        </div>
                        <p className="text-xl font-bold leading-tight tracking-tight">
                          {currentSlide.question}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {currentSlide.options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(option.id)}
                          disabled={showFeedback}
                          className={`
                            group flex flex-col p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden
                            ${selectedOption === option.id 
                              ? (option.isCorrect ? 'border-emerald-500 bg-emerald-50 shadow-xl' : 'border-rose-500 bg-rose-50 shadow-xl') 
                              : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1'}
                            ${showFeedback && selectedOption !== option.id ? 'opacity-40 grayscale' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl font-black text-slate-800 tracking-tight">{option.text}</span>
                            {selectedOption === option.id && (
                              <div className={option.isCorrect ? 'text-emerald-500' : 'text-rose-500'}>
                                {option.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                              </div>
                            )}
                          </div>
                          
                          <AnimatePresence>
                            {showFeedback && selectedOption === option.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-4 pt-4 border-t border-slate-200"
                              >
                                <p className={`text-base font-bold leading-relaxed ${option.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {option.feedback}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Layout */}
                {currentSlide.type === 'summary' && (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <AnimatedIcon icon={currentSlide.icon} color={currentSlide.accentColor} />
                    <h2 className="text-4xl font-black text-slate-900 mt-10 mb-10 tracking-tighter">Module Complete</h2>
                    <div className="w-full max-w-xl space-y-4">
                      {currentSlide.content?.map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + (idx * 0.15) }}
                          className="flex items-center gap-5 p-6 bg-white rounded-3xl border-2 border-slate-50 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={24} />
                          </div>
                          <span className="text-xl font-bold text-slate-700 tracking-tight">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      onClick={() => window.location.reload()}
                      className="mt-12 px-10 py-4 bg-slate-900 text-white rounded-full font-black shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3"
                    >
                      <Sparkles size={20} />
                      <span>Restart Module</span>
                    </motion.button>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="px-10 py-8 bg-white border-t border-slate-100 flex justify-between items-center z-10">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all
              ${currentSlideIndex === 0 
                ? 'text-slate-200 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-50 active:scale-95'}
            `}
          >
            <ChevronLeft size={24} />
            <span className="uppercase tracking-widest text-xs">Previous</span>
          </button>

          <div className="hidden md:flex gap-3">
            {SLIDES.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlideIndex ? 'bg-indigo-600 w-10' : 'bg-slate-200 w-3'}`} 
              />
            ))}
          </div>

          <motion.button
            onClick={handleNext}
            disabled={currentSlideIndex === SLIDES.length - 1 || (currentSlide.type === 'mcq' && !showFeedback) || (currentSlide.type === 'scenario' && !showFeedback)}
            animate={!(currentSlideIndex === SLIDES.length - 1 || (currentSlide.type === 'mcq' && !showFeedback) || (currentSlide.type === 'scenario' && !showFeedback)) ? {
              scale: [1, 1.05, 1],
              boxShadow: ["0px 0px 0px rgba(79, 70, 229, 0)", "0px 0px 20px rgba(79, 70, 229, 0.4)", "0px 0px 0px rgba(79, 70, 229, 0)"]
            } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`
              flex items-center gap-3 px-10 py-4 rounded-2xl font-black transition-all group
              ${(currentSlideIndex === SLIDES.length - 1 || (currentSlide.type === 'mcq' && !showFeedback) || (currentSlide.type === 'scenario' && !showFeedback))
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : `${getButtonAccent(currentSlide.accentColor)} text-white shadow-2xl active:scale-95`}
            `}
          >
            <span className="uppercase tracking-widest text-xs">{currentSlideIndex === SLIDES.length - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Start Overlay */}
        <AnimatePresence>
          {!isReady && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md"
              >
                <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-500/20">
                  <PlayCircle size={48} />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to Begin?</h2>
                <p className="text-slate-400 mb-10 leading-relaxed">
                  This module includes AI narration. Click the button below to initialize audio and start your learning journey.
                </p>
                <button
                  onClick={async () => {
                    // Initialize AudioContext
                    if (!audioContextRef.current) {
                      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                      analyserRef.current = audioContextRef.current.createAnalyser();
                      analyserRef.current.fftSize = 256;
                    }
                    if (audioContextRef.current.state === 'suspended') {
                      await audioContextRef.current.resume();
                    }
                    setIsReady(true);
                  }}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
                >
                  Start Module
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
