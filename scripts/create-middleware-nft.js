const fs = require('fs')
const path = require('path')

const dir = path.join(process.cwd(), '.next', 'server')
const file = path.join(dir, 'middleware.js.nft.json')

try {
  fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2))
    console.log('Created', file)
  } else {
    console.log('Already exists', file)
  }
} catch (e) {
  console.error('Failed to ensure middleware nft file:', e)
  process.exit(1)
}
