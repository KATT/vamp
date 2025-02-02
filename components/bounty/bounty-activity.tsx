import { BountySubmissionList } from "@/components/bounty/bounty-submission-list"
import { BountySubmissionsEmpty } from "@/components/bounty/bounty-submissions-empty"
import { SubmissionCreateButton } from "@/components/project/submission-create-button"
import { getBountyById } from "@/lib/bounties"
import { getCurrentUser } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/ui/button"
import { StripeNotConnectedModal } from "@/ui/stripe-not-connected-modal"

interface TBountyActivity {
    bountyId: string
}

export async function BountyActivity({ bountyId }: TBountyActivity) {
    const [bounty, user] = await Promise.all([
        getBountyById(bountyId),
        getCurrentUser(),
    ])

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-brandtext-500 text-2xl font-bold">
                    Activity
                </h3>
                {bounty.bountySubmissions?.length &&
                !bounty.resolved &&
                user ? (
                    <>
                        {user.stripeCustomerId ? (
                            <SubmissionCreateButton
                                bounty={{
                                    id: bountyId,
                                }}
                            />
                        ) : (
                            <StripeNotConnectedModal>
                                <Button>Post solution</Button>
                            </StripeNotConnectedModal>
                        )}
                    </>
                ) : (
                    <>
                        {!user && (
                            <Link href="/login">
                                <Button size="small" intent="primary">
                                    Login to participate
                                </Button>
                            </Link>
                        )}
                    </>
                )}
            </div>
            {bounty.bountySubmissions?.length ? (
                <>
                    {/* @ts-expect-error Server Component */}
                    <BountySubmissionList
                        bountyId={bounty.id}
                        resolved={bounty.resolved}
                        bountyStripePriceId={bounty.stripePriceId}
                        bountySubmissions={bounty.bountySubmissions}
                    />
                </>
            ) : (
                <>
                    {/* @ts-expect-error Server Component */}
                    <BountySubmissionsEmpty bountyId={bountyId} />
                </>
            )}
        </>
    )
}
