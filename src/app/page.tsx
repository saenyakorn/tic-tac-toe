'use client'

import { Button } from '@/components/button'
import { Cell } from '@/components/cell'
import { RadioButton } from '@/components/radio-button'
import { GameTableSchema, Player } from '@/services/game/game.schema'
import { checkWin } from '@/utils/check-win'
import { deepClone } from '@/utils/deep-clone'
import { useMemo, useState } from 'react'
import { fetcher } from './client'
import { checkBoardFull } from '@/utils/check-board-full'

export default function GamePage() {
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1)
  const [game, setGame] = useState<GameTableSchema | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)

  const winner = useMemo(() => {
    if (!game) return null
    if (checkWin(game.board, 'PLAYER')) return Player.PLAYER
    if (checkWin(game.board, 'AI')) return Player.AI
    return null
  }, [game])

  const handleAiResponse = async (row: number, col: number) => {
    setAiThinking(true)
    const clonedGame = deepClone(game)

    if (!clonedGame) return

    const key = `level${selectedLevel}` as keyof GameTableSchema['playerState']['remaining']

    // Skip if no remaining
    if (clonedGame.playerState.remaining[key] <= 0) {
      setAiThinking(false)
      return
    }
    // Skip if cell is already occupied by player
    if (clonedGame.board[row][col]?.player === 'PLAYER') {
      setAiThinking(false)
      return
    }
    // Skip if cell is already occupied by AI with higher or same level
    if (
      clonedGame.board[row][col]?.player === 'AI' &&
      clonedGame.board[row][col] !== null &&
      clonedGame.board[row][col]!.level >= selectedLevel
    ) {
      setAiThinking(false)
      return
    }

    clonedGame.board[row][col] = { player: 'PLAYER', level: selectedLevel }
    clonedGame.playerState.remaining[key] -= 1
    setGame(clonedGame)

    // Check if player won
    if (checkWin(clonedGame.board, 'PLAYER')) {
      setAiThinking(false)
      return
    }

    // Check if draw
    if (checkBoardFull(clonedGame.board)) {
      setAiThinking(false)
      return
    }

    try {
      const response = await fetcher.aiRespond(clonedGame)
      setGame(response.data)
      setAiThinking(false)
    } catch (err) {
      console.log(err)
    }
  }

  const startGame = async (player: Player) => {
    setLoading(true)
    const { data: game } = await fetcher.init()
    if (!game) return
    if (player === 'AI') {
      const { data: gameAfterAiMoved } = await fetcher.aiRespond(game)
      setGame(gameAfterAiMoved)
    } else {
      setGame(game)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="w-full min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!game) {
    return (
      <main className="w-full min-h-screen h-screen p-6 flex flex-col items-center gap-6">
        <h1 className="text-center font-semibold text-5xl">Welcome to Tic Tac Toe</h1>
        <div className="flex items-center justify-center gap-2 flex-col">
          <h2 className="font-semibold text-xl text-center">Please select</h2>
          <Button onClick={() => startGame('AI')} color="red">
            AI Start First
          </Button>
          <Button onClick={() => startGame('PLAYER')} color="blue">
            Player Start First
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen h-screen p-6 flex flex-col items-center gap-6">
      {!winner && (
        <h1 className="text-center font-semibold text-5xl">
          {aiThinking ? "AI's thinking..." : 'Your turn'}
        </h1>
      )}
      {winner && (
        <>
          <h1 className="text-center font-semibold text-5xl">
            {winner === 'PLAYER' ? 'You won!' : 'AI won!'}
          </h1>
          <div className="w-fit flex items-center gap-2 flex-col">
            <Button onClick={() => startGame('AI')} color="red">
              Restart - AI Start First
            </Button>
            <Button onClick={() => startGame('PLAYER')} color="blue">
              Restart - Player Start First
            </Button>
          </div>
        </>
      )}
      <div className="flex items-center flex-col gap-2">
        <h2 className="font-semibold">Choose Level</h2>
        <div className="flex flex-col items-center justify-center">
          <RadioButton
            name="level"
            value={1}
            defaultValue={selectedLevel}
            onSelect={() => setSelectedLevel(1)}
            label={`Marker Level 1: remaining (${game.playerState.remaining.level1})`}
            disabled={aiThinking || !!winner || game.playerState.remaining.level1 <= 0}
          />
          <RadioButton
            name="level"
            value={2}
            defaultValue={selectedLevel}
            onSelect={() => setSelectedLevel(2)}
            label={`Marker Level 2: remaining (${game.playerState.remaining.level2})`}
            disabled={aiThinking || !!winner || game.playerState.remaining.level2 <= 0}
          />
          <RadioButton
            name="level"
            value={3}
            defaultValue={selectedLevel}
            onSelect={() => setSelectedLevel(3)}
            label={`Marker Level 3: remaining (${game.playerState.remaining.level3})`}
            disabled={aiThinking || !!winner || game.playerState.remaining.level3 <= 0}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        {game.board.map((row, rowIndex) => {
          return (
            <div className="flex flex-row h-fit gap-2" key={rowIndex}>
              {row.map((cell, colIndex) => {
                if (!cell) {
                  return (
                    <Cell
                      key={`cell-${rowIndex}-${colIndex}`}
                      onClick={() => handleAiResponse(rowIndex, colIndex)}
                      disabled={aiThinking || !!winner}
                    />
                  )
                }

                return (
                  <Cell
                    key={`cell-${rowIndex}-${colIndex}`}
                    color={cell.player === 'PLAYER' ? 'blue' : 'red'}
                    marker={cell.player === 'PLAYER' ? 'O' : 'X'}
                    level={cell.level as 1 | 2 | 3}
                    onClick={() => handleAiResponse(rowIndex, colIndex)}
                    disabled={aiThinking || !!winner}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </main>
  )
}
