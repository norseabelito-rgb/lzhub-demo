import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  if (session.user.role === 'manager') {
    // Manager stats
    const [
      activeEmployees,
      todayChecklistInstances,
      completedChecklistInstances,
      todayReservations,
      pendingOnboarding,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'angajat' } }),
      prisma.checklistInstance.count({ where: { date: todayStr } }),
      prisma.checklistInstance.count({
        where: { date: todayStr, status: 'completed' },
      }),
      prisma.reservation.count({
        where: { date: todayStr, status: 'confirmed' },
      }),
      prisma.onboardingProgress.count({ where: { isComplete: false } }),
    ])

    const checklistRatio =
      todayChecklistInstances > 0
        ? `${completedChecklistInstances}/${todayChecklistInstances}`
        : '0/0'

    return NextResponse.json({
      stats: [
        {
          label: 'Angajati activi azi',
          value: activeEmployees,
          changeType: 'neutral',
        },
        {
          label: 'Checklisturi completate',
          value: checklistRatio,
          change: todayChecklistInstances > 0
            ? `${Math.round((completedChecklistInstances / todayChecklistInstances) * 100)}%`
            : '0%',
          changeType: 'neutral',
        },
        {
          label: 'Rezervari azi',
          value: todayReservations,
          changeType: 'neutral',
        },
        {
          label: 'Onboarding in asteptare',
          value: pendingOnboarding,
          changeType: 'neutral',
        },
      ],
    })
  }

  // Employee stats
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const weekDates: string[] = []
  for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
    weekDates.push(d.toISOString().split('T')[0])
  }

  const [
    todayTasks,
    todayCompleted,
    todayChecklists,
    todayCompletedChecklists,
    weekShifts,
  ] = await Promise.all([
    prisma.checklistInstance.count({
      where: { date: todayStr, assignedToId: session.user.id },
    }),
    prisma.checklistInstance.count({
      where: {
        date: todayStr,
        assignedToId: session.user.id,
        status: 'completed',
      },
    }),
    prisma.checklistInstance.count({
      where: { date: todayStr, assignedToId: session.user.id },
    }),
    prisma.checklistInstance.count({
      where: {
        date: todayStr,
        assignedToId: session.user.id,
        status: 'completed',
      },
    }),
    prisma.checklistInstance.count({
      where: {
        date: { in: weekDates },
        assignedToId: session.user.id,
      },
    }),
  ])

  const checklistRatio =
    todayChecklists > 0
      ? `${todayCompletedChecklists}/${todayChecklists}`
      : '0/0'

  return NextResponse.json({
    stats: [
      {
        label: 'Task-uri de azi',
        value: todayTasks,
        change: `${todayCompleted} completate`,
        changeType: 'neutral',
      },
      {
        label: 'Checklisturi',
        value: checklistRatio,
        change: todayChecklists > 0
          ? `${Math.round((todayCompletedChecklists / todayChecklists) * 100)}%`
          : '0%',
        changeType: 'neutral',
      },
      {
        label: 'Ture saptamana asta',
        value: weekShifts,
        changeType: 'neutral',
      },
    ],
  })
}
