import hash from 'object-hash'

import { BoardSchema, GameTableSchema, MoveSchema, Player, PlayerState } from './game.schema'
import { deepClone } from '@/utils/deep-clone'
import { checkWin } from '@/utils/check-win'
import { prisma } from '../prisma'
import { checkBoardFull } from '@/utils/check-board-full'

const MAX_VALUE = 100
type MinimaxReturn = { score: number; move: MoveSchema | null }

class GameService {
  private _findPossibleMoves(
    _board: BoardSchema,
    player: Player,
    state: PlayerState
  ): MoveSchema[] {
    const possibleMoves: MoveSchema[] = []
    const board = deepClone(_board)
    // Find the possible moves
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const cell = board[i][j]

        // If the cell is already occupied by the player, skip
        if (cell?.player === player) continue

        // If the cell is not occupied, save a move
        const startLevel = cell && cell?.player !== player ? cell.level + 1 : 1
        for (let level = startLevel; level <= 3; level++) {
          if (state.remaining[`level${level}` as keyof PlayerState['remaining']] <= 0) continue
          possibleMoves.push({ player, level, col: j, row: i })
        }
      }
    }
    return possibleMoves
  }

  private async _cacheResult(
    id: string,
    game: string,
    score: number,
    move: string | null,
    nextPlayer: Player
  ) {
    return await prisma.preTrained.upsert({
      where: { id },
      update: { game, nextPlayer, score, move },
      create: { id, game, nextPlayer, score, move },
    })
  }

  // Just for debugging
  private _renderBoard(board: BoardSchema) {
    const boardString = board
      .map((row) => {
        return row
          .map((cell) => {
            if (!cell) return '  '
            if (cell.player === Player.AI) return `X${cell.level}`
            if (cell.player === Player.PLAYER) return `O${cell.level}`
            return '  '
          })
          .join(' | ')
      })
      .join('\n--------------\n')
    console.log(boardString)
  }

  private async _minimax(
    _game: GameTableSchema,
    nextPlayer: Player,
    alpha: number = -MAX_VALUE,
    beta: number = MAX_VALUE,
    depth: number = 0
  ): Promise<MinimaxReturn> {
    const game = deepClone(_game)
    const hashString = hash({ game, nextPlayer })
    // Check if the hash is in the cache
    const cacheValue = await prisma.preTrained.findUnique({ where: { id: hashString } })
    if (cacheValue) {
      return {
        score: cacheValue.score,
        move: cacheValue.move === null ? null : JSON.parse(cacheValue.move),
      }
    }

    // Check if the game is over
    {
      let response: MinimaxReturn | null = null
      if (checkWin(game.board, Player.AI)) {
        response = { score: MAX_VALUE - depth, move: null }
      }
      if (checkWin(game.board, Player.PLAYER)) {
        response = { score: -MAX_VALUE + depth, move: null }
      }
      if (checkBoardFull(game.board)) {
        response = { score: 0, move: null }
      }
      if (response) {
        await this._cacheResult(hashString, JSON.stringify(game), response.score, null, nextPlayer)
        return response
      }
    }

    // Find the possible moves
    const { board, aiState, playerState } = game
    const possibleMoves = this._findPossibleMoves(
      board,
      nextPlayer,
      nextPlayer === Player.AI ? aiState : playerState
    )

    // Maximize
    if (nextPlayer === Player.AI) {
      let bestScore = -MAX_VALUE
      let bestMove = possibleMoves[0]
      for (const move of possibleMoves) {
        // Make the move
        const newBoard = deepClone(board)
        newBoard[move.row][move.col] = { player: move.player, level: move.level }
        const newAiState = deepClone(aiState)
        newAiState.remaining[`level${move.level}` as keyof PlayerState['remaining']] -= 1

        // Find the best score
        const { score } = await this._minimax(
          { board: newBoard, aiState: newAiState, playerState },
          Player.PLAYER,
          alpha,
          beta,
          depth + 1
        )
        bestScore = Math.max(bestScore, score)
        bestMove = bestScore === score ? move : bestMove
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break
      }
      await this._cacheResult(
        hashString,
        JSON.stringify(game),
        bestScore,
        JSON.stringify(bestMove),
        nextPlayer
      )
      return { score: bestScore, move: bestMove }
    }

    // Minimize
    let bestScore = MAX_VALUE
    let bestMove = possibleMoves[0]
    for (const move of possibleMoves) {
      // Make the move
      const newBoard = deepClone(board)
      newBoard[move.row][move.col] = { player: move.player, level: move.level }
      const newPlayerState = deepClone(playerState)
      newPlayerState.remaining[`level${move.level}` as keyof PlayerState['remaining']] -= 1

      // Find the best score
      const { score } = await this._minimax(
        { board: newBoard, aiState, playerState: newPlayerState },
        Player.AI,
        alpha,
        beta,
        depth + 1
      )
      bestScore = Math.min(bestScore, score)
      bestMove = bestScore === score ? move : bestMove
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    await this._cacheResult(
      hashString,
      JSON.stringify(game),
      bestScore,
      JSON.stringify(bestMove),
      nextPlayer
    )
    return { score: bestScore, move: bestMove }
  }

  clearCache() {
    prisma.preTrained.deleteMany({})
  }

  async aiTrain() {
    new Promise(async (resolve) => {
      const game = this.create()
      // AI start first
      {
        const { score } = await this._minimax(game, Player.AI)
        console.log("AI's score:", score)
      }
      // Player start first
      {
        const { score } = await this._minimax(game, Player.PLAYER)
        console.log("Player's score:", score)
      }
      resolve(true)
    })
    return true
  }

  async aiRespond(game: GameTableSchema): Promise<GameTableSchema> {
    const { move } = await this._minimax(game, Player.AI)
    const { board, aiState, playerState } = game
    if (!move) {
      throw new Error('No move found')
    }
    board[move.row][move.col] = { player: move.player, level: move.level }
    aiState.remaining[`level${move.level}` as keyof PlayerState['remaining']] -= 1
    return { board, aiState, playerState }
  }

  create(): GameTableSchema {
    const initialState: PlayerState = {
      remaining: {
        level1: 5,
        level2: 2,
        level3: 1,
      },
    }
    return {
      aiState: initialState,
      playerState: initialState,
      board: Array(3).fill(Array(3).fill(null)),
    }
  }
}

export const gameService = new GameService()
