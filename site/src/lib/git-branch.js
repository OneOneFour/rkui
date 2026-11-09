import { execSync } from 'node:child_process'

/**
 * The git branch the site is built from, for the version badge, or nothing on `main`, outside a
 * git checkout, or on a detached HEAD (as in a release build).
 * @returns {string | undefined}
 */
export function gitBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
    return branch === 'main' || branch === 'HEAD' ? undefined : branch
  } catch {
    return undefined
  }
}
