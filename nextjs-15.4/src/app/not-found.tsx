'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Position {
  x: number
  y: number
}

interface GameState {
  snake: Position[]
  food: Position
  direction: string
  gameOver: boolean
  score: number
}

const GRID_SIZE = 20
const CANVAS_SIZE = 400

export default function NotFound() {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    gameOver: false,
    score: 0
  })

  const [gameStarted, setGameStarted] = useState(false)

  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      direction: 'RIGHT',
      gameOver: false,
      score: 0
    })
    setGameStarted(true)
  }, [])

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !gameStarted) return prevState

      const newSnake = [...prevState.snake]
      const head = { ...newSnake[0] }

      switch (prevState.direction) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // Check wall collision
      if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
          head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        return { ...prevState, gameOver: true }
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return { ...prevState, gameOver: true }
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        const newFood = generateFood(newSnake)
        return {
          ...prevState,
          snake: newSnake,
          food: newFood,
          score: prevState.score + 10
        }
      } else {
        newSnake.pop()
        return {
          ...prevState,
          snake: newSnake
        }
      }
    })
  }, [gameStarted, generateFood])

  useEffect(() => {
    if (!gameStarted || gameState.gameOver) return

    const gameInterval = setInterval(moveSnake, 150)
    return () => clearInterval(gameInterval)
  }, [moveSnake, gameStarted, gameState.gameOver])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameState.gameOver) return

      setGameState(prevState => {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault()
            return prevState.direction !== 'DOWN' ? { ...prevState, direction: 'UP' } : prevState
          case 'ArrowDown':
            e.preventDefault()
            return prevState.direction !== 'UP' ? { ...prevState, direction: 'DOWN' } : prevState
          case 'ArrowLeft':
            e.preventDefault()
            return prevState.direction !== 'RIGHT' ? { ...prevState, direction: 'LEFT' } : prevState
          case 'ArrowRight':
            e.preventDefault()
            return prevState.direction !== 'LEFT' ? { ...prevState, direction: 'RIGHT' } : prevState
          default:
            return prevState
        }
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameState.gameOver])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-destructive mb-4">404</CardTitle>
          <CardDescription className="text-xl mb-2">
            Oops! This page seems to have slithered away...
          </CardDescription>
          <CardDescription>
            While you're here, why not play some Snake?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <svg
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="border-2 border-border rounded-lg bg-muted"
              >
                {/* Grid lines */}
                {Array.from({ length: CANVAS_SIZE / GRID_SIZE }).map((_, i) => (
                  <g key={i}>
                    <line
                      x1={i * GRID_SIZE}
                      y1={0}
                      x2={i * GRID_SIZE}
                      y2={CANVAS_SIZE}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                    />
                    <line
                      x1={0}
                      y1={i * GRID_SIZE}
                      x2={CANVAS_SIZE}
                      y2={i * GRID_SIZE}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                    />
                  </g>
                ))}
                
                {/* Snake */}
                {gameState.snake.map((segment, index) => (
                  <rect
                    key={index}
                    x={segment.x * GRID_SIZE}
                    y={segment.y * GRID_SIZE}
                    width={GRID_SIZE}
                    height={GRID_SIZE}
                    fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.7)"}
                    rx={2}
                  />
                ))}
                
                {/* Food */}
                <circle
                  cx={gameState.food.x * GRID_SIZE + GRID_SIZE / 2}
                  cy={gameState.food.y * GRID_SIZE + GRID_SIZE / 2}
                  r={GRID_SIZE / 2 - 2}
                  fill="hsl(var(--destructive))"
                />
              </svg>
              
              {gameState.gameOver && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <p className="text-xl font-semibold mb-2">Game Over!</p>
                    <p className="text-sm text-muted-foreground mb-4">Final Score: {gameState.score}</p>
                    <Button onClick={resetGame} size="sm">
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Score: {gameState.score}</p>
              {!gameStarted && !gameState.gameOver && (
                <Button onClick={resetGame}>
                  Start Game
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Use arrow keys to control the snake
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}