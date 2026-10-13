'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { MouseEventHandler } from 'react'
import './discussion-link.css'

export default function DiscussionLink({href,onClick,label='查看讨论'}:{href:string;onClick?:MouseEventHandler<HTMLAnchorElement>;label?:string}) {
 return <Link href={href} onClick={onClick} className="discussion-open"><span>{label}</span><span className="discussion-open-orbit" aria-hidden="true"><ArrowUpRight size={19}/></span></Link>
}
