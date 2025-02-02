import "server-only"

import { db } from "./db"
import { cache } from "react"
import {
    Project,
    User,
    ProjectUsers,
    GithubRepository,
    Bounty,
} from "@prisma/client"
import { getCurrentUser } from "./session"

export const preloadProjects = (userId: User["id"]) => {
    void getProjectsForUser(userId)
}

export const getProjectsForUser = cache(async (userId: User["id"]) => {
    return await db.projectUsers.findMany({
        where: {
            userId,
        },
        include: {
            project: {
                include: {
                    users: true,
                    githubRepo: true,
                },
            },
            user: {
                include: {
                    accounts: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    })
})

export const preloadProject = (projectId: User["id"]) => {
    void getProject(projectId)
}

export type TProject = Project & {
    users: ProjectUsers[]
    githubRepo: GithubRepository
    bounties: Bounty[]
}
export const getProject = cache(
    async (projectId: Project["id"]): Promise<TProject> => {
        return await db.project.findUnique({
            where: {
                id: projectId,
            },
            include: {
                users: true,
                githubRepo: true,
                bounties: true,
            },
        })
    }
)

export const isProjectOwner = cache(
    async (projectId: Project["id"]): Promise<boolean> => {
        const user = await getCurrentUser()

        const count = await db.project.count({
            where: {
                id: projectId,
                users: {
                    some: {
                        userId: user?.id,
                    },
                },
            },
        })

        return Boolean(user && count > 0)
    }
)
