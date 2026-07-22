import { useApp } from '../context/AppContext';
import { formatArabicDate } from '../utils/scheduler';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { Brain, GraduationCap, CalendarDays, ArrowLeft, Sparkles, Target, Layers, Flame, Trash2, TrendingUp, PlayCircle, FileText } from 'lucide-react';

export default function Home() {
  const { setPage, selectedSources, schedule, scheduleConfirmed, clearSchedule, streak, progress, completedDays, showDeleteWarning, setShowDeleteWarning } = useApp();

  const features = [
    { icon: Layers, title: 'خطة تتابعية ذكية', desc: 'التأسيس أولاً ثم التدريب — أو مادة واحدة في اليوم للتحصيلي.', color: 'text-gold-300', bg: 'from-gold-300/10 to-gold-500/5' },
    { icon: CalendarDays, title: 'جدول بتقويم حقيقي', desc: 'حدد تواريخك وأيام إجازتك، ووزّع جدولك على التقويم الفعلي.', color: 'text-sky-400', bg: 'from-sky-400/10 to-sky-600/5' },
    { icon: Flame, title: 'شعلة الاستمرارية', desc: 'حافظ على شعلتك كل يوم تلتزم فيه تزيد الشعلة.', color: 'text-flame-500', bg: 'from-flame-500/10 to-flame-600/5' },
    { icon: Target, title: 'مهام مفصلة ودقيقة', desc: 'كل فيديو واختبار له مربع مستقل — تتبع دقيق لكل خطوة.', color: 'text-emerald-400', bg: 'from-emerald-400/10 to-emerald-500/5' },
  ];

  const steps = [
    { num: '١', title: 'اختر القسم', desc: 'القدرات أو التحصيلي' },
    { num: '٢', title: 'حدد المصادر', desc: 'تأسيس + تدريب' },
    { num: '٣', title: 'أدخل بياناتك', desc: 'فيديوهات، تواريخ، مراجعة' },
    { num: '٤', title: 'ولّد وأكد الجدول', desc: 'تقويم + تتبع + شعلة' },
  ];

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10"><div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" /><div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" /></div>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex animate-pop items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-bold text-gold-200"><Sparkles className="h-3.5 w-3.5" />مساعد طالب الثانوي الذكي</div>
          <h1 className="section-title text-4xl leading-tight text-white sm:text-6xl">نظّم جدول مذاكرتك<br /><span className="bg-gradient-to-l from-gold-200 via-gold-400 to-gold-300 bg-clip-text text-transparent">للقدرات والتحصيلي</span><br />بأسلوب احترافي</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">منصة متطورة تبني لك خطة مذاكرة تتابعية متكاملة، مع توزيع ذكي على تقويم فعلي، مهام مفصلة لكل فيديو واختبار، أيام مراجعة ذكية، وشعلة استمرارية تحفزك.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => setPage('qiyas')} className="btn-gold w-full sm:w-auto"><Brain className="h-5 w-5" />ابدأ بتنظيم القدرات</button>
            <button onClick={() => setPage('tahsili')} className="btn-sky w-full sm:w-auto"><GraduationCap className="h-5 w-5" />ابدأ بتنظيم التحصيلي</button>
          </div>
        </div>
      </section>

      {schedule && scheduleConfirmed && (
        <section className="px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="card relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 -z-10"><div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-gold-500/10 blur-3xl" /></div>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2"><CalendarDays className="h-6 w-6 text-gold-300" /><h2 className="font-display text-xl font-bold text-white">جدولك الحالي</h2></div>
                <div className="flex items-center gap-2">
                  {streak > 0 && (<div className="flex items-center gap-1.5 rounded-full border border-flame-500/30 bg-flame-500/10 px-3 py-1.5 text-xs font-bold text-flame-400"><Flame className="h-4 w-4 animate-flame-flicker" />{streak} أيام</div>)}
                  <button onClick={() => setShowDeleteWarning(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20" title="حذف الجدول"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mb-4 text-sm text-ink-300">من {formatArabicDate(schedule.startDate)} إلى {formatArabicDate(schedule.endDate)}</p>
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-ink-700 bg-ink-800/40 p-3 text-center"><PlayCircle className="mx-auto mb-1 h-5 w-5 text-sky-400" /><div className="font-display text-lg font-bold text-white">{schedule.totalVideos}</div><div className="text-[10px] text-ink-300">فيديوهات</div></div>
                <div className="rounded-xl border border-ink-700 bg-ink-800/40 p-3 text-center"><FileText className="mx-auto mb-1 h-5 w-5 text-gold-300" /><div className="font-display text-lg font-bold text-white">{schedule.totalTests}</div><div className="text-[10px] text-ink-300">اختبارات</div></div>
                <div className="rounded-xl border border-ink-700 bg-ink-800/40 p-3 text-center"><CalendarDays className="mx-auto mb-1 h-5 w-5 text-sky-400" /><div className="font-display text-lg font-bold text-white">{schedule.days.length}</div><div className="text-[10px] text-ink-300">أيام دراسة</div></div>
              </div>
              <div className="mb-2 flex items-center justify-between text-xs"><span className="font-bold text-ink-200">نسبة الإنجاز</span><span className="font-bold text-gold-300">{completedDays} / {schedule.days.length} يوم</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-ink-800"><div className="h-full rounded-full bg-gradient-to-l from-gold-300 to-gold-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
              <div className="mt-5 text-center"><button onClick={() => setPage('schedule')} className="btn-gold"><TrendingUp className="h-5 w-5" />متابعة الجدول</button></div>
            </div>
          </div>
        </section>
      )}

      {selectedSources.length > 0 && !scheduleConfirmed && (
        <div className="px-4 pb-4 text-center sm:px-6"><button onClick={() => setPage('schedule')} className="btn-ghost"><CalendarDays className="h-4 w-4 text-gold-300" />لديك {selectedSources.length} مصادر محددة — أكمل الإعداد<ArrowLeft className="h-4 w-4" /></button></div>
      )}

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center"><h2 className="section-title text-2xl text-white sm:text-3xl">لماذا منظومة المذاكرة؟</h2><p className="mt-2 text-sm text-ink-300">كل ما تحتاجه لتنظيم مذاكرتك في مكان واحد</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => { const Icon = f.icon; return (
              <div key={i} className="card animate-fade-up p-6 transition-all hover:-translate-y-1 hover:border-ink-500" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${f.bg} border border-ink-600/50`}><Icon className={`h-6 w-6 ${f.color}`} /></div>
                <h3 className="mb-2 font-display text-base font-bold text-white">{f.title}</h3><p className="text-sm leading-relaxed text-ink-300">{f.desc}</p>
              </div>);})}
          </div>
        </div>
      </section>
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center"><h2 className="section-title text-2xl text-white sm:text-3xl">كيف تعمل المنظومة؟</h2><p className="mt-2 text-sm text-ink-300">أربع خطوات بسيطة تفصلك عن جدولك المثالي</p></div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="card animate-fade-up p-6 text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 font-display text-2xl font-black text-ink-950 shadow-glow-gold">{s.num}</div>
                <h3 className="mb-1 font-bold text-white">{s.title}</h3><p className="text-xs text-ink-300">{s.desc}</p>
              </div>))}
          </div>
        </div>
      </section>
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="card relative overflow-hidden p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 -z-10"><div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" /><div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" /></div>
            <h2 className="section-title text-2xl text-white sm:text-3xl">جاهز لتنظيم مذاكرتك؟</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-300">ابدأ الآن وولّد جدولك الذكي في أقل من دقيقة</p>
            <button onClick={() => setPage('qiyas')} className="btn-gold mt-6"><Sparkles className="h-5 w-5" />ابدأ الآن مجاناً</button>
          </div>
        </div>
      </section>

      <DeleteConfirmDialog
        open={showDeleteWarning}
        onClose={() => setShowDeleteWarning(false)}
        onConfirm={() => { clearSchedule(); setShowDeleteWarning(false); setPage('home'); }}
        title="حذف الجدول"
        message="هل أنت متأكد من حذف الجدول؟ سيتم حذف جميع المهام والتقدم والشعلة. لا يمكن التراجع عن هذا الإجراء."
      />
    </div>
  );
}
