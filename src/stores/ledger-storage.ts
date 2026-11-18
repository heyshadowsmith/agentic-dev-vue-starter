import { decodeLedger } from '@/core/decode'
import { emptyLedger, type Ledger } from '@/core/ledger'

export const storageKey = 'expense-splitter:ledger'

export function readLedger(storage: Pick<Storage, 'getItem'>): Ledger {
  try {
    const stored = storage.getItem(storageKey)
    return stored === null ? emptyLedger : decodeLedger(JSON.parse(stored))
  } catch {
    return emptyLedger
  }
}

export function writeLedger(storage: Pick<Storage, 'setItem'>, ledger: Ledger): boolean {
  try {
    storage.setItem(storageKey, JSON.stringify(ledger))
    return true
  } catch {
    return false
  }
}
