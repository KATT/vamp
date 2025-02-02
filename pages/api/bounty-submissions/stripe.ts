import { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession } from "next-auth/next"
import * as z from "zod"

import { withMethods } from "@/lib/api-middlewares/with-methods"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { getBaseUrl } from "@/lib/utils"
import { bountyAcceptSchema } from "@/lib/validations/bountySubmission"
import { platformFee } from "@/lib/stripe"

export type returnUrlQueryParams =
    | "create"
    | "stripeAccountUpdate"
    | "stripeAccountCreation"
    | null

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions)

    if (!session) {
        return res.status(403).end()
    }

    if (req.method === "POST") {
        try {
            const body = bountyAcceptSchema.parse(req.body)

            const price = await stripe.prices.retrieve(body.bountyStripePriceId)

            const fee = platformFee(price.unit_amount)

            console.log("Fee", fee)

            const paymentLink = await stripe.paymentLinks.create({
                line_items: [
                    {
                        price: body.bountyStripePriceId,
                        quantity: 1,
                    },
                ],
                after_completion: {
                    type: "redirect",
                    redirect: {
                        url: `${getBaseUrl()}/bounty/${body.bountyId}`,
                    },
                },
                transfer_data: {
                    destination: body.bountySubmissionUserStripeId,
                },
                application_fee_amount: platformFee(price.unit_amount),
                metadata: {
                    bountyId: body.bountyId,
                    submissionId: body.submissionId,
                },
            })
            return res.json(paymentLink)
        } catch (error) {
            console.log("Error", error)
            if (error instanceof z.ZodError) {
                return res.status(422).json(error.issues)
            }

            return res.status(500).end()
        }
    }
}

export default withMethods(["POST"], handler)
