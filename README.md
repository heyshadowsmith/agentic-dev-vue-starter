# Agentic Dev Vue Starter

## Expense splitter

The expense splitter divides shared costs among a group of people.
It keeps the people and the expenses in the browser.

### Pages

- The balances page at `/` shows the people, the form for a new expense, the balance of each person and the list of expenses.
- The settle-up page at `/settle` shows the payments that make each balance zero, for example "Alex pays Sam $12.50".

### People

Each name must have 1 to 40 characters, and it must be unique.
The app removes the spaces at the start and at the end of a name.
The check for unique names ignores the difference between capital and small letters.
You can remove a person only when no expense contains that person, as payer or in the split.

### Expenses

An expense has a description, an amount, a payer and the people in the split.
The description can have a maximum of 80 characters.
The app divides the amount equally among the people in the split.
The split can include the payer, but it is not necessary.
The app records the date and time of each expense, and it gives each expense a unique ID.
You can delete an expense.

### Balances

A positive balance tells that the group owes money to the person.
A negative balance tells that the person owes money to the group.
For each expense, the payer gets the full amount, and each person in the split pays a share.

### Exact money

The app keeps each amount as a whole number of cents.
It does not use decimal fractions, thus it does not have floating-point errors.
The amount field accepts a maximum of two decimal places.

### Rule for leftover cents

Sometimes an amount does not divide equally.
In this case, each person in the split pays the base share, and the app adds the leftover cents.
The first people in the split pay one more cent each, until no cent is left.
The order of the split is the order in which you added the people to the group.

For example, Alex, Sam and Kim share an expense of $10.00.
Alex pays $3.34, Sam pays $3.33 and Kim pays $3.33.

### Rule for settle-up payments

The app makes a list of payments with these steps:

1. Find a person who owes an amount that is equal to the credit of a different person.
   If there is a match, that person pays the full amount to the other person.
2. If there is no match, the person who owes the most pays the person with the largest credit.
   The payment is the smaller of the two amounts.
3. Do these steps again until each balance is zero.

If two people have the same amount, the app uses the order in which you added them.
The list has fewer payments than the number of people with a balance.

### Storage

The app saves the people and the expenses in `localStorage` after each change.
When you load the page again, the app restores them.
If the saved data is missing or not correct, the app starts with an empty group.

### Code

The pure logic is in `src/core/`, and it has tests with 100% coverage.

- `money.ts` reads and shows amounts in cents.
- `split.ts` divides an amount into shares.
- `balances.ts` calculates the balance of each person.
- `settle.ts` calculates the settle-up payments.
- `people.ts` and `expenses.ts` validate and change the data.
- `stored-ledger.ts` validates and writes the saved data.

The Pinia store in `src/stores/ledger.ts` connects this logic to `localStorage`, the clock and the ID generator.
The components use ui-sdk for the buttons, fields, the payer select and the split checkboxes.
