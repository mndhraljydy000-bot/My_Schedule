import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TAHSILI_SOURCES, TAHSILI_SUBJECTS } from '../data/sources';
import type { TahsiliSubject } from '../data/sources';
import ScheduleConfigForm from '../components/ScheduleConfigForm';
import { BookMarked, Check, Plus, X, Sparkles, ChevronLeft, Layers, ArrowLeft, PlayCircle, FileText, ChevronDown, Sigma, Atom, FlaskConical, Leaf, AlertCircle } from 'lucide-react';

const SUBJECT_ICONS: Record<TahsiliSubject, typeof Sigma> = { math: Sigma, physics: Atom, chemistry: FlaskConical, biology: Leaf };
const SUBJECT_COLORS: Record<TahsiliSubject, string> = { math: 'text-sky-400', physics: 'text-gold-300', chemistry: 'text-sky-400', biology: 'text-gold-300' };
const SUBJECT_BG: Record<TahsiliSubject, string> = { math: 'from-sky-400/10 to-sky-600/5', physics: 'from-gold-300/10 to-gold-500/5', chemistry: 'from-sky-400/10 to-sky-600/5', biology: 'from-gold-300/10 to-gold-500/5' };

export default function TahsiliSection() {
  const { selectedSources, toggleSource, isSourceSelected, removeSource, inputs, setInput, generateSchedule, setPage, schedule } = useApp();
  const [showSources, setShowSources] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [showInputs, setShowInputs] = useState(false);
  const testType = 'tahsili';
  const testTypeSources = selectedSources.filter((s) => s.testType === testType);
  const makeId = (sourceId: string, subject: TahsiliSubject) => `${sourceId}:${subject}`;
  const toggleSubject = (sourceId: string, sourceName: string, subject: TahsiliSubject) => toggleSource(makeId(sourceId, subject), `${sourceName} - ${TAHSILI_SUBJECTS[subject]}`, testType);
  const isSubjectSelected = (sourceId: string, subject: TahsiliSubject) => isSourceSelected(makeId(sourceId, subject));
  const allReady = testTypeSources.length > 0 && testTypeSources.every((s) => { const inp = inputs[s.id]; return inp && (inp.videos > 0 || inp.tests > 0); });
  const handleGenerate = () => { generateSchedule(testType); if (schedule?.error) { setGenError(schedule.error); return; } setPage('schedule'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const countSubjectsForSource = (sourceId: string) => (Object.keys(TAHSILI_SUBJECTS) as TahsiliSubject[]).filter((subj) => isSubjectSelected(sourceId, subj)).length;

  return (
    <div className="animate-fade-in px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center"><h1 className="section-title text-3xl text-white sm:text-4xl">قسم التحصيلي</h1><p className="mt-2 text-sm text-ink-300">اختر مصادرك وموادك — النظام يدرّس مادة واحدة في اليوم بشكل تتابع وتدريجي</p></div>
        {testTypeSources.length > 0 && (
          <div className="mb-6 animate-pop"><div className="card p-4">
            <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Layers className="h-4 w-4 text-gold-300" /><span className="text-sm font-bold text-white">المواد المحددة ({testTypeSources.length})</span></div>
            <button onClick={() => setShowInputs(true)} className="flex items-center gap-1.5 rounded-lg bg-gold-400/15 px-3 py-1.5 text-xs font-bold text-gold-300 transition-colors hover:bg-gold-400/25"><ArrowLeft className="h-3.5 w-3.5" />إدخال البيانات</button></div>
            <div className="flex flex-wrap gap-2">{testTypeSources.map((s) => (<span key={s.id} className="chip border-sky-400/30 bg-sky-400/10 text-sky-200">{s.name}<button onClick={() => removeSource(s.id)} className="hover:text-sky-100"><X className="h-3 w-3" /></button></span>))}</div>
          </div></div>
        )}
        {!showInputs ? (
          !showSources ? (
            <div className="text-center"><button onClick={() => setShowSources(true)} className="group flex w-full max-w-md mx-auto items-center justify-between rounded-2xl border border-gold-400/40 bg-gold-400/5 p-6 transition-all hover:border-gold-400/60 hover:bg-gold-400/10"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-gold-300/10 to-gold-500/5 border border-gold-400/30"><BookMarked className="h-6 w-6 text-gold-300" /></div><div className="text-right"><div className="font-display text-lg font-bold text-white">المصادر</div><div className="text-xs text-ink-300">ناصر عبدالكريم، يلو، غشام، إينشتاين</div></div></div><Plus className="h-6 w-6 text-gold-300 transition-transform group-hover:scale-110" /></button></div>
          ) : (
            <>
              <div className="space-y-4">
                {TAHSILI_SOURCES.map((source, i) => { const isExpanded = expandedSource === source.id; const selectedCount = countSubjectsForSource(source.id); return (
                  <div key={source.id} className={`rounded-2xl border overflow-hidden transition-all animate-fade-up ${isExpanded ? 'border-gold-400/40 bg-ink-850/60' : 'border-ink-700 bg-ink-850/60'}`} style={{ animationDelay: `${i * 60}ms` }}>
                    <button onClick={() => setExpandedSource(isExpanded ? null : source.id)} className="flex w-full items-center justify-between p-5 transition-colors hover:bg-ink-800/40">
                      <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-gold-300/10 to-gold-500/5 border border-ink-600/50"><BookMarked className="h-5 w-5 text-gold-300" /></div><div className="text-right"><div className="font-display text-lg font-bold text-white">{source.name}</div><div className="text-xs text-ink-300">4 مواد متاحة{selectedCount > 0 && <span className="text-gold-300"> · {selectedCount} محدد</span>}</div></div></div>
                      <ChevronDown className={`h-5 w-5 text-ink-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (<div className="grid gap-3 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-4">
                      {source.subjects.map((subject) => { const selected = isSubjectSelected(source.id, subject); const Icon = SUBJECT_ICONS[subject]; return (
                        <button key={subject} onClick={() => toggleSubject(source.id, source.name, subject)} className={`group relative overflow-hidden rounded-xl border p-4 text-center transition-all ${selected ? 'border-gold-400/60 bg-gradient-to-br from-gold-400/10 to-transparent shadow-glow-gold' : 'border-ink-700 bg-ink-850/70 hover:border-ink-500 hover:bg-ink-800/70'}`}>
                          {selected && <div className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-gold-400 text-ink-950"><Check className="h-3 w-3" strokeWidth={3} /></div>}
                          <div className={`mx-auto mb-2 grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${SUBJECT_BG[subject]} border border-ink-600/50`}><Icon className={`h-5 w-5 ${SUBJECT_COLORS[subject]}`} /></div>
                          <div className="font-display text-sm font-bold text-white">{TAHSILI_SUBJECTS[subject]}</div>
                          <div className="mt-1 text-[11px] font-bold">{selected ? <span className="text-gold-300">محدد</span> : <span className="flex items-center justify-center gap-1 text-ink-300 group-hover:text-gold-300"><Plus className="h-3 w-3" />إضافة</span>}</div>
                        </button>);})}
                    </div>)}
                  </div>);})}
              </div>
              {testTypeSources.length > 0 && (<div className="mt-8 text-center animate-pop"><button onClick={() => setShowInputs(true)} className="btn-gold"><ArrowLeft className="h-5 w-5" />التالي: إدخال البيانات والتواريخ</button></div>)}
            </>
          )
        ) : (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between"><button onClick={() => setShowInputs(false)} className="btn-ghost"><ChevronLeft className="h-4 w-4" />رجوب للاختيار</button><h2 className="font-display text-xl font-bold text-white">أدخل بياناتك</h2></div>
            <ScheduleConfigForm />
            {testTypeSources.map((s, i) => { const inp = inputs[s.id] || { videos: 0, tests: 0 }; return (
              <div key={s.id} className="card animate-fade-up p-5 sm:p-6" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="mb-4 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-400/15 font-display text-sm font-bold text-sky-300">{i + 1}</span><h3 className="font-display text-lg font-bold text-white">{s.name}</h3></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200"><PlayCircle className="h-3.5 w-3.5 text-sky-400" />عدد فيديوهات الشرح</label><input type="number" min={0} value={inp.videos || ''} onChange={(e) => setInput(s.id, { videos: Math.max(0, Number(e.target.value)) })} placeholder="مثال: 50" className="input-field" /></div>
                  <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200"><FileText className="h-3.5 w-3.5 text-gold-300" />عدد الاختبارات</label><input type="number" min={0} value={inp.tests || ''} onChange={(e) => setInput(s.id, { tests: Math.max(0, Number(e.target.value)) })} placeholder="مثال: 20" className="input-field" /></div>
                </div>
              </div>);})}
            <div className="pt-2 text-center">
              {genError && (<div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-right animate-fade-in"><AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" /><p className="text-sm text-red-300">{genError}</p></div>)}
              <button onClick={handleGenerate} disabled={!allReady} className="btn-gold w-full sm:w-auto sm:px-10 sm:py-4 sm:text-lg"><Sparkles className="h-6 w-6" />توليد الجدول الذكي</button>{!allReady && <p className="mt-3 text-xs text-ink-400">أدخل عدداً صحيحاً للفيديوهات أو الاختبارات لكل مادة</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
