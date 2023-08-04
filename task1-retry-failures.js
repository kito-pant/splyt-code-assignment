(function(){
  retryFailures(createTargetFunction(3), 5)
    .then(attempt => {
      console.log('attempt', attempt)
    })

  retryFailures(createTargetFunction(3), 2)
    .then(attempt => {
      console.log('should not happen')
    })
    .catch(error => {
      console.log('fail-attempt', error.attempt)
    })

  retryFailures(createTargetFunction(10), 10).then((attempt) => {
    console.assert(attempt === 10)
  }) 
})()


async function retryFailures(fn, retries) {
  retries--
  try {
    const value = await fn()
    return value
  } catch (error) {
    if (retries) {
      const value = await retryFailures(fn, retries)
      return value
    } else {
      throw error
    }
  }
}


function createTargetFunction(succeedsOnAttempt) {
  let attempt = 0

  return async () => {
    if (++attempt === succeedsOnAttempt) {
      return attempt
    }

    throw Object.assign(new Error(`failure`), { attempt })
  }
}