import { spawnSync } from 'node:child_process'
import process from 'node:process'

interface Advisory {
  readonly name: string
  readonly severity: string
  readonly title: string
  readonly url: string
  readonly fixedIn: string
}

const noFix = '<0.0.0'
const isWarnOnly = process.argv.includes('--warn-only')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toAdvisory = (value: unknown): Advisory | undefined => {
  if (!isRecord(value)) return undefined
  const fields = [
    value['module_name'],
    value['severity'],
    value['title'],
    value['url'],
    value['patched_versions'],
  ]
  if (fields.some((field) => typeof field !== 'string')) return undefined
  const [name, severity, title, url, fixedIn] = fields.map(String)
  return { name, severity, title, url, fixedIn } as Advisory
}

const readAdvisories = (output: string): Advisory[] | undefined => {
  try {
    const report: unknown = JSON.parse(output)
    return isRecord(report) && isRecord(report['advisories'])
      ? Object.values(report['advisories'])
          .map((advisory) => toAdvisory(advisory))
          .filter((advisory) => advisory !== undefined)
      : undefined
  } catch {
    return undefined
  }
}

const runAudit = () => {
  const pnpm = process.env['npm_execpath']
  if (pnpm === undefined) return
  return spawnSync(process.execPath, [pnpm, 'audit', '--json'], { encoding: 'utf8' })
}

const fail = (message: string) => {
  console.error(message)
  if (!isWarnOnly) process.exitCode = 1
}

const audit = runAudit()
const advisories = audit === undefined ? undefined : readAdvisories(audit.stdout)

if (advisories === undefined) {
  fail('Could not read the pnpm audit report. Run this check with "pnpm check:audit".')
} else {
  const fixable = advisories.filter((advisory) => advisory.fixedIn !== noFix)
  const unfixable = advisories.length - fixable.length
  for (const { severity, name, fixedIn, title, url } of fixable) {
    console.error(`${severity} ${name}: fixed in ${fixedIn}. ${title} ${url}`)
  }
  if (fixable.length > 0) {
    fail(`${String(fixable.length)} vulnerabilities have a fix. Update or override them.`)
  } else {
    console.log(`No fixable vulnerabilities. ${String(unfixable)} without a fix are ignored.`)
  }
}
