import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BOT_TOKEN = "8680195287:AAGXXut0CogncD750NO1UD8hNx43_B_-LLU";
const GROUP_ID = "@gadrat_990";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body?.action;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (action === "create") {
      let code = generateCode();
      let attempts = 0;
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from("telegram_sessions")
          .select("id")
          .eq("code", code)
          .maybeSingle();
        if (!existing) break;
        code = generateCode();
        attempts++;
      }

      const { data, error } = await supabase
        .from("telegram_sessions")
        .insert({ code, status: "pending" })
        .select("code")
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        ok: true,
        code: data.code,
        deepLink: `https://t.me/Jadwaly111_bot?start=${data.code}`,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "poll") {
      const { code } = body;
      if (!code) {
        return new Response(JSON.stringify({ ok: false, error: "code is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: session } = await supabase
        .from("telegram_sessions")
        .select("status, telegram_user_id, telegram_first_name")
        .eq("code", code)
        .maybeSingle();

      if (!session) {
        return new Response(JSON.stringify({ ok: false, error: "session not found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const status = session.status;
      return new Response(JSON.stringify({
        ok: true,
        status,
        telegramUserId: session.telegram_user_id,
        telegramFirstName: session.telegram_first_name,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check") {
      const { telegramUserId } = body;
      if (!telegramUserId) {
        return new Response(JSON.stringify({ ok: false, error: "telegramUserId is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tgRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(GROUP_ID)}&user_id=${encodeURIComponent(telegramUserId)}`
      );
      const tgData = await tgRes.json();

      if (!tgData.ok) {
        return new Response(JSON.stringify({ ok: false, error: tgData.description ?? "Telegram API error" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const status = tgData.result?.status as string;
      const isMember = ["member", "creator", "administrator"].includes(status);

      return new Response(JSON.stringify({ ok: true, status, isMember }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
