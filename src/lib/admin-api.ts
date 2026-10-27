import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Use service key if available, fallback to anon key
const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { persistSession: false, storageKey: 'sb-admin-auth' },
});

export async function adminApi(
  action: string,
  table: string,
  payload?: Record<string, unknown>
) {
  const {
    id,
    filters,
    orderBy,
    selectQuery,
    searchColumn,
    page,
    pageSize,
    data: insertData,
  } = (payload || {}) as any;

  switch (action) {
    case 'list': {
      const size = pageSize || 5000;
      const from = page ? (page - 1) * size : 0;
      const to = from + size - 1;

      let query = adminClient.from(table).select(selectQuery || '*', { count: 'exact' });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'search' && typeof value === 'string') {
              query = (query as any).ilike(searchColumn || 'name', '%' + value + '%');
            } else {
              query = (query as any).eq(key, value);
            }
          }
        });
      }
      if (orderBy) {
        query = (query as any).order(orderBy.column, { ascending: orderBy.ascending });
      }
      query = (query as any).range(from, to);

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);
      return { rows: data ?? [], total: count ?? 0 };
    }
    case 'create': {
      const { data, error } = await adminClient.from(table).insert(insertData).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case 'update': {
      const { data, error } = await adminClient.from(table).update(insertData).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case 'delete': {
      const { error } = await adminClient.from(table).delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
    case 'orders_with_items': {
      const { data, error } = await adminClient
        .from('order_headers')
        .select('*, order_items(*)')
        .limit(500)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { rows: data ?? [], total: data?.length ?? 0 };
    }
    default:
      throw new Error('Unknown action: ' + action);
  }
}
