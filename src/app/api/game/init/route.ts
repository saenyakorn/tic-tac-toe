import { gameService } from '@/services/game/game.service'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  const game = gameService.create()
  return NextResponse.json(game)
}
