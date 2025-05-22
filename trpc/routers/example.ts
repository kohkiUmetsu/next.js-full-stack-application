import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import db from '@/src/db';
import { desc, eq } from 'drizzle-orm';
import { ExampleTable } from '@/src/db/schema/example';

/**
 * Exampleテーブル用ルーター
 * drizzle-ormを使用したクエリ例
 */
export const exampleRouter = createTRPCRouter({
  // 全件取得するpublic procedure
  getAllExamples: baseProcedure.query(async () => {
    try {
      // drizzleを使ってExampleテーブルから全件取得
      const examples = await db.select().from(ExampleTable).orderBy(desc(ExampleTable.createdAt));

      return {
        examples,
        count: examples.length,
      };
    } catch (error) {
      console.error('Examples取得エラー:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Exampleデータの取得に失敗しました',
        cause: error,
      });
    }
  }),

  // ID指定で取得するpublic procedure
  getExampleById: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        // drizzleを使って特定のIDのレコードを取得
        const example = await db
          .select()
          .from(ExampleTable)
          .where(eq(ExampleTable.id, input.id))
          .limit(1);

        if (!example.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `ID: ${input.id}のExampleが見つかりません`,
          });
        }

        return {
          example: example[0],
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Example取得エラー:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Exampleデータの取得に失敗しました',
          cause: error,
        });
      }
    }),
});
