import { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  Globe, 
  MessageSquare, 
  Film, 
  CircleDollarSign, 
  Heart, 
  Cpu, 
  Plus, 
  Mic, 
  Square, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Trophy,
  Zap,
  Target,
  Smile
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateTopic, generateFeedback, type Feedback } from "./services/aiService";
import { 
  initGA, 
  trackPageView, 
  trackCategorySelection, 
  trackTopicGeneration, 
  trackStartPrep, 
  trackSessionComplete, 
  trackFeedbackReceived 
} from "./services/analyticsService";

// Types
type Category = {
  id: string;
  name: string;
  icon: any;
  color: string;
};

const CATEGORIES: Category[] = [
  { id: "Work & Career", name: "Work & Career", icon: Briefcase, color: "text-orange-400" },
  { id: "World & Current Affairs", name: "World & Current Affairs", icon: Globe, color: "text-orange-400" },
  { id: "Opinion & Debate", name: "Opinion & Debate", icon: MessageSquare, color: "text-orange-400" },
  { id: "Pop Culture & Entertainment", name: "Pop Culture & Entertainment", icon: Film, color: "text-orange-400" },
  { id: "Money & Finance", name: "Money & Finance", icon: CircleDollarSign, color: "text-orange-400" },
  { id: "Life & Relationships", name: "Life & Relationships", icon: Heart, color: "text-orange-400" },
  { id: "Tech & Future", name: "Tech & Future", icon: Cpu, color: "text-orange-400" },
];

