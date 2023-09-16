import { BoardSchema, Player } from '@/services/game/game.schema'

export function checkWin(board: BoardSchema, player: Player) {
  // Check if the player has won with a row
  for (let i = 0; i < board.length; i++) {
    const row = board[i]
    if (row.every((cell) => cell && cell.player === player)) return true
  }

  // Check if the player has won with a column
  for (let i = 0; i < board.length; i++) {
    const column = board.map((row) => row[i])
    if (column.every((cell) => cell && cell.player === player)) return true
  }

  // Check if the player has won with a diagonal
  const diagonal1 = board.map((_, i) => board[i][i])
  if (diagonal1.every((cell) => cell && cell.player === player)) return true
  const diagonal2 = board.map((_, i) => board[i][board.length - 1 - i])
  if (diagonal2.every((cell) => cell && cell.player === player)) return true

  // If none of the above, return false
  return false
}
