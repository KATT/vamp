import { CalendarIcon } from "@heroicons/react/20/solid"
import { Skeleton } from "@/ui/skeleton"

import Link from "next/link"
import { Outputs } from "@/shared/utils"

export type PostListOutput = Outputs["notification"]["list"]
type NotificationItem = PostListOutput["items"][number]

export function NotificationListItem(props: {
    notification: NotificationItem
}) {
    const { notification } = props
    return (
        <Link
            href={`/notification/${notification.id}`}
            className='block hover:bg-gray-50 px-4 py-4 sm:px-6"'
        >
            <div>
                <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-brandtext-500">
                        {notification.title}
                    </p>
                </div>
            </div>
        </Link>
    )
}

NotificationListItem.Skeleton = function PostListItemSkeleton() {
    return (
        <div>
            <Skeleton className="h-9 w-full" />
        </div>
    )
}
