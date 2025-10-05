'use client'

import { useState } from 'react'
import { mathProblemApi } from '../lib/api'

interface MathProblem {
  problem_text: string
  final_answer: number
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const resetAllState = () => {
    setProblem(null)
    setUserAnswer('')
    setFeedback('')
    setSessionId(null)
    setIsCorrect(null)
  }

  const generateProblem = async () => {
    setIsLoading(true)
    resetAllState();
    
    try {
      const data = await mathProblemApi.generateProblem();
      setProblem({ 
        problem_text: data.problem_text, 
        final_answer: 0 // Don't expose answer to frontend
      });
      setSessionId(data.id);
    } catch (error) {
      console.error('Error generating problem:', error);
      setFeedback('Sorry, there was an error generating a new problem. Please try again.');
      setIsCorrect(false);
    } finally {
      setIsLoading(false);
    }
  }

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId || !userAnswer) return
    
    setIsLoading(true)
    
    try {
      const data = await mathProblemApi.submitAnswer(sessionId, parseInt(userAnswer, 10));
      setIsCorrect(data.is_correct);
      
      if (data.is_correct) {
        setFeedback(data.feedback);
      } else {
        setFeedback(`${data.feedback}\n\nThe correct answer was: ${data.correct_answer}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback('Sorry, there was an error submitting your answer. Please try again.');
      setIsCorrect(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-purple-50">
      <main className="main-container py-8 px-4">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 text-center fun-title">
          Math Adventure!
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={generateProblem}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            {isLoading ? 'Generating...' : 'Generate New Problem'}
          </button>
        </div>

        {problem && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Problem:</h2>
            <p className="text-lg text-gray-800 leading-relaxed mb-6">
              {problem.problem_text}
            </p>
            
            <form onSubmit={submitAnswer} className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={!userAnswer || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                Submit Answer
              </button>
            </form>
          </div>
        )}

        {feedback && (
          <div className={`rounded-lg shadow-lg p-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
            </h2>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">{feedback}</p>
          </div>
        )}
      </main>
    </div>
  )
}