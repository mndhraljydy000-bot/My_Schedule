import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { TestType, SourceCategory, Source } from '../data/sources';
import { getSourcesByCategory } from '../data/sources';
import ScheduleConfigForm from '../components/ScheduleConfigForm';
import { BookMarked, Calculator, BookOpen, Check, Plus, X, Sparkles, ChevronLeft, Layers, ArrowLeft, PlayCircle, FileText, ChevronDown, AlertCircle } from 'lucide-react';

const CATEGORY_META: Record<SourceCategory, { label: string; icon: typeof BookMarked; color: string; bg: string; border: string }> = {
  'foundation': { label: 'التأسيس', icon: BookMarked, color: 'text-gold-300', bg: 'from-gold-300/10 to-gold-500/5', border: 'border-gold-400/40' },
  'training-quant': { label: 'تدريب كمي', icon: Calculator, color: 'text-sky-400', bg: 'from-sky-400/10 to-sky-600/5', border: 'border-sky-400/40' },
  'training-verbal': { label: 'تدريب لفظي', icon: BookOpen, color: 'text-gold-300', bg: 'from-gold-300/10 to-gold-500/5', border: 'border-gold-400/40' },
};

export default function QiyasSection() {
  const { selectedSources, toggleSource, isSourceSelected, removeSource, inputs, setInput, generateSchedule, setPage, schedule } = useApp();
  const [showInputs, setShowInputs] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<SourceCategory>>(new Set(['foundation']));
  const testType: TestType = 'qiyas';
  const toggleSection = (cat: SourceCategory) => setExpandedSections((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  const testTypeSources = selectedSources.filter((s) => s.testType === testType);
  const allReady = testTypeSources.length > 0 && testTypeSources.every((s) => { const inp = inputs[s.id]; return inp && (inp.videos > 0 || inp.tests > 0); });
  const handleGenerate = () => { generateSchedule(testType); if (schedule?.error) { setGenError(schedule.error); return; } setPage('schedule'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const foundationSources = getSourcesByCategory(testType, 'foundation');
  const quantSources = getSourcesByCategory(testType, 'training-quant');
  const verbalSources = getSourcesByCategory(testType, 'training-verbal');
  const selectedInCategory = (cat: SourceCategory) => selectedSources.find((s) => s.testType === testType && s.groupId === cat);

  return (
    <div className="animate-fade-in px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center"><h1 className="section-title text-3xl text-white sm:text-4xl">قسم القدرات</h1><p className="mt-2 text-sm text-ink-300">اختر مصدراً واحداً من كل قسم — التأسيس، التدريب الكمي، والتدريب اللفظي</p></div>
        {testTypeSources.length > 0 && (
          <div className="mb-6 animate-pop"><div className="card p-4">
            <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Layers className="h-4 w-4 text-gold-300" /><span className="text-sm font-bold text-white">المصادر المحددة ({testTypeSources.length})</span></div>
            <button onClick={() => setShowInputs(true)} className="flex items-center gap-1.5 rounded-lg bg-gold-400/15 px-3 py-1.5 text-xs font-bold text-gold-300 transition-colors hover:bg-gold-400/25"><ArrowLeft className="h-3.5 w-3.5" />إدخال البيانات</button></div>
            <div className="flex flex-wrap gap-2">{testTypeSources.map((s) => (<span key={s.id} className="chip border-gold-400/30 bg-gold-400/10 text-gold-200">{s.name}<button onClick={() => removeSource(s.id)} className="hover:text-gold-100"><X className="h-3 w-3" /></button></span>))}</div>
          </div></div>
        )}
        {!showInputs ? (
          <>
            <SectionBlock category="foundation" testType={testType} sources={foundationSources} isExpanded={expandedSections.has('foundation')} onToggle={() => toggleSection('foundation')} selectedSource={selectedInCategory('foundation')} isSourceSelected={isSourceSelected} onToggleSource={toggleSource} />
            <div className="my-6 grid gap-3 sm:grid-cols-2">
              {!expandedSections.has('training-quant') && (<button onClick={() => toggleSection('training-quant')} className="group flex items-center justify-between rounded-2xl border border-sky-400/30 bg-sky-400/5 p-5 transition-all hover:border-sky-400/50 hover:bg-sky-400/10"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-400/10 to-sky-600/5 border border-sky-400/30"><Calculator className="h-5 w-5 text-sky-400" /></div><div className="text-right"><div className="font-display text-base font-bold text-white">إضافة تدريب كمي</div><div className="text-xs text-ink-300">المنصف، المفكر</div></div></div><Plus className="h-5 w-5 text-sky-400 transition-transform group-hover:scale-110" /></button>)}
              {!expandedSections.has('training-verbal') && (<button onClick={() => toggleSection('training-verbal')} className="group flex items-center justify-between rounded-2xl border border-gold-400/30 bg-gold-400/5 p-5 transition-all hover:border-gold-400/50 hover:bg-gold-400/10"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-gold-300/10 to-gold-500/5 border border-gold-400/30"><BookOpen className="h-5 w-5 text-gold-300" /></div><div className="text-right"><div className="font-display text-base font-bold text-white">إضافة تدريب لفظي</div><div className="text-xs text-ink-300">دورة إيهاب عبد العظيم</div></div></div><Plus className="h-5 w-5 text-gold-300 transition-transform group-hover:scale-110" /></button>)}
            </div>
            {expandedSections.has('training-quant') && (<div className="animate-fade-up"><SectionBlock category="training-quant" testType={testType} sources={quantSources} isExpanded={true} onToggle={() => toggleSection('training-quant')} selectedSource={selectedInCategory('training-quant')} isSourceSelected={isSourceSelected} onToggleSource={toggleSource} /></div>)}
            {expandedSections.has('training-verbal') && (<div className="animate-fade-up"><SectionBlock category="training-verbal" testType={testType} sources={verbalSources} isExpanded={true} onToggle={() => toggleSection('training-verbal')} selectedSource={selectedInCategory('training-verbal')} isSourceSelected={isSourceSelected} onToggleSource={toggleSource} /></div>)}
            {testTypeSources.length > 0 && (<div className="mt-8 text-center animate-pop"><button onClick={() => setShowInputs(true)} className="btn-gold"><ArrowLeft className="h-5 w-5" />التالي: إدخال البيانات والتواريخ</button></div>)}
          </>
        ) : (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between"><button onClick={() => setShowInputs(false)} className="btn-ghost"><ChevronLeft className="h-4 w-4" />رجوع للاختيار</button><h2 className="font-display text-xl font-bold text-white">أدخل بياناتك</h2></div>
            <ScheduleConfigForm />
            {testTypeSources.map((s, i) => { const inp = inputs[s.id] || { videos: 0, tests: 0 }; return (
              <div key={s.id} className="card animate-fade-up p-5 sm:p-6" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="mb-4 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 font-display text-sm font-bold text-gold-300">{i + 1}</span><h3 className="font-display text-lg font-bold text-white">{s.name}</h3></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200"><PlayCircle className="h-3.5 w-3.5 text-sky-400" />عدد فيديوهات الشرح</label><input type="number" min={0} value={inp.videos || ''} onChange={(e) => setInput(s.id, { videos: Math.max(0, Number(e.target.value)) })} placeholder="مثال: 50" className="input-field" /></div>
                  <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200"><FileText className="h-3.5 w-3.5 text-gold-300" />عدد الاختبارات</label><input type="number" min={0} value={inp.tests || ''} onChange={(e) => setInput(s.id, { tests: Math.max(0, Number(e.target.value)) })} placeholder="مثال: 20" className="input-field" /></div>
                </div>
              </div>);})}
            <div className="pt-2 text-center">
              {genError && (<div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-right animate-fade-in"><AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" /><p className="text-sm text-red-300">{genError}</p></div>)}
              <button onClick={handleGenerate} disabled={!allReady} className="btn-gold w-full sm:w-auto sm:px-10 sm:py-4 sm:text-lg"><Sparkles className="h-6 w-6" />توليد الجدول الذكي</button>{!allReady && <p className="mt-3 text-xs text-ink-400">أدخل عدداً صحيحاً للفيديوهات أو الاختبارات لكل مصدر</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionBlockProps { category: SourceCategory; testType: TestType; sources: Source[]; isExpanded: boolean; onToggle: () => void; selectedSource?: Source; isSourceSelected: (id: string) => boolean; onToggleSource: (id: string, name: string, testType: TestType, groupId: string) => void; }
function SectionBlock({ category, testType, sources, isExpanded, onToggle, selectedSource, isSourceSelected, onToggleSource }: SectionBlockProps) {
  const meta = CATEGORY_META[category]; const Icon = meta.icon;
  return (
    <div className={`rounded-2xl border ${meta.border} bg-ink-850/60 overflow-hidden`}>
      <button onClick={onToggle} className="flex w-full items-center justify-between p-5 transition-colors hover:bg-ink-800/40">
        <div className="flex items-center gap-3"><div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${meta.bg} border border-ink-600/50`}><Icon className={`h-5 w-5 ${meta.color}`} /></div><div className="text-right"><div className="font-display text-lg font-bold text-white">{meta.label}</div><div className="text-xs text-ink-300">{sources.length} مصادر متاحة{selectedSource && <span className="text-gold-300"> · محدد: {selectedSource.name}</span>}</div></div></div>
        <ChevronDown className={`h-5 w-5 text-ink-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (<div className="grid gap-4 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source, i) => { const selected = isSourceSelected(source.id); return (
          <button key={source.id} onClick={() => onToggleSource(source.id, source.name, testType, category)} className={`group relative overflow-hidden rounded-xl border p-4 text-right transition-all animate-fade-up ${selected ? 'border-gold-400/60 bg-gradient-to-br from-gold-400/10 to-transparent shadow-glow-gold' : 'border-ink-700 bg-ink-850/70 hover:border-ink-500 hover:bg-ink-800/70'}`} style={{ animationDelay: `${i * 60}ms` }}>
            {selected && <div className="absolute left-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-gold-400 text-ink-950"><Check className="h-3.5 w-3.5" strokeWidth={3} /></div>}
            <div className="mb-2 text-xl">🧠</div><h3 className="mb-1 font-display text-sm font-bold text-white">{source.name}</h3>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold">{selected ? <span className="text-gold-300">محدد للجدول</span> : <span className="flex items-center gap-1 text-ink-300 group-hover:text-gold-300"><Plus className="h-3 w-3" />إضافة للجدول</span>}</div>
          </button>);})}
      </div>)}
    </div>
  );
}
