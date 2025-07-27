'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Position {
  x: number
  y: number
}

interface Ghost {
  x: number
  y: number
  direction: string
  color: string
}

interface GameState {
  pacman: Position
  ghosts: Ghost[]
  dots: Position[]
  score: number
  gameOver: boolean
  won: boolean
  direction: string
  nextDirection: string
}

const GRID_SIZE = 20
const CANVAS_SIZE = 400
const MAZE_SIZE = CANVAS_SIZE / GRID_SIZE

// Simple maze layout (1 = wall, 0 = path, 2 = dot)
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,0,0,0,1,0,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

export default function Unauthorized() {
  const [gameState, setGameState] = useState<GameState>({
    pacman: { x: 1, y: 1 },
    ghosts: [
      { x: 9, y: 9, direction: 'UP', color: '#FF0000' },
      { x: 10, y: 9, direction: 'DOWN', color: '#FFB8FF' },
      { x: 9, y: 10, direction: 'LEFT', color: '#00FFFF' },
      { x: 10, y: 10, direction: 'RIGHT', color: '#FFB852' }
    ],
    dots: [],
    score: 0,
    gameOver: false,
    won: false,
    direction: 'RIGHT',
    nextDirection: 'RIGHT'
  })

  const [gameStarted, setGameStarted] = useState(false)

  const initializeDots = useCallback((): Position[] => {
    const dots: Position[] = []
    for (let y = 0; y < MAZE_SIZE; y++) {
      for (let x = 0; x < MAZE_SIZE; x++) {
        if (MAZE[y][x] === 2) {
          dots.push({ x, y })
        }
      }
    }
    return dots
  }, [])

  const isValidMove = useCallback((x: number, y: number): boolean => {
    if (x < 0 || x >= MAZE_SIZE || y < 0 || y >= MAZE_SIZE) return false
    return MAZE[y][x] !== 1
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      pacman: { x: 1, y: 1 },
      ghosts: [
        { x: 9, y: 9, direction: 'UP', color: '#FF0000' },
        { x: 10, y: 9, direction: 'DOWN', color: '#FFB8FF' },
        { x: 9, y: 10, direction: 'LEFT', color: '#00FFFF' },
        { x: 10, y: 10, direction: 'RIGHT', color: '#FFB852' }
      ],
      dots: initializeDots(),
      score: 0,
      gameOver: false,
      won: false,
      direction: 'RIGHT',
      nextDirection: 'RIGHT'
    })
    setGameStarted(true)
  }, [initializeDots])

  const moveEntity = useCallback((entity: Position, direction: string): Position => {
    let newX = entity.x
    let newY = entity.y

    switch (direction) {
      case 'UP':
        newY -= 1
        break
      case 'DOWN':
        newY += 1
        break
      case 'LEFT':
        newX -= 1
        break
      case 'RIGHT':
        newX += 1
        break
    }

    // Handle tunnel effect
    if (newX < 0) newX = MAZE_SIZE - 1
    if (newX >= MAZE_SIZE) newX = 0

    return { x: newX, y: newY }
  }, [])

  const updateGame = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !gameStarted) return prevState

      const newState = { ...prevState }

      // Try to change direction
      const nextPos = moveEntity(newState.pacman, newState.nextDirection)
      if (isValidMove(nextPos.x, nextPos.y)) {
        newState.direction = newState.nextDirection
      }

      // Move Pac-Man
      const newPacmanPos = moveEntity(newState.pacman, newState.direction)
      if (isValidMove(newPacmanPos.x, newPacmanPos.y)) {
        newState.pacman = newPacmanPos
      }

      // Check dot collection
      const dotIndex = newState.dots.findIndex(dot => 
        dot.x === newState.pacman.x && dot.y === newState.pacman.y
      )
      if (dotIndex !== -1) {
        newState.dots.splice(dotIndex, 1)
        newState.score += 10
      }

      // Move ghosts randomly
      newState.ghosts = newState.ghosts.map(ghost => {
        const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
        let newGhost = { ...ghost }
        
        // Try current direction first
        let newPos = moveEntity(ghost, ghost.direction)
        if (!isValidMove(newPos.x, newPos.y) || Math.random() < 0.1) {
          // Change direction randomly
          const validDirections = directions.filter(dir => {
            const testPos = moveEntity(ghost, dir)
            return isValidMove(testPos.x, testPos.y)
          })
          if (validDirections.length > 0) {
            newGhost.direction = validDirections[Math.floor(Math.random() * validDirections.length)]
            newPos = moveEntity(ghost, newGhost.direction)
          }
        }
        
        newGhost.x = newPos.x
        newGhost.y = newPos.y
        return newGhost
      })

      // Check ghost collision
      const ghostCollision = newState.ghosts.some(ghost => 
        ghost.x === newState.pacman.x && ghost.y === newState.pacman.y
      )
      if (ghostCollision) {
        newState.gameOver = true
      }

      // Check win condition
      if (newState.dots.length === 0) {
        newState.won = true
        newState.gameOver = true
      }

      return newState
    })
  }, [gameStarted, isValidMove, moveEntity])

  useEffect(() => {
    if (!gameStarted || gameState.gameOver) return

    const gameInterval = setInterval(updateGame, 200)
    return () => clearInterval(gameInterval)
  }, [updateGame, gameStarted, gameState.gameOver])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameState.gameOver) return

      setGameState(prevState => {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault()
            return { ...prevState, nextDirection: 'UP' }
          case 'ArrowDown':
            e.preventDefault()
            return { ...prevState, nextDirection: 'DOWN' }
          case 'ArrowLeft':
            e.preventDefault()
            return { ...prevState, nextDirection: 'LEFT' }
          case 'ArrowRight':
            e.preventDefault()
            return { ...prevState, nextDirection: 'RIGHT' }
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
          <CardTitle className="text-6xl font-bold text-destructive mb-4">401</CardTitle>
          <CardDescription className="text-xl mb-2">
            Unauthorized Access Detected!
          </CardDescription>
          <CardDescription>
            While you wait for proper credentials, play some Pac-Man!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <svg
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="border-2 border-border rounded-lg bg-black"
              >
                {/* Maze */}
                {MAZE.map((row, y) =>
                  row.map((cell, x) => {
                    if (cell === 1) {
                      return (
                        <rect
                          key={`${x}-${y}`}
                          x={x * GRID_SIZE}
                          y={y * GRID_SIZE}
                          width={GRID_SIZE}
                          height={GRID_SIZE}
                          fill="#0000FF"
                        />
                      )
                    }
                    return null
                  })
                )}
                
                {/* Dots */}
                {gameState.dots.map((dot, index) => (
                  <circle
                    key={index}
                    cx={dot.x * GRID_SIZE + GRID_SIZE / 2}
                    cy={dot.y * GRID_SIZE + GRID_SIZE / 2}
                    r={2}
                    fill="#FFFF00"
                  />
                ))}
                
                {/* Pac-Man */}
                <circle
                  cx={gameState.pacman.x * GRID_SIZE + GRID_SIZE / 2}
                  cy={gameState.pacman.y * GRID_SIZE + GRID_SIZE / 2}
                  r={GRID_SIZE / 2 - 2}
                  fill="#FFFF00"
                />
                
                {/* Pac-Man mouth */}
                <polygon
                  points={`${gameState.pacman.x * GRID_SIZE + GRID_SIZE / 2},${gameState.pacman.y * GRID_SIZE + GRID_SIZE / 2} ${gameState.pacman.x * GRID_SIZE + GRID_SIZE - 2},${gameState.pacman.y * GRID_SIZE + GRID_SIZE / 2 - 4} ${gameState.pacman.x * GRID_SIZE + GRID_SIZE - 2},${gameState.pacman.y * GRID_SIZE + GRID_SIZE / 2 + 4}`}
                  fill="black"
                />
                
                {/* Ghosts */}
                {gameState.ghosts.map((ghost, index) => (
                  <g key={index}>
                    <rect
                      x={ghost.x * GRID_SIZE + 2}
                      y={ghost.y * GRID_SIZE + 2}
                      width={GRID_SIZE - 4}
                      height={GRID_SIZE - 4}
                      fill={ghost.color}
                      rx={GRID_SIZE / 2}
                    />
                    {/* Ghost bottom wavy edge */}
                    <polygon
                      points={`${ghost.x * GRID_SIZE + 2},${ghost.y * GRID_SIZE + GRID_SIZE - 6} ${ghost.x * GRID_SIZE + 6},${ghost.y * GRID_SIZE + GRID_SIZE - 2} ${ghost.x * GRID_SIZE + 10},${ghost.y * GRID_SIZE + GRID_SIZE - 6} ${ghost.x * GRID_SIZE + 14},${ghost.y * GRID_SIZE + GRID_SIZE - 2} ${ghost.x * GRID_SIZE + GRID_SIZE - 2},${ghost.y * GRID_SIZE + GRID_SIZE - 6} ${ghost.x * GRID_SIZE + GRID_SIZE - 2},${ghost.y * GRID_SIZE + GRID_SIZE - 4} ${ghost.x * GRID_SIZE + 2},${ghost.y * GRID_SIZE + GRID_SIZE - 4}`}
                      fill={ghost.color}
                    />
                    {/* Ghost eyes */}
                    <circle cx={ghost.x * GRID_SIZE + 8} cy={ghost.y * GRID_SIZE + 8} r={2} fill="white" />
                    <circle cx={ghost.x * GRID_SIZE + 12} cy={ghost.y * GRID_SIZE + 8} r={2} fill="white" />
                    <circle cx={ghost.x * GRID_SIZE + 8} cy={ghost.y * GRID_SIZE + 8} r={1} fill="black" />
                    <circle cx={ghost.x * GRID_SIZE + 12} cy={ghost.y * GRID_SIZE + 8} r={1} fill="black" />
                  </g>
                ))}
              </svg>
              
              {gameState.gameOver && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <p className="text-xl font-semibold mb-2">
                      {gameState.won ? 'You Win!' : 'Game Over!'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">Score: {gameState.score}</p>
                    <Button onClick={resetGame} size="sm">
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Score: {gameState.score}</p>
              <p className="text-sm text-muted-foreground">Dots remaining: {gameState.dots.length}</p>
              {!gameStarted && (
                <Button onClick={resetGame}>
                  Start Game
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Use arrow keys to move Pac-Man
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}