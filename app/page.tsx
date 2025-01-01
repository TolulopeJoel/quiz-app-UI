import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Quizzes</h2>
        <Link href="/quiz/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">
            Create New Quiz
          </Button>
        </Link>
      </div>
    </div>
  )
}

