"use client"

import { dehydrate, useQueryClient } from "@tanstack/react-query"
import { Fragment, useEffect, useRef } from "react"
import { trpc } from "@/client/trpcClient"
import { useIsIntersecting } from "../client/useIsIntersecting"
import { NotificationListItem } from "./notification-list-item"
import { Button } from "@/ui/button"

function useRenderCount() {
    const ref = useRef(0)
    useEffect(() => {
        ref.current++
    })
    return ref.current
}

export function NotificationList() {
    const [isLoadMoreVisible, ref] = useIsIntersecting<HTMLDivElement>()

    const queryClient = useQueryClient()
    console.log(
        `hydrated client (render #${useRenderCount()})`,
        dehydrate(queryClient)
    )

    // @ts-ignore
    const query = trpc.notification.list.useInfiniteQuery(
        {},
        {
            getNextPageParam(lastPage) {
                return lastPage.nextCursor
            },
            refetchOnMount: false,
            staleTime: Infinity,
        }
    )

    const fetchNextPageRef = useRef(query.fetchNextPage)
    fetchNextPageRef.current = query.fetchNextPage

    useEffect(() => {
        if (isLoadMoreVisible && query.hasNextPage && !query.isFetching) {
            fetchNextPageRef.current()
        }
    }, [isLoadMoreVisible, query.hasNextPage, query.isFetching])

    return (
        <ul role="list" className="divide-y divide-palette-300">
            {query.data?.pages.map((page, index) => (
                <Fragment key={index}>
                    {page.items.map((notification) => (
                        <NotificationListItem
                            key={notification.id}
                            notification={notification}
                        />
                    ))}
                </Fragment>
            ))}
            <div ref={ref}>
                {query.isFetchingNextPage ? (
                    <NotificationListItem.Skeleton />
                ) : (
                    <Button
                        intent="text"
                        disabled={!query.hasNextPage}
                        onClick={() => {
                            query.fetchNextPage()
                        }}
                        className={
                            "p-4 w-full cursor-pointer" +
                            (!query.hasNextPage ? " opacity-50" : "")
                        }
                    >
                        {query.hasNextPage
                            ? "Load more"
                            : "No more notifications to load"}
                    </Button>
                )}
            </div>
        </ul>
    )
}
