"use client"

import "./editor.css"

import * as React from "react"
import EditorJS from "@editorjs/editorjs"
import { Bounty, Project } from "@prisma/client"
import { useForm } from "react-hook-form"
import Link from "next/link"
import TextareaAutosize from "react-textarea-autosize"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { bountyPatchSchema } from "@/lib/validations/bounty"
import { toast } from "@/ui/toast"
import { Icons } from "@/components/icons"
import { Button } from "@/ui/button"
import { getBaseUrl } from "@/lib/utils"

interface EditorProps {
    bounty: Pick<Bounty, "id" | "title" | "content" | "published"> & {
        project: Pick<Project, "id">
    }
}

type FormData = z.infer<typeof bountyPatchSchema>

export function Editor({ bounty }: EditorProps) {
    const { register, handleSubmit } = useForm<FormData>({
        resolver: zodResolver(bountyPatchSchema),
    })
    const ref = React.useRef<EditorJS>()
    const router = useRouter()
    const [isSaving, setIsSaving] = React.useState<boolean>(false)
    const [isMounted, setIsMounted] = React.useState<boolean>(false)

    async function initializeEditor() {
        const EditorJS = (await import("@editorjs/editorjs")).default
        const Header = (await import("@editorjs/header")).default
        const Embed = (await import("@editorjs/embed")).default
        const List = (await import("@editorjs/list")).default
        const Code = (await import("@editorjs/code")).default
        const LinkTool = (await import("@editorjs/link")).default
        const InlineCode = (await import("@editorjs/inline-code")).default

        const body = bountyPatchSchema.parse(bounty)

        if (!ref.current) {
            const editor = new EditorJS({
                holder: "editor",
                onReady() {
                    ref.current = editor
                },
                placeholder: "Type here to write your post...",
                inlineToolbar: true,
                data: body.content,
                tools: {
                    header: Header,
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: `${getBaseUrl()}/api/edge/metatags`, // Your backend endpoint for url data fetching,
                        },
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    embed: Embed,
                },
            })
        }
    }

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMounted(true)
        }
    }, [])

    React.useEffect(() => {
        if (isMounted) {
            initializeEditor()

            return () => {
                ref.current?.destroy()
                ref.current = null
            }
        }
    }, [isMounted])

    async function onSubmit(data: FormData) {
        setIsSaving(true)

        const blocks = await ref.current.save()

        const response = await fetch(`/api/bounties/${bounty.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: data.title,
                content: blocks,
                projectId: bounty,
            }),
        })

        setIsSaving(false)

        if (!response?.ok) {
            return toast({
                title: "Something went wrong.",
                message: "Your bounty was not saved. Please try again.",
                type: "error",
            })
        }

        router.refresh()

        return toast({
            message: "Your bounty has been saved.",
            type: "success",
        })
    }

    if (!isMounted) {
        return null
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full gap-10">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-10">
                        <Link href={`/project/${bounty.project.id}`}>
                            <Button intent="tertiary">
                                <Icons.chevronLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <p className="text-sm text-slate-600">Draft</p>
                    </div>
                    <Button type="submit" intent="secondary">
                        {isSaving && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <span>Save</span>
                    </Button>
                </div>
                <div className="prose prose-white text-white mx-auto w-full">
                    <TextareaAutosize
                        autoFocus
                        name="title"
                        id="title"
                        defaultValue={bounty.title}
                        placeholder="Bounty title"
                        className="w-full resize-none appearance-none overflow-hidden text-2xl font-bold focus:outline-none bg-appbg border-transparent form-textarea p-0 focus:ring-0 focus:outline-none focus:ring-none text-white focus:border-fuchsia-500 rounded-md"
                        {...register("title")}
                    />
                    <div id="editor" className="min-h-[500px]" />
                    <p className="text-sm text-gray-500">
                        Use{" "}
                        <kbd className="rounded-md border bg-slate-50 px-1 text-xs uppercase">
                            Tab
                        </kbd>{" "}
                        to open the command menu.
                    </p>
                </div>
            </div>
        </form>
    )
}
