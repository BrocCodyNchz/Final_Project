export interface Transaction {
  id: string
  description: string
  amount: number
  transaction_type: string
  transaction_date: string
}

export interface User {
  id: string
  email: string
  name: string
}