import  { useState } from 'react';
import api from '../api/axiosInstance'; 
import { Sparkles, BrainCircuit, Loader2, MessageSquareQuote } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';

interface Props {
  mealHistory: any[];
  deposits: any[];
  members: any[];
}

export const AiInsights = ({ mealHistory, deposits, members }: Props) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateAiReport = async () => {
    setLoading(true);
    try {
      const totalMeals = mealHistory.length;
      const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
      
      const dataSummary = {
        totalMeals,
        totalDeposits,
        memberCount: members.length
      };

      const response = await api.post('/ai/analyze', { 
        context: dataSummary 
      });

      setInsight(response.data.analysis);
    } catch (err: any) {
      const errorMsg = err.response?.data?.analysis || "Failed to connect to AI Assistant.";
      setInsight(`❌ **Error:** ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const MarkdownComponents: Components = {
    h3: ({ children }) => (
      <h3 className="text-lg font-bold text-amber-400 mt-4 mb-2">{children}</h3>
    ),
    strong: ({ children }) => (
      <strong className="text-white font-extrabold">{children}</strong>
    ),
    hr: () => (
      <hr className="border-white/10 my-4" />
    ),
    // Added list support as AI usually provides tips in bullets
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 my-2 text-slate-300">{children}</ul>
    ),
    li: ({ children }) => (
      <li className="ml-2">{children}</li>
    )
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-white/10 transition-all duration-500">
      <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 pointer-events-none">
        <BrainCircuit size={150} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <Sparkles className="text-amber-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Mess Strategist</h2>
            <p className="text-indigo-200/60 text-[10px] uppercase font-bold tracking-widest">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        {!insight && !loading && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <p className="text-slate-300 text-sm max-w-md leading-relaxed">
              Analyze your current <span className="text-white font-bold">{mealHistory.length} meal records</span> and 
              financial deposits to get a budget health check.
            </p>
            <button 
              onClick={generateAiReport}
              className="bg-white text-indigo-900 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              Analyze Status
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="animate-spin text-amber-400" size={40} />
            <p className="text-indigo-200 text-sm font-medium animate-pulse">Consulting the Mess Strategist...</p>
          </div>
        )}

        {insight && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm max-h-[400px] overflow-y-auto custom-scrollbar">
               <div className="flex items-start gap-3">
                  <MessageSquareQuote className="text-amber-400 shrink-0 mt-1" size={20} />
                  <div className="text-sm text-slate-100 leading-relaxed prose prose-invert prose-sm">
                    <ReactMarkdown components={MarkdownComponents}>
                      {insight}
                    </ReactMarkdown>
                  </div>
               </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
               <button 
                 onClick={() => setInsight(null)}
                 className="text-xs text-indigo-300 hover:text-white transition-colors font-bold underline underline-offset-4"
               >
                 Dismiss Analysis
               </button>
               <span className="text-[10px] text-white/30 italic">Strategy based on current month market rates in Bangladesh</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};