import dynamic from 'next/dynamic'

const PromptBoard = dynamic(() => import('@/components/PromptBoard'), { ssr: false })

export default function Home() {
  return <PromptBoard />
}