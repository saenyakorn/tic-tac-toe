import { gameService } from '@/services/game/game.service'
import { NextResponse } from 'next/server'

export async function POST(): Promise<NextResponse> {
  new Promise((resolve) => {
    // console.log("AI train started")
    // gameService.aiTrain()
    resolve(true)
  })
  return NextResponse.json({ message: 'ok' })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: 'ok' })
}
