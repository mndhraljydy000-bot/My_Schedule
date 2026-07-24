import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BOT_TOKEN = "8680195287:AAGXXut0CogncD750NO1UD8hNx43_B_-LLU";
const GROUP_ID = "@gadrat_990";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text: string = message.text ?? "";
    const fromId: number = message.from?.id;
    const fromName: string = message.from?.first_name ?? "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle /start <code>
    const match = text.match(/^\/start\s+(\S+)/);
    if (match) {
      const code = match[1];

      const { data: session } = await supabase
        .from("telegram_sessions")
        .select("status")
        .eq("code", code)
        .maybeSingle();

      if (!session) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: fromId,
            text: "رمز التحقق غير صالح. يرجى العودة للموقع والحصول على رمز جديد.",
          }),
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check membership
      const tgRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(GROUP_ID)}&user_id=${fromId}`
      );
      const tgData = await tgRes.json();
      const memberStatus = tgData.result?.status as string;
      const isMember = ["member", "creator", "administrator"].includes(memberStatus);

      const newStatus = isMember ? "verified" : "not_member";

      await supabase
        .from("telegram_sessions")
        .update({
          status: newStatus,
          telegram_user_id: fromId,
          telegram_first_name: fromName,
          updated_at: new Date().toISOString(),
        })
        .eq("code", code);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: fromId,
          text: isMember
            ? "✅ تم التحقق من عضويتك بنجاح! يمكنك الآن العودة للموقع — سيتم إنشاء جدولك تلقائياً."
            : "❌ لم نجد عضويتك في المجموعة. يرجى الانضمام للمجموعة أولاً ثم أعد إرسال /start مع الرمز.\n\nرابط المجموعة: https://t.me/gadrat_990",
        }),
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Any other message — tell user to use the site
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: fromId,
        text: "مرحباً! لاستخدام البوت، افتح الموقع واضغط على زر إنشاء الجدول. ستحصل على رمز تحقق، أرسله هنا بصيغة /start <الرمز>.",
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
