import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';

/**
 * 認証不要の公開APIルーター
 */
export const publicRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.ctx.userId ?? 'guest'}, ${opts.input.text}`,
      };
    }),

  getPublicContent: baseProcedure
    .input(
      z
        .object({
          slug: z.string(),
        })
        .optional()
    )
    .query(async (opts) => {
      const { ctx, input } = opts;

      // 公開コンテンツを取得する例
      let query = ctx.supabase.from('contents').select('*').eq('is_public', true);

      if (input?.slug) {
        query = query.eq('slug', input.slug);
      }

      const { data } = await query;

      return { contents: data };
    }),
});
