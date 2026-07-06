import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_TOKEN = "igrajse-admin-2025";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (auth !== ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const { action, table, data, id, filters, orderBy, selectQuery, searchColumn } = body;

    let result;

    switch (action) {
      case "list": {
        let query = supabase.from(table).select(selectQuery || "*");
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              if (key === "search" && typeof value === "string") {
                const col = searchColumn || "name";
                query = query.ilike(col, `%${value}%`);
              } else {
                query = query.eq(key, value);
              }
            }
          });
        }
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending });
        }
        const { data: rows, error } = await query;
        if (error) throw error;
        result = rows;
        break;
      }
      case "create": {
        const { data: row, error } = await supabase.from(table).insert(data).select().single();
        if (error) throw error;
        result = row;
        break;
      }
      case "update": {
        const { data: row, error } = await supabase.from(table).update(data).eq("id", id).select().single();
        if (error) throw error;
        result = row;
        break;
      }
      case "delete": {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }
      case "orders_with_items": {
        const { data: rows, error } = await supabase
          .from("order_headers")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = rows;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
