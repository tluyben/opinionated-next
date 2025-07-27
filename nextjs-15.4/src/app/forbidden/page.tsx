'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Position {
  x: number
  y: number
}

interface Tetromino {
  shape: number[][]
  x: number
  y: number
  color: string
}

interface GameState {
  board: string[][]
  currentPiece: Tetromino | null
  nextPiece: Tetromino | null
  score: number
  level: number
  lines: number
  gameOver: boolean
  dropTime: number
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 20

const TETROMINOS = {
  I: { shape: [[1,1,1,1]], color: '#00FFFF' },
  O: { shape: [[1,1],[1,1]], color: '#FFFF00' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#800080' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00FF00' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#FF0000' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#0000FF' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#FFA500' }
}

const TETROMINO_KEYS = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>

export default function Forbidden() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    dropTime: 1000
  })

  const [gameStarted, setGameStarted] = useState(false)
  const [lastDrop, setLastDrop] = useState(Date.now())

  const createRandomPiece = useCallback((): Tetromino => {
    const type = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)]
    const tetromino = TETROMINOS[type]
    return {
      shape: tetromino.shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0,
      color: tetromino.color
    }
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')),
      currentPiece: createRandomPiece(),
      nextPiece: createRandomPiece(),
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      dropTime: 1000
    })
    setGameStarted(true)
    setLastDrop(Date.now())
  }, [createRandomPiece])

  const rotatePiece = useCallback((piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    )
    return { ...piece, shape: rotated }
  }, [])

  const isValidPosition = useCallback((piece: Tetromino, board: string[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x
          const newY = piece.y + y

          if (
            newX < 0 || 
            newX >= BOARD_WIDTH || 
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false
          }
        }
      }
    }
    return true
  }, [])

  const placePiece = useCallback((piece: Tetromino, board: string[][]): string[][] => {
    const newBoard = board.map(row => [...row])
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] && piece.y + y >= 0) {
          newBoard[piece.y + y][piece.x + x] = piece.color
        }
      }
    }
    
    return newBoard
  }, [])

  const clearLines = useCallback((board: string[][]): { newBoard: string[][], linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => !cell))
    const linesCleared = BOARD_HEIGHT - newBoard.length
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(''))
    }
    
    return { newBoard, linesCleared }
  }, [])

  const updateGame = useCallback(() => {
    const now = Date.now()
    if (now - lastDrop < gameState.dropTime) return

    setGameState(prevState => {
      if (prevState.gameOver || !gameStarted || !prevState.currentPiece) return prevState

      const newPiece = { ...prevState.currentPiece, y: prevState.currentPiece.y + 1 }

      if (isValidPosition(newPiece, prevState.board)) {
        setLastDrop(now)
        return { ...prevState, currentPiece: newPiece }
      } else {
        // Place piece
        const newBoard = placePiece(prevState.currentPiece, prevState.board)
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
        
        const newLines = prevState.lines + linesCleared
        const newLevel = Math.floor(newLines / 10) + 1
        const newScore = prevState.score + linesCleared * 100 * newLevel
        
        const nextPiece = createRandomPiece()
        
        // Check game over
        if (!isValidPosition(nextPiece, clearedBoard)) {
          return { ...prevState, gameOver: true }
        }
        
        setLastDrop(now)
        return {
          ...prevState,
          board: clearedBoard,
          currentPiece: prevState.nextPiece,
          nextPiece,
          score: newScore,
          level: newLevel,
          lines: newLines,
          dropTime: Math.max(50, 1000 - (newLevel - 1) * 100)
        }
      }
    })
  }, [gameStarted, gameState.dropTime, gameState.gameOver, lastDrop, isValidPosition, placePiece, clearLines, createRandomPiece])

  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prevState => {
      if (prevState.gameOver || !prevState.currentPiece) return prevState

      const newPiece = {
        ...prevState.currentPiece,
        x: prevState.currentPiece.x + dx,
        y: prevState.currentPiece.y + dy
      }

      if (isValidPosition(newPiece, prevState.board)) {
        if (dy > 0) setLastDrop(Date.now())
        return { ...prevState, currentPiece: newPiece }
      }

      return prevState
    })
  }, [isValidPosition])

  const rotatePieceInGame = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !prevState.currentPiece) return prevState

      const rotatedPiece = rotatePiece(prevState.currentPiece)

      if (isValidPosition(rotatedPiece, prevState.board)) {
        return { ...prevState, currentPiece: rotatedPiece }
      }

      return prevState
    })
  }, [rotatePiece, isValidPosition])

  useEffect(() => {
    if (!gameStarted || gameState.gameOver) return

    const gameInterval = setInterval(updateGame, 50)
    return () => clearInterval(gameInterval)
  }, [updateGame, gameStarted, gameState.gameOver])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameState.gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          movePiece(-1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          movePiece(1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          movePiece(0, 1)
          break
        case 'ArrowUp':
        case ' ':
          e.preventDefault()
          rotatePieceInGame()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameState.gameOver, movePiece, rotatePieceInGame])

  const renderBoard = () => {
    const displayBoard = gameState.board.map(row => [...row])
    
    // Add current piece to display board
    if (gameState.currentPiece) {
      for (let y = 0; y < gameState.currentPiece.shape.length; y++) {
        for (let x = 0; x < gameState.currentPiece.shape[y].length; x++) {
          if (gameState.currentPiece.shape[y][x] && gameState.currentPiece.y + y >= 0) {
            const boardY = gameState.currentPiece.y + y
            const boardX = gameState.currentPiece.x + x
            if (boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = gameState.currentPiece.color
            }
          }
        }
      }
    }
    
    return displayBoard
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-destructive mb-4">403</CardTitle>
          <CardDescription className="text-xl mb-2">
            Access Forbidden!
          </CardDescription>
          <CardDescription>
            Stack up some blocks while you wait for permission!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <svg
                  width={BOARD_WIDTH * CELL_SIZE}
                  height={BOARD_HEIGHT * CELL_SIZE}
                  className="border-2 border-border rounded-lg bg-black"
                >
                  {renderBoard().map((row, y) =>
                    row.map((cell, x) => (
                      <rect
                        key={`${x}-${y}`}
                        x={x * CELL_SIZE}
                        y={y * CELL_SIZE}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        fill={cell || 'transparent'}
                        stroke={cell ? '#333' : 'transparent'}
                        strokeWidth={1}
                      />
                    ))
                  )}
                  
                  {/* Grid lines */}
                  {Array.from({ length: BOARD_WIDTH + 1 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * CELL_SIZE}
                      y1={0}
                      x2={i * CELL_SIZE}
                      y2={BOARD_HEIGHT * CELL_SIZE}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                    />
                  ))}
                  {Array.from({ length: BOARD_HEIGHT + 1 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1={0}
                      y1={i * CELL_SIZE}
                      x2={BOARD_WIDTH * CELL_SIZE}
                      y2={i * CELL_SIZE}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                    />
                  ))}
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
            </div>
            
            <div className="flex flex-col space-y-4">
              <Card className="p-4">
                <CardTitle className="text-lg mb-2">Score</CardTitle>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{gameState.score}</p>
                  <p className="text-sm text-muted-foreground">Level: {gameState.level}</p>
                  <p className="text-sm text-muted-foreground">Lines: {gameState.lines}</p>
                </div>
              </Card>
              
              <Card className="p-4">
                <CardTitle className="text-lg mb-2">Next Piece</CardTitle>
                <div className="w-20 h-20 border border-border rounded bg-black">
                  {gameState.nextPiece && (
                    <svg width="80" height="80">
                      {gameState.nextPiece.shape.map((row, y) =>
                        row.map((cell, x) => 
                          cell ? (
                            <rect
                              key={`${x}-${y}`}
                              x={x * 15 + 10}
                              y={y * 15 + 10}
                              width={15}
                              height={15}
                              fill={gameState.nextPiece!.color}
                              stroke="#333"
                              strokeWidth={1}
                            />
                          ) : null
                        )
                      )}
                    </svg>
                  )}
                </div>
              </Card>
              
              <div className="text-center space-y-2">
                {!gameStarted && (
                  <Button onClick={resetGame}>
                    Start Game
                  </Button>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Arrow keys: Move</p>
                  <p>Up/Space: Rotate</p>
                  <p>Down: Drop faster</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Request Access</Link>
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