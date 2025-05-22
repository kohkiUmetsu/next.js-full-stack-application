import { createTRPCRouter } from '@/trpc/init';
import { userRouter } from './user';
import { publicRouter } from './public';
import { contentRouter } from './content';
import { exampleRouter } from './example';

/**
 * メインのAPIルーター定義
 * 複数のサブルーターをマージして一つのルーターにします
 */
export const appRouter = createTRPCRouter({
  // 各機能別のルーターをマージ
  user: userRouter,
  public: publicRouter,
  content: contentRouter,
  example: exampleRouter,

  // 必要に応じて、ここに直接ルートを追加することも可能
});

// export type definition of API
export type AppRouter = typeof appRouter;
