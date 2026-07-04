# Meals Out

This section tracks meals eaten outside the home, including restaurants, takeout, and other dining expenses.

## Agent Instructions

- Add new page route at /meals-out
- A new db table MealsOut
  - id
  - organizationId
  - date
  - amount
  - merchant
  - reason
    - Date Night
    - Friends
    - Lazy
    - No Groceries
    - Celebration
    - Family
    - Travel
    - Away from Home
    - Other
  - notes

- The page should show stats on how many meals out in the last 7 days, 30 days, and 90 days including the amount spent.
- The page should have a chart showing meals out over time including the amount spent.
- The ui should allow adding, editing, and deleting meals out including the date, amount, merchant, reason, and notes.
- The merchant field should allow entering the name of the restaurant or place where the meal was purchased. It should support free text entry as well as selecting from previously entered merchants.
- The reason field should allow selecting from the predefined reasons including Date Night, Friends, Lazy, No Groceries, Celebration, Family, Travel, Away from Home, and Other.
- The notes field should allow entering any additional information about the meal out.
