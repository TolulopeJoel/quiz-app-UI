"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Zap, Flame, BugIcon as QuestionMark } from 'lucide-react'

interface Quiz {
  id: number
  Question: string
  Difficulty: string | null
  Tags: string[]
}

const difficultyIcons = {
  easy: Brain,
  medium: Zap,
  hard: Flame,
  default: QuestionMark
}

const difficultyColors = {
  easy: 'bg-teal-100 text-teal-800 border-teal-300',
  medium: 'bg-purple-100 text-purple-800 border-purple-300',
  hard: 'bg-orange-100 text-orange-800 border-orange-300',
  default: 'bg-gray-100 text-gray-800 border-gray-300'
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/questions/')
      .then(response => response.json())
      .then(data => setQuizzes(data))
      .catch(error => console.error('Error fetching quizzes:', error))
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-yellow-100 to-green-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent from-purple-600 to-pink-600">
        Available SAT Quizzes
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          const DifficultyIcon = quiz.Difficulty ? difficultyIcons[quiz.Difficulty as keyof typeof difficultyIcons] : difficultyIcons.default
          const difficultyColor = quiz.Difficulty ? difficultyColors[quiz.Difficulty as keyof typeof difficultyColors] : difficultyColors.default
          
          return (
            <Card key={quiz.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-4 border-dashed border-indigo-300 bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">{quiz.Question}</h2>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full border-2 flex items-center ${difficultyColor}`}>
                    <DifficultyIcon className="w-4 h-4 mr-1" />
                    {quiz.Difficulty || 'Mystery'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quiz.Tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-300 font-medium">
                        #{tag}
                      </span>
                    ))}
                    {quiz.Tags.length > 2 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-300 font-medium">
                        +{quiz.Tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/quiz/${quiz.id}`}>
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
                    Test me!
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

