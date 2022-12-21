import { EmptyPlaceholder } from "@/components/dashboard/empty-placeholder"
import { DashboardShell } from "@/components/dashboard/shell"
import { BountyCreateButton } from "@/components/project/bounty-create-button"
import BountyList from "@/components/project/bounty-list"
import { authOptions } from "@/lib/auth"
import { getBountiesForProject } from "@/lib/bounties"
import { getProject } from "@/lib/projects"
import { getCurrentUser } from "@/lib/session"
import { Headline } from "@/ui/headline"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import { BrowseBountyList } from "@/components/browse/bounty-list"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { Button } from "@/ui/button"
import { BrowseSearch } from "@/components/browse/browse-search"
import { db } from "@/lib/db"

interface ProfilePageProps {
    params: { projectId: string }
    searchParams: { page: string; search: string }
}

export default async function ProjectPage({
    params,
    searchParams,
}: ProfilePageProps) {
    const project = await db.project.findUnique({
        where: {
            id: params.projectId,
        },
        include: {
            users: true,
            githubRepo: true,
            bounties: {
                where: {
                    published: true,
                },
            },
        },
    })

    if (!project) {
        notFound()
    }

    const bounties = project.bounties

    return (
        <DashboardShell>
            <div className="mt-12">
                <div>
                    <Link href={`/browse`}>
                        <Button
                            intent="tertiary"
                            className="inline-flex items-center justify-start gap-2 mb-8"
                            size="small"
                        >
                            <Icons.chevronLeft size={16} />
                            Backs to All Bounties
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="w-full space-y-8 col-span-4 lg:col-span-1">
                        <div className="border border-raised-border rounded-lg p-4 py-6 w-full">
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 rounded-full overflow-hidden inline-flex items-center justify-center relative">
                                    <Image
                                        fill={true}
                                        alt="Project avatar"
                                        src={`https://avatar.vercel.sh/${project.name}${project.id}`}
                                    />
                                </div>
                                <div className="mt-8">
                                    <span className="text-brandtext-500 font-bold text-xl inline-flex gap-2 items-center text-center">
                                        {project.name}{" "}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <span className="text-brandtext-600 inline-flex gap-2 items-center">
                                        {project.bounties.length} Bounties
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {bounties.length ? (
                        <div className="col-span-4 lg:col-span-3">
                            <div className="mb-4">
                                <Headline heading="Bounties" />
                            </div>

                            <BountyList
                                showControls={false}
                                showDrafts={false}
                                project={{
                                    id: project.id,
                                }}
                                bounties={bounties}
                            />
                        </div>
                    ) : (
                        <div className="col-span-3">
                            <EmptyPlaceholder>
                                <EmptyPlaceholder.Icon name="logo" />
                                <EmptyPlaceholder.Title>
                                    No bounties created
                                </EmptyPlaceholder.Title>
                                <EmptyPlaceholder.Description>
                                    You don't have any feature requests or issue
                                    bounties yet. Create one and reward
                                    contributors!
                                </EmptyPlaceholder.Description>
                                <BountyCreateButton
                                    project={{
                                        id: project.id,
                                    }}
                                />
                            </EmptyPlaceholder>
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    )
}
