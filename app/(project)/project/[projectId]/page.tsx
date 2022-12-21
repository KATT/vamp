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
interface ProjectPageProps {
    params: { projectId: string }
    searchParams: { id: string }
}

export default async function ProjectPage({
    params,
    searchParams,
}: ProjectPageProps) {
    const user = await getCurrentUser()

    if (!user) {
        redirect(authOptions.pages.signIn)
    }

    const project = await getProject(params.projectId)

    if (!project) {
        notFound()
    }

    const bounties = project.bounties

    return (
        <DashboardShell>
            <div className="mt-12">
                <div className="mb-8">
                    <Headline
                        heading="Bounties"
                        text="To create a new Bounty, import one from an existing Github issue or create one."
                    />
                </div>
                {bounties.length ? (
                    <>
                        <BountyList
                            project={{
                                id: project.id,
                            }}
                            bounties={bounties}
                        />
                    </>
                ) : (
                    <EmptyPlaceholder>
                        <EmptyPlaceholder.Icon name="logo" />
                        <EmptyPlaceholder.Title>
                            No bounties created
                        </EmptyPlaceholder.Title>
                        <EmptyPlaceholder.Description>
                            You don't have any feature requests or issue
                            bounties yet. Create one and reward contributors!
                        </EmptyPlaceholder.Description>
                        <BountyCreateButton
                            project={{
                                id: project.id,
                            }}
                        />
                    </EmptyPlaceholder>
                )}
            </div>
        </DashboardShell>
    )
}
