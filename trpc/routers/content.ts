import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

/**
 * コンテンツ管理用ルーター
 */
export const contentRouter = createTRPCRouter({
  // コンテンツ一覧を取得
  getMyContents: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          cursor: z.number().optional(), // ページネーション用
        })
        .optional()
    )
    .query(async (opts) => {
      const { ctx, input } = opts;
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      let query = ctx.supabase
        .from('contents')
        .select('*')
        .eq('user_id', ctx.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cursor) {
        query = query.lt('id', cursor); // カーソルベースのページネーション
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          cause: error,
        });
      }

      // 次のカーソルを計算
      let nextCursor: number | undefined = undefined;
      if (data.length === limit) {
        nextCursor = data[data.length - 1].id;
      }

      return {
        items: data,
        nextCursor,
      };
    }),

  // 新しいコンテンツを作成
  createContent: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        content: z.string(),
        is_public: z.boolean().default(false),
        slug: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async (opts) => {
      const { ctx, input } = opts;

      // スラッグが指定されていない場合はタイトルから生成
      const slug =
        input.slug ||
        input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const { data, error } = await ctx.supabase
        .from('contents')
        .insert({
          ...input,
          slug,
          user_id: ctx.userId,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
          cause: error,
        });
      }

      return { content: data };
    }),

  // コンテンツを更新
  updateContent: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(100).optional(),
        content: z.string().optional(),
        is_public: z.boolean().optional(),
        slug: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async (opts) => {
      const { ctx, input } = opts;
      const { id, ...updateData } = input;

      // 先にコンテンツの所有者を確認
      const { data: existingContent } = await ctx.supabase
        .from('contents')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existingContent || existingContent.user_id !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'このコンテンツを編集する権限がありません',
        });
      }

      // 更新実行
      const { data, error } = await ctx.supabase
        .from('contents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
          cause: error,
        });
      }

      return { content: data };
    }),

  // コンテンツを削除
  deleteContent: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async (opts) => {
      const { ctx, input } = opts;

      // 先にコンテンツの所有者を確認
      const { data: existingContent } = await ctx.supabase
        .from('contents')
        .select('user_id')
        .eq('id', input.id)
        .single();

      if (!existingContent || existingContent.user_id !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'このコンテンツを削除する権限がありません',
        });
      }

      // 削除実行
      const { error } = await ctx.supabase.from('contents').delete().eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          cause: error,
        });
      }

      return { success: true };
    }),
});
