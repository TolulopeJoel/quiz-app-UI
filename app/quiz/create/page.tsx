"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2 } from 'lucide-react'

interface ExplanationStep {
  Title: string;
  Result: string;
  ImageUrl: string | null;
}

interface QuizApiRequest {
  Question: string;
  Solution: string;
  ImageUrl: string;
  Options: string[];
  CorrectAnswer: string;
  Difficulty: string;
  Tags: string[];
  Steps: {
    Title: string;
    Result: string;
    ImageUrl?: string;
  }[];
}

export default function CreateQuiz() {
  const [question, setQuestion] = useState('')
  const [mainImageUrl, setMainImageUrl] = useState('')
  const [options, setOptions] = useState(['Option 1', ''])
  const [correctAnswer, setCorrectAnswer] = useState('Option 1')
  const [solution, setSolution] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [explanationSteps, setExplanationSteps] = useState<ExplanationStep[]>([
    { Title: '', Result: '', ImageUrl: null }
  ])

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    if (index === 0 && correctAnswer === options[0]) {
      setCorrectAnswer(value)
    }
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (correctAnswer === options[index]) {
        setCorrectAnswer('')
      }
    }
  }

  const handleExplanationStepChange = (index: number, field: keyof ExplanationStep, value: string) => {
    const newSteps = [...explanationSteps]
    newSteps[index][field] = value
    setExplanationSteps(newSteps)
  }

  const addExplanationStep = () => {
    setExplanationSteps([...explanationSteps, { Title: '', Result: '', ImageUrl: null }])
  }

  const removeExplanationStep = (index: number) => {
    if (explanationSteps.length > 1) {
      const newSteps = explanationSteps.filter((_, i) => i !== index)
      setExplanationSteps(newSteps)
    }
  }

  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Transform the form data to match API structure
      const apiRequest: QuizApiRequest = {
        Question: question,
        Solution: solution,
        ImageUrl: mainImageUrl,
        Options: options.filter(option => option !== ''), // Remove empty options
        CorrectAnswer: correctAnswer,
        Difficulty: difficulty,
        Tags: tags.split(',').map(tag => tag.trim()).filter(Boolean), // Convert comma-separated tags to array
        Steps: explanationSteps.map(step => ({
          Title: step.Title,
          Result: step.Result,
          ImageUrl: step.ImageUrl || undefined
        }))
      }

      const response = await fetch('https://satquiz.onrender.com/questions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.log(errorData, "far away!")
        throw new Error(errorData?.message || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Quiz created successfully:', data)
      router.push('/')

    } catch (error) {
      console.error('Error creating quiz:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Create New Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="question" className="text-sm font-medium text-gray-700">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mainImageUrl" className="text-sm font-medium text-gray-700">Main Image URL</Label>
            <Input
              id="mainImageUrl"
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
              placeholder="Enter image URL (optional)"
              className="mt-1"
            />
            {mainImageUrl && (
              <div className="mt-2 p-2 border rounded">
                <img
                  src={mainImageUrl}
                  alt="Preview"
                  className="max-h-40 object-contain"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/api/placeholder/400/320';
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Options</Label>
            <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer} className="mt-2 space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-grow"
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      onClick={() => removeOption(index)}
                      variant="ghost"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            <Button
              type="button"
              onClick={addOption}
              className="mt-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
          <div>
            <Label htmlFor="solution" className="text-sm font-medium text-gray-700">Solution</Label>
            <Textarea
              id="solution"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">Tags (comma-seperated)</Label>
            <div className="mt-1 space-y-2">
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag 1, tag 2, tag 3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newTag = e.currentTarget.value.trim();
                    if (newTag && !tags.includes(newTag)) {
                      setTags(tags ? `${tags}, ${newTag}` : newTag);
                      e.currentTarget.value = '';
                    }
                  }
                }}
                className="mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {tags.split(',').map((tag, index) => {
                  const trimmedTag = tag.trim();
                  if (!trimmedTag) return null;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md"
                    >
                      <span>{trimmedTag}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = tags
                            .split(',')
                            .map(t => t.trim())
                            .filter((_, i) => i !== index)
                            .join(', ');
                          setTags(newTags);
                        }}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Explanation Steps</Label>
            {explanationSteps.map((step, index) => (
              <div key={index} className="mt-2 space-y-2 p-4 bg-gray-50 rounded-md">
                <Input
                  value={step.Title}
                  onChange={(e) => handleExplanationStepChange(index, 'Title', e.target.value)}
                  placeholder="Step Title"
                  required
                />
                <Input
                  value={step.Result}
                  onChange={(e) => handleExplanationStepChange(index, 'Result', e.target.value)}
                  placeholder="Step Result"
                  required
                />
                <Input
                  value={step.ImageUrl || ''}
                  onChange={(e) => handleExplanationStepChange(index, 'ImageUrl', e.target.value)}
                  placeholder="Image URL (optional)"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => removeExplanationStep(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                  >
                    Remove Step
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={addExplanationStep}
              className="mt-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Explanation Step
            </Button>
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}