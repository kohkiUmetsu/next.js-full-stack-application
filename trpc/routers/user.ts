import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

/**
 * ユーザー関連のルーター
 */
export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async (opts) => {
    const { ctx } = opts;

    // Supabaseからユーザー情報を取得
    const { data: profile } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('id', ctx.userId)
      .single();

    return { profile };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async (opts) => {
      const { ctx, input } = opts;

      // プロファイル更新
      const { data, error } = await ctx.supabase
        .from('profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { profile: data };
    }),
});
