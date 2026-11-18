# Agentic Dev Vue Starter

## Expense splitter

The app divides shared costs among a group of people.
It shows who owes money and the payments that make all balances zero.

### Pages

- `/` shows the balance of each person and the list of expenses.
  A positive balance means that the group owes money to that person.
  On this page, you can add people and expenses, and delete expenses.
- `/settle` shows the payments that bring each balance to zero, for example "Alex pays Sam $12.50".

### People

Each person has a name.
A name cannot be empty, and two people cannot have the same name.
The comparison of names ignores case, thus "Alex" and "alex" are the same name.
You can remove a person only when no expense contains that person.

### Expenses

An expense has a description, an amount, the person who paid and the people who share the cost.
Each person in the split pays an equal share.
The app records the date and time when you add the expense.
It also gives each expense a unique ID.

Write the amount in dollars, with a maximum of two decimal places, for example `12`, `12.5` or `12.50`.

### Exact money

The app keeps each amount as an integer number of cents.
Thus, there are no floating-point errors.

When an amount does not divide equally, the app uses this rule:

1. Each person gets the amount divided by the number of people, rounded down to a full cent.
2. The remaining cents go to the people in the split, one cent each.
3. The first people in the group get these cents first.
   The order of the group is the order in which you added the people.

For example, $10.00 among Alex, Sam and Kim gives $3.34 to Alex, $3.33 to Sam and $3.33 to Kim.

### Payments to settle up

The app makes the list of payments with these steps:

1. If a person owes an amount that is equal to the amount that another person gets, the first person pays the second person.
2. If not, the person who owes the most pays the person who gets the most.
3. The app repeats these steps until all balances are zero.

Each payment brings at least one balance to zero.
Thus, a group of `n` people needs a maximum of `n - 1` payments.
This list is not always the shortest possible list, because that problem is too slow to solve for large groups.
If two people have the same balance, the person who is first in the group goes first.

### Storage

The app saves the people and the expenses in the `localStorage` of the browser.
When you open the app again, it reads this data.
If the data is missing or not correct, the app starts with no people and no expenses.

### Code

The calculations are pure functions in `src/core/`.
The Pinia store in `src/stores/ledger.ts` connects these functions to the pages and to `localStorage`.
