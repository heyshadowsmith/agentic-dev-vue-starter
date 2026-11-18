# Agentic Dev Vue Starter

## Expense splitter

The app divides shared costs among a group of people.
It shows who owes money and the payments that settle all debts.

### Pages

- `/` shows the balances, the people, a form for a new expense and the list of expenses.
- `/settle` shows the payments that bring each balance to zero, for example "Alex pays Sam $12.50".

A positive balance tells you that the group owes money to that person.
A negative balance tells you that the person owes money to the group.

### People

Each name must contain text, and it must be different from the other names.
The check of names ignores the difference between capital and small letters, thus "Sam" and "sam" are the same name.
You cannot remove a person who paid an expense or who shares an expense.
Delete those expenses first.

### Expenses

An expense has a description, an amount, the person who paid it and the people who share it.
Each person in the split pays an equal part of the amount.
The app records the date and time of each new expense, and gives each expense a unique ID.

Write the amount in dollars and cents, for example `12.50`, `$12.5` or `1,200`.
The app accepts a maximum of two digits after the decimal point.

### Exact money

The app keeps each amount as a whole number of cents.
It does not use floating-point numbers for money, thus each total is exact.
The sum of all balances is always zero.

### Rule for leftover cents

Sometimes an amount does not divide equally among the people in the split.
In this case, each person gets the amount divided by the number of people, rounded down to a full cent.
Then the app gives the leftover cents to the people in the split, one cent each.
These people get the cents in the order that you added them to the group.

For example, Alex, Sam and Kim share $10.00, and you added them in that order.
Alex pays $3.34, Sam pays $3.33 and Kim pays $3.33.
The rule does not use the order of the checkboxes that you clicked.
Thus the same expense always gives the same split.

### Settle-up payments

The app calculates the payments in steps.
In each step, the person with the largest debt pays the person with the largest credit.
The payment is the smaller of the two values.
The app then does the next step with the new balances.

Each step brings at least one balance to zero.
Thus a group of `n` people with balances needs a maximum of `n - 1` payments.
The true minimum number of payments is a hard problem for large groups, thus the app does not calculate it.
When two people have the same balance, the person that you added first comes first.

### Storage

The app saves the people and the expenses in the `localStorage` of the browser.
It reads them again when you open the page.
If the stored data is missing or not valid, the app starts with an empty group.
The app does not show an error in this case.

### Code

The pure logic is in `src/core/`, and it has tests for all lines and branches.

- `money.ts` reads and writes amounts in cents.
- `split.ts` divides an amount equally and gives out the leftover cents.
- `balances.ts` calculates the balance of each person.
- `settle.ts` calculates the settle-up payments.
- `ledger.ts` adds and removes people and expenses, and checks the input.
- `storage.ts` checks the stored data before the app uses it.

The Pinia store in `src/stores/splitter.ts` gives the time, the IDs and the stored data to the core.
