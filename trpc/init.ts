import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * tRPC 応答時に参照できるコンテキストの生成関数.
 */
export const createTRPCContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    supabase,
    session,
    userId: session?.user.id,
  };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * 認証が必要なProcedure
 * コンテキストからsessionが存在するか確認し、存在しない場合はエラーをスローします
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      // ここで型を保証：セッションとユーザーIDが必ず存在する
      session: ctx.session,
      userId: ctx.userId,
    },
  });
});
