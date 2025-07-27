'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Position {
  x: number
  y: number
}

interface Invader {
  x: number
  y: number
  alive: boolean
}

interface Bullet {
  x: number
  y: number
  direction: 'up' | 'down'
}

interface GameState {
  player: Position
  invaders: Invader[]
  bullets: Bullet[]
  score: number
  gameOver: boolean
  won: boolean
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 300
const PLAYER_SIZE = 20
const INVADER_SIZE = 15
const BULLET_SIZE = 4

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [gameState, setGameState] = useState<GameState>({
    player: { x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, y: CANVAS_HEIGHT - 40 },
    invaders: [],
    bullets: [],
    score: 0,
    gameOver: false,
    won: false
  })

  const [gameStarted, setGameStarted] = useState(false)
  const [keys, setKeys] = useState<Set<string>>(new Set())

  const initializeInvaders = useCallback((): Invader[] => {
    const invaders: Invader[] = []
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        invaders.push({
          x: 50 + col * 40,
          y: 50 + row * 30,
          alive: true
        })
      }
    }
    return invaders
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      player: { x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, y: CANVAS_HEIGHT - 40 },
      invaders: initializeInvaders(),
      bullets: [],
      score: 0,
      gameOver: false,
      won: false
    })
    setGameStarted(true)
  }, [initializeInvaders])

  const checkCollisions = useCallback((state: GameState): GameState => {
    const newBullets = state.bullets.filter(bullet => {
      // Remove bullets that go off screen
      if (bullet.y < 0 || bullet.y > CANVAS_HEIGHT) return false

      // Check invader collisions
      if (bullet.direction === 'up') {
        const hitInvader = state.invaders.find(invader => 
          invader.alive &&
          bullet.x >= invader.x && bullet.x <= invader.x + INVADER_SIZE &&
          bullet.y >= invader.y && bullet.y <= invader.y + INVADER_SIZE
        )
        if (hitInvader) {
          hitInvader.alive = false
          return false // Remove bullet
        }
      }

      // Check player collision
      if (bullet.direction === 'down') {
        if (bullet.x >= state.player.x && bullet.x <= state.player.x + PLAYER_SIZE &&
            bullet.y >= state.player.y && bullet.y <= state.player.y + PLAYER_SIZE) {
          state.gameOver = true
          return false
        }
      }

      return true
    })

    // Check if all invaders destroyed
    const aliveInvaders = state.invaders.filter(invader => invader.alive)
    if (aliveInvaders.length === 0) {
      state.won = true
      state.gameOver = true
    }

    // Calculate score
    const destroyedCount = state.invaders.filter(invader => !invader.alive).length
    state.score = destroyedCount * 10

    return { ...state, bullets: newBullets }
  }, [])

  const updateGame = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !gameStarted) return prevState

      const newState = { ...prevState }

      // Move player
      if (keys.has('ArrowLeft') && newState.player.x > 0) {
        newState.player.x -= 5
      }
      if (keys.has('ArrowRight') && newState.player.x < CANVAS_WIDTH - PLAYER_SIZE) {
        newState.player.x += 5
      }

      // Move bullets
      newState.bullets = newState.bullets.map(bullet => ({
        ...bullet,
        y: bullet.direction === 'up' ? bullet.y - 8 : bullet.y + 4
      }))

      // Occasionally add invader bullets
      if (Math.random() < 0.02) {
        const aliveInvaders = newState.invaders.filter(inv => inv.alive)
        if (aliveInvaders.length > 0) {
          const randomInvader = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)]
          newState.bullets.push({
            x: randomInvader.x + INVADER_SIZE / 2,
            y: randomInvader.y + INVADER_SIZE,
            direction: 'down'
          })
        }
      }

      return checkCollisions(newState)
    })
  }, [keys, gameStarted, checkCollisions])

  useEffect(() => {
    if (!gameStarted || gameState.gameOver) return

    const gameInterval = setInterval(updateGame, 50)
    return () => clearInterval(gameInterval)
  }, [updateGame, gameStarted, gameState.gameOver])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && gameStarted && !gameState.gameOver) {
        e.preventDefault()
        setGameState(prevState => ({
          ...prevState,
          bullets: [...prevState.bullets, {
            x: prevState.player.x + PLAYER_SIZE / 2,
            y: prevState.player.y,
            direction: 'up'
          }]
        }))
      }
      setKeys(prev => new Set(prev).add(e.key))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev)
        newKeys.delete(e.key)
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameStarted, gameState.gameOver])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-6xl font-bold text-destructive mb-4">500</CardTitle>
              <CardDescription className="text-xl mb-2">
                Houston, we have a problem...
              </CardDescription>
              <CardDescription>
                While our engineers fix this, defend Earth in Space Invaders!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <svg
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border-2 border-border rounded-lg bg-black"
                  >
                    {/* Stars background */}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <circle
                        key={i}
                        cx={Math.random() * CANVAS_WIDTH}
                        cy={Math.random() * CANVAS_HEIGHT}
                        r={0.5}
                        fill="white"
                        opacity={0.6}
                      />
                    ))}
                    
                    {/* Player */}
                    <polygon
                      points={`${gameState.player.x},${gameState.player.y + PLAYER_SIZE} ${gameState.player.x + PLAYER_SIZE/2},${gameState.player.y} ${gameState.player.x + PLAYER_SIZE},${gameState.player.y + PLAYER_SIZE}`}
                      fill="hsl(var(--primary))"
                    />
                    
                    {/* Invaders */}
                    {gameState.invaders.filter(inv => inv.alive).map((invader, index) => (
                      <rect
                        key={index}
                        x={invader.x}
                        y={invader.y}
                        width={INVADER_SIZE}
                        height={INVADER_SIZE}
                        fill="hsl(var(--destructive))"
                        rx={2}
                      />
                    ))}
                    
                    {/* Bullets */}
                    {gameState.bullets.map((bullet, index) => (
                      <circle
                        key={index}
                        cx={bullet.x}
                        cy={bullet.y}
                        r={BULLET_SIZE / 2}
                        fill={bullet.direction === 'up' ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                      />
                    ))}
                  </svg>
                  
                  {gameState.gameOver && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <p className="text-xl font-semibold mb-2">
                          {gameState.won ? 'Victory!' : 'Game Over!'}
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
                  {!gameStarted && (
                    <Button onClick={resetGame}>
                      Start Game
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Arrow keys to move, Space to shoot
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">Error Details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {error.message}
                  </pre>
                </details>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={reset}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}