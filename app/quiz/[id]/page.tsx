"use client"

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'

interface Step {
  Title: string
  Result: string
  ImageUrl: string | null
}

interface Quiz {
  id: number
  Question: string
  Solution: string
  Steps: Step[]
  Options: string[]
  ImageUrl: string | null
  Difficulty: string | null
  Tags: string[]
  CorrectAnswer: string
}

function convertTMProToHtml(tmpText: string) {
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  tmpText = escapeHtml(tmpText);

  tmpText = tmpText.replace(/&lt;color=(#?\w+)&gt;(.*?)&lt;\/color&gt;/gi, (match, color, content) => {
    return `<span style="color: ${color}">${content}</span>`;
  });

  tmpText = tmpText.replace(/&lt;size=(\d+)&gt;(.*?)&lt;\/size&gt;/gi, (match, size, content) => {
    return `<span style="font-size: ${size}%">${content}</span>`;
  });

  tmpText = tmpText.replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, '<strong>$1</strong>');
  tmpText = tmpText.replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, '<em>$1</em>');
  tmpText = tmpText.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>');
  tmpText = tmpText.replace(/&lt;s&gt;(.*?)&lt;\/s&gt;/gi, '<del>$1</del>');
  tmpText = tmpText.replace(/\n/g, '<br>');

  return tmpText;
}

export default function Home() {
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params.id) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://satquiz.onrender.com'
        const response = await fetch(`${apiUrl}/questions/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch quiz data')
        }
        const data = await response.json()
        setQuiz(data)
        setSelectedAnswer(null)
        setShowExplanation(false)
        setError(null)
      } catch (err) {
        setError('Failed to load quiz. Please try again later.')
        console.error('Error fetching quiz:', err)
      }
    }

    fetchQuiz()
  }, [params.id])

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    setShowExplanation(true)
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!quiz) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* <ArrowLeft className="w-5 h-5 text-gray-500" /> */}
        <div className="mb-6 flex items-center justify-center">
          <div className="flex items-center">
            <Image
              src="https://cdn.prod.website-files.com/649483ab799f610b8944934e/64a3edbc697ab4e14b90220c_FinalFinalTitleLogo-p-500.png"
              alt="Quiz icon"
              width={240}
              height={240}
              className="ml-4"
            />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-base text-gray-900">
            {quiz.Question}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {quiz.Options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showExplanation}
              className={`w-full text-left p-3 rounded-full border transition-colors flex items-center justify-between ${selectedAnswer === option
                ? option === quiz.CorrectAnswer
                  ? 'bg-green-100 border-green-300'
                  : 'bg-red-100 border-red-300'
                : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
            >
              <span className="text-base font-medium">{option}</span>
              {showExplanation && selectedAnswer === option && (
                option === quiz.CorrectAnswer ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-red-500" />
                )
              )}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="space-y-6">
            <div dangerouslySetInnerHTML={{ __html: convertTMProToHtml(quiz.Solution) }} />

            {quiz.Steps.map((step, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-medium text-gray-900">
                  {step.Title}
                </h3>
                <p className="text-gray-700">{step.Result}</p>

                {step.ImageUrl && (
                  <div className="mt-4">
                    <Image
                      src={step.ImageUrl}
                      alt={`Step ${index + 1} illustration`}
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}