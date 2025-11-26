#!/usr/bin/env node
/* eslint-disable n/prefer-global/process */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import meow from 'meow'
import { generateEnv } from './generate-env.js'

const __filename = fileURLToPath(import.meta.url) // Get the resolved path to the file
const __dirname = path.dirname(__filename) // Get the name of the directory

const cli = meow(
  `
  Usage
    $ env-to-t3 [input]

  Options
    --input, -i <type> The path to the environment file.  [Default: .env]
    --output, -o The path to write the output. [Default: env.ts]
    --client-prefix, -cp The prefix for client-side environment variables. [Default: NEXT_PUBLIC_]
    --js Generate JavaScript file with JSDoc type definitions instead of TypeScript. [Default: false]
    
  Examples
    $ env-to-t3 --input .env
    $ env-to-t3 --input .env --js
`,
  {
    importMeta: import.meta,
    flags: {
      input: { type: 'string', shortFlag: 'i', default: '.env' },
      output: { type: 'string', shortFlag: 'o', default: 'env.ts' },
      clientPrefix: { type: 'string', shortFlag: 'cp', default: 'NEXT_PUBLIC_' },
      js: { type: 'boolean', default: false },
    },
  }
)
const envPath = path.resolve(process.cwd(), cli.flags.input)
if (!fs.existsSync(envPath)) {
  console.error(
    `Environment file not found at ${envPath}. Please provide a valid path to the environment file.`
  )
  process.exit(1)
}

const templateFileName = cli.flags.js ? 'template.js.ejs' : 'template.ejs'
const defaultOutputFile = cli.flags.js ? 'env.js' : 'env.ts'
const outputFile =
  cli.flags.output === 'env.ts' && cli.flags.js ? defaultOutputFile : cli.flags.output

generateEnv({
  envFile: envPath,
  templateFile: path.resolve(__dirname, `./${templateFileName}`),
  outputFile: path.resolve(process.cwd(), outputFile),
  clientVarPrefix: cli.flags.clientPrefix,
})
