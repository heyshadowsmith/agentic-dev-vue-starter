import { readLedger, writeLedger } from '@/core/stored-ledger'
import { emptyLedger, type Ledger } from '@/core/types'

export const storageKey = 'expense-splitter'

export const loadLedger = (storage: Storage): Ledger => {
  try {
    const text = storage.getItem(storageKey)
    return text === null ? emptyLedger : readLedger(JSON.parse(text))
  } catch {
    return emptyLedger
  }
}

export const isLedgerSaved = (storage: Storage, ledger: Ledger): boolean => {
  try {
    storage.setItem(storageKey, writeLedger(ledger))
    return true
  } catch {
    return false
  }
}
