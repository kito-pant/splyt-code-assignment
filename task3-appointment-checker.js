(function(){
  const schedules = [
    [['09:00', '11:30'], ['13:30', '16:00'], ['16:00', '17:30'], ['17:45', '19:00']],
    [['09:15', '12:00'], ['14:00', '16:30'], ['17:00', '17:30']],
    [['11:30', '12:15'], ['15:00', '16:30'], ['17:45', '19:00']]
  ]

  const workingHours = ['09:00', '19:00']

  const slotDuration = 60

  const availableTime = findFreeSlot(schedules, workingHours, slotDuration)

  console.log('Earliest possible time slot', availableTime)
})()

function findFreeSlot (userCalendars, workHourRange, slotDuration) {
  const freeSlots = userCalendars.map(meetings => inverseBusyTime(meetings, workHourRange))

  // check if all have at least one free slot that fit the duration
  const userFreeFit = freeSlots
    .map(userFree => userFree.filter(el => el.duration >= slotDuration))
    .filter(userFree => userFree.length)

  console.log('free', freeSlots)
  console.log('freefit', userFreeFit)

  if (userFreeFit.length !== userCalendars.length) return null

  // if all have free time, pick the less free slot
  userFreeFit.sort((a, b) => a.length - b.length)
  const leastFreeUser = userFreeFit.shift()

  let earliestFree
  for (const itm of leastFreeUser) {
    const [startTime, endTime] = itm.slot

    const groupEarliest = []
    for (const other of userFreeFit) {
      // find time after or eq to startTime
      const foundStart = other.findIndex(el => el.slot.at(0) >= startTime)
      if (foundStart === -1) break

      const foundTime = other
        .slice(foundStart)
        .sort((a, b) => {
          const t1 = a.slot.at(0)
          const t2 = b.slot.at(0)
          return t1.localeCompare(t2)
        })
        .find(otherSlot => {
          const otherStartTime = otherSlot.slot.at(0)

          const d = durationMinute(otherStartTime, endTime)

          return d >= slotDuration
        })

      if (foundTime) {
        groupEarliest.push(foundTime.slot.at(0))
      } else {
        break
      }
    }

    // check if completed
    if (groupEarliest.length === userFreeFit.length) {
      earliestFree = groupEarliest.sort().pop()
      break
    }
  }

  return earliestFree || null
}

function durationMinute (t1, t2) {
  const [hr1, mn1] = t1.split(':')
  const [hr2, mn2] = t2.split(':')

  const hrDiff = +hr2 - +hr1
  const mnDiff = +mn2 - +mn1

  return (hrDiff * 60) + mnDiff
}

function inverseBusyTime (items, minMax) {
  const lastIndex = items.length - 1
  const [t1, t2] = minMax

  const freeSlots = []
  for (let i = 0; i < items.length; i++) {
    const [curStartTime, curEndTime] = items[i]

    if (i === 0) {
      const d = durationMinute(t1, curStartTime)
      if (d > 0) freeSlots.push({ slot: [t1, curStartTime], duration: d })
    } else {
      const prevEndTime = items[i - 1].at(1)
      const d = durationMinute(prevEndTime, curStartTime)
      if (d > 0) freeSlots.push({ slot: [prevEndTime, curStartTime], duration: d })
    }

    if (i === lastIndex) {
      const d = durationMinute(curEndTime, t2)
      if (d > 0) freeSlots.push({ slot: [curEndTime, t2], duration: d })
    }
  }

  return freeSlots
}