export default function App() {
  const [view, setView] = useState<"home" | "topic-selection" | "prep" | "recording" | "feedback">("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Prep State
  const [prepTime, setPrepTime] = useState(30);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize GA4
  useEffect(() => {
    initGA();
  }, []);

  // Track Page Views
  useEffect(() => {
    trackPageView(view);
  }, [view]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript + " ");
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const fetchTopic = async (category: string) => {
    trackCategorySelection(category);
    setIsLoading(true);
    setSelectedCategory(category);
    setView("topic-selection");
    try {
      const topic = await generateTopic(category);
      trackTopicGeneration(category, topic);
      setCurrentTopic(topic);
    } catch (err) {
      console.error(err);
      setCurrentTopic("Talk about a skill you'd like to master and why.");
    } finally {
      setIsLoading(false);
    }
  };

  const startPrep = () => {
    trackStartPrep(currentTopic);
    setPrepTime(30);
    setView("prep");
  };

  // Handle Prep Countdown
  useEffect(() => {
    if (view === "prep" && prepTime > 0) {
      prepTimerRef.current = setTimeout(() => {
        setPrepTime(prev => prev - 1);
      }, 1000);
    } else if (view === "prep" && prepTime === 0) {
      startRecording();
    }
    return () => {
      if (prepTimerRef.current) clearTimeout(prepTimerRef.current);
    };
  }, [view, prepTime]);

  const startRecording = () => {
    setView("recording");
    setIsRecording(true);
    setTranscript("");
    setDuration(0);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn("Recognition already started");
    }
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    trackSessionComplete(currentTopic, duration);
    setIsRecording(false);
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    getFeedback();
  };

  const getFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await generateFeedback(
        currentTopic,
        selectedCategory,
        transcript,
        duration
      );
      trackFeedbackReceived(currentTopic);
      setFeedback(data);
      setView("feedback");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // UI Components
  const Home = () => (
    <div className="max-w-6xl mx-auto px-6 sm:px-12 py-12 relative z-10">
      <nav className="flex justify-between items-center mb-12 sm:mb-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Mic className="text-white" size={20} />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">SpeakUp</span>
        </div>
        <div className="flex gap-4 sm:gap-8 text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <span className="text-orange-500 border-b-2 border-orange-500 pb-1">Practice</span>
          <span className="hover:text-gray-300 cursor-pointer transition-colors">Progress</span>
          <span className="hover:text-gray-300 cursor-pointer transition-colors">Settings</span>
        </div>
      </nav>

      <header className="mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1] sm:leading-[0.9]">
          Practice speaking. <br/>
          <span className="text-gray-600">Get better every day.</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-400 font-medium border-l-2 border-orange-500 pl-6 py-1 max-w-xl">
          Select a category to generate a random, thought-provoking topic and start your session.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ y: -4, backgroundColor: "#1C1C1C", borderColor: "rgba(249, 115, 22, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchTopic(cat.id)}
            className="group relative h-40 bg-card-bg border border-white/5 rounded-2xl p-6 flex flex-col justify-between items-start text-left transition-all"
          >
            <div className={`p-2 rounded-lg bg-orange-500/10 ${cat.color}`}>
              <cat.icon size={20} />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-gray-100 block">{cat.name}</span>
              <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-bold">Category</span>
            </div>
          </motion.button>
        ))}

        <div className="h-40 bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex flex-col justify-center items-center transition-all group hover:bg-orange-500/10">
          {!showCustomInput ? (
            <button 
              onClick={() => setShowCustomInput(true)}
              className="flex flex-col items-center gap-2 text-orange-500"
            >
              <Plus size={24} className="mb-1" />
              <span className="font-bold text-sm uppercase tracking-widest">Add Your Own</span>
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex flex-col justify-between">
              <input 
                autoFocus
                placeholder="Type a custom topic..."
                className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => { 
                    if(customTopic) {
                      trackCategorySelection("Custom");
                      trackTopicGeneration("Custom", customTopic);
                      setCurrentTopic(customTopic);
                      setSelectedCategory("Custom");
                      setView("topic-selection");
                    }
                  }}
                  className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors"
                >
                  Start
                </button>
                <button 
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-1.5 bg-transparent text-gray-500 rounded-lg text-xs font-bold hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <footer className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            1,248 Sessions Today
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
            Ready to Record
          </div>
        </div>
        <div>Powered by Gemini AI</div>
      </footer>
    </div>
  );

  const TopicSelection = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-card-bg border border-white/5 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full"></div>
        
        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">
            {selectedCategory} Topic
          </div>
 
          {isLoading ? (
            <div className="flex flex-col items-center gap-6 py-20">
              <RefreshCw className="animate-spin text-orange-500" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Finding your topic...</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight max-w-2xl tracking-tighter">
                "{currentTopic}"
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startPrep}
                  className="px-8 sm:px-10 py-4 sm:py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-orange-500/20"
                >
                  Start Prep
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchTopic(selectedCategory)}
                  className="px-8 sm:px-10 py-4 sm:py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white/10"
                >
                  Try Another
                </motion.button>
              </div>
              
              <button 
                onClick={() => setView("home")}
                className="text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-4"
              >
                Go back to categories
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );

  const PrepTimer = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-12 relative z-10 bg-black">
      <div className="text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-64 h-64 mb-12 flex items-center justify-center"
        >
          <svg className="w-full h-full absolute inset-0 -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="transparent"
              stroke="#f97316"
              strokeWidth="8"
              strokeDasharray="754"
              initial={{ strokeDashoffset: 754 }}
              animate={{ strokeDashoffset: 754 - (754 * (30 - prepTime)) / 30 }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-6xl sm:text-8xl font-black tracking-tighter text-white">{prepTime}</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.3em] sm:tracking-[0.4em] text-gray-500">Seconds Prep</span>
          </div>
        </motion.div>
        
        <div className="max-w-xl px-6 sm:px-0">
          <p className="text-gray-500 uppercase tracking-[0.2em] font-bold text-[10px] sm:text-xs mb-4">Topic</p>
          <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight leading-relaxed italic">
            "{currentTopic}"
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="mt-12 px-8 py-3 bg-white/5 border border-white/10 text-white rounded-full font-bold uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-white/10"
          >
            Skip to recording
          </motion.button>
        </div>
      </div>
    </div>
  );

  const Recording = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-card-bg border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 sm:p-16 text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-8 sm:mb-12 max-w-2xl mx-auto tracking-tight">
            "{currentTopic}"
          </h2>
          
          <div className="flex flex-col items-center gap-8 sm:gap-10">
            <div className="relative">
              {isRecording && (
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-[-20%] bg-orange-500/20 rounded-full blur-2xl"
                />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all bg-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
              >
                <Square fill="white" className="text-white" size={28} sm:size={32} />
              </motion.button>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl sm:text-6xl font-black font-mono tracking-tighter text-white">
                {String(Math.floor(duration / 60)).padStart(2, "0")}:{String(duration % 60).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.3em] text-gray-500">Live Recording</span>
            </div>
          </div>
        </div>
 
        <div className="px-8 sm:px-16 pb-8 sm:pb-16">
          <div className="bg-black/40 border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 min-h-[120px] sm:min-h-[140px] relative">
            <div className="absolute top-4 left-6 text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.2em] text-gray-600">Live Transcription</div>
            <p className="mt-6 sm:mt-8 text-gray-400 leading-relaxed font-medium italic text-base sm:text-lg text-center">
              {transcript || "Keep speaking, I'm transcribing everything..."}
            </p>
          </div>
          <div className="mt-8 text-center">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-gray-600 animate-pulse italic">
              AI Coach is listening...
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const FeedbackView = () => (
    <div className="max-w-4xl mx-auto px-6 sm:px-12 py-12 relative z-10">
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <button 
          onClick={() => setView("home")}
          className="flex items-center gap-2 text-gray-500 hover:text-white font-bold tracking-widest uppercase text-[9px] sm:text-[10px] transition-colors"
        >
          <ChevronLeft size={14} className="sm:size-16" /> New Session
        </button>
        <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
          <Clock size={14} className="sm:size-16" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{duration}s SESSION</span>
        </div>
      </div>
 
      <header className="mb-10 sm:mb-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner shrink-0">
            <Trophy size={32} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-2">Session Complete.</h1>
            <p className="text-gray-500 font-medium text-base sm:text-lg">"{currentTopic}"</p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center gap-6 py-32 bg-card-bg rounded-[3rem] border border-white/5 shadow-2xl">
          <RefreshCw className="animate-spin text-orange-500" size={64} />
          <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Analyzing your speech...</p>
          <p className="text-gray-500 text-sm">Our AI Coach is reviewing your pace, clarity, and structure.</p>
        </div>
      ) : feedback ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 bg-[#161616] border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full"></div>
            <div className="flex flex-col md:flex-row gap-8 sm:gap-16 items-center relative z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl sm:text-6xl font-black bg-orange-500 w-24 h-24 sm:w-32 sm:h-32 rounded-[1.5rem] sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40 transform -rotate-3">
                  {feedback.clarity?.split("/")[0] || "?"}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 text-center">Quality Score</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-lg sm:text-2xl lg:text-3xl font-serif italic text-white mb-6 sm:mb-8 border-l-4 border-orange-500 pl-4 sm:pl-6 py-2 leading-relaxed">
                  "{feedback.encouragement}"
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                  <div className="px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                    <Zap size={14} className="text-orange-500" />
                    <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-300">{feedback.pace}</span>
                  </div>
                  <div className="px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={14} className="text-orange-500" />
                    <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-orange-500">Clarity: {feedback.clarity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1C] border border-white/5 rounded-3xl p-8 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <Target size={18} />
              </div>
              <h3 className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Actionable Tip</h3>
            </div>
            <p className="text-gray-100 leading-relaxed font-medium capitalize">
              {feedback.tip}
            </p>
          </div>

          <div className="bg-[#1C1C1C] border border-white/5 rounded-3xl p-8 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <MessageSquare size={18} />
              </div>
              <h3 className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Filler Words</h3>
            </div>
            <p className="text-gray-100 leading-relaxed font-medium">
              {feedback.fillers}
            </p>
          </div>

          <div className="md:col-span-2 bg-orange-500/5 border border-orange-500/10 rounded-3xl p-10">
            <div className="flex items-start gap-6">
              <div className="p-3 bg-[#1C1C1C] border border-white/10 rounded-2xl text-orange-500">
                <Smile size={28} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-3 uppercase tracking-widest text-xs">Structure Analysis</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  {feedback.structure}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      
      {!isLoading && (
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => fetchTopic(selectedCategory)}
            className="px-8 sm:px-10 py-4 sm:py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-orange-500/20 hover:scale-105 transition-all"
          >
            Try Again (Same Category)
          </button>
          <button 
            onClick={() => setView("home")}
            className="px-8 sm:px-10 py-4 sm:py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white/10 transition-all"
          >
            Pick New Category
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.08),_transparent_40%)] pointer-events-none"></div>
      
      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Home />
          </motion.div>
        )}
        {view === "topic-selection" && (
          <motion.div key="topic" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <TopicSelection />
          </motion.div>
        )}
        {view === "prep" && (
          <motion.div key="prep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PrepTimer />
          </motion.div>
        )}
        {view === "recording" && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Recording />
          </motion.div>
        )}
        {view === "feedback" && (
          <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FeedbackView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
