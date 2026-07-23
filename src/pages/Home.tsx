import { useApp } from '../context/AppContext';
import { Sparkles, CalendarDays, TrendingUp, Layers, ArrowLeft } from 'lucide-react';

export default function Home() {
  const { setPage, schedule, scheduleConfirmed } = useApp();

  return (
    <div className="animate-fade-in px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/5 px-4 py-1.5 text-xs font-bold text-gold-300">
            <Sparkles className="h-4 w-4" />
            منظومة المذاكرة الذكية
          </div>
          <h1 className="section-title text-4xl text-white sm:text-5xl">
            خطط. ذاكر. تفوّق.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-300">
            نظام تخطيط ذكي لطلاب الثانوية في المملكة العربية السعودية، يساعدك على الاستعداد لاختباري القدرات والتحصيلي بجدول منظّم ومتابعة دقيقة.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={Layers}
            title="مصادر متعددة"
            desc="اختر مصادرك من القدرات أو التحصيلي وأدخل كميتها"
            color="gold"
          />
          <FeatureCard
            icon={CalendarDays}
            title="جدول تلقائي"
            desc="نوّلد لك جدولاً يومياً مرتباً حسب تواريخك وأيام إجازتك"
            color="sky"
          />
          <FeatureCard
            icon={TrendingUp}
            title="متابعة وتقدم"
            desc="تابع إنجازك يوم بيوم مع شعلة الاستمرارية ومؤقت المذاكرة"
            color="gold"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ActionCard
            onClick={() => setPage('qiyas')}
            icon={Sparkles}
            title="جدول القدرات"
            desc="ابدأ التحضير لاختبار القدرات (القياس)"
            color="gold"
          />
          <ActionCard
            onClick={() => setPage('tahsili')}
            icon={Sparkles}
            title="جدول التحصيلي"
            desc="ابدأ التحضير لاختبار التحصيلي (التحصيلي)"
            color="sky"
          />
        </div>

        {schedule && scheduleConfirmed && (
          <div className="mt-8 animate-pop">
            <button
              onClick={() => setPage('schedule')}
              className="card flex w-full items-center justify-between p-5 transition-all hover:border-gold-400/40"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold-400/10 border border-gold-400/30">
                  <CalendarDays className="h-6 w-6 text-gold-300" />
                </div>
                <div className="text-right">
                  <div className="font-display text-base font-bold text-white">لديك جدول ساري</div>
                  <div className="text-xs text-ink-300">اضغط لمتابعة جدولك الحالي</div>
                </div>
              </div>
              <ArrowLeft className="h-5 w-5 text-gold-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: typeof Layers; title: string; desc: string; color: 'gold' | 'sky' }) {
  const colorClass = color === 'gold' ? 'text-gold-300' : 'text-sky-400';
  const bgClass = color === 'gold' ? 'from-gold-300/10 to-gold-500/5' : 'from-sky-400/10 to-sky-600/5';
  return (
    <div className="card p-5">
      <div className={`mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${bgClass} border border-ink-600/50`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <h3 className="mb-1 font-display text-base font-bold text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-ink-300">{desc}</p>
    </div>
  );
}

function ActionCard({ onClick, icon: Icon, title, desc, color }: { onClick: () => void; icon: typeof Layers; title: string; desc: string; color: 'gold' | 'sky' }) {
  const colorClass = color === 'gold' ? 'text-gold-300' : 'text-sky-400';
  const bgClass = color === 'gold' ? 'from-gold-300/10 to-gold-500/5' : 'from-sky-400/10 to-sky-600/5';
  return (
    <button onClick={onClick} className="card group p-6 text-right transition-all hover:-translate-y-1 hover:border-gold-400/40">
      <div className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${bgClass} border border-ink-600/50 transition-transform group-hover:scale-110`}>
        <Icon className={`h-7 w-7 ${colorClass}`} />
      </div>
      <h3 className="mb-1 font-display text-xl font-bold text-white">{title}</h3>
      <p className="text-sm text-ink-300">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-bold text-gold-300">
        <span>ابدأ الآن</span>
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      </div>
    </button>
  );
}
