/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { router, publicProcedure, privateProcedure } from "../trpc"
import { Prisma } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { db } from "@/lib/db"

/**
 * Default selector for Post.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */

export const notificationRouter = router({
    list: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),
                initialCursor: z.string().nullish(),
            })
        )
        .query(async ({ input }) => {
            /**
             * For pagination docs you can have a look here
             * @see https://trpc.io/docs/useInfiniteQuery
             * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
             */

            const limit = input.limit ?? 20
            const cursor = input.cursor ?? input.initialCursor

            const items = await db.notification.findMany({
                // get an extra item to know if there's a next page
                take: limit + 1,
                where: {},
                cursor: cursor
                    ? {
                          id: cursor,
                      }
                    : undefined,
                orderBy: {
                    createdAt: "desc",
                },
            })

            console.log("Items", items)
            let nextCursor: string | undefined = undefined

            if (items.length > limit) {
                // Remove the last item and use it as next cursor

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const lastItem = items.pop()!
                nextCursor = lastItem.id
            }

            return {
                items: items,
                nextCursor,
            }
        }),
})
