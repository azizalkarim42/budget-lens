module BudgetLens.Types

open System

/// Represents a spending category with a display color and optional monthly budget
type Category =
    { Id: Guid
      Name: string
      Icon: string
      Color: string
      MonthlyBudget: float option }

/// A single expense entry
type Expense =
    { Id: Guid
      CategoryId: Guid
      Amount: float
      Description: string
      Date: DateTime }

/// Currency setting
type Currency =
    | EUR
    | USD
    | GBP
    | HUF

    member this.Symbol =
        match this with
        | EUR -> "\u20AC"
        | USD -> "$"
        | GBP -> "\u00A3"
        | HUF -> "Ft"

    member this.Code =
        match this with
        | EUR -> "EUR"
        | USD -> "USD"
        | GBP -> "GBP"
        | HUF -> "HUF"

/// Active view in the application
type ActiveView =
    | DashboardView
    | ExpensesView
    | AddExpenseView
    | CategoriesView

/// Time range filter for dashboard
type TimeRange =
    | ThisWeek
    | ThisMonth
    | Last30Days
    | Last90Days
    | AllTime

/// Sort order for expense list
type SortOrder =
    | DateDesc
    | DateAsc
    | AmountDesc
    | AmountAsc

/// Form state for adding/editing an expense
type ExpenseFormState =
    { Amount: string
      Description: string
      CategoryId: Guid option
      Date: string
      EditingId: Guid option }

    static member Empty =
        { Amount = ""
          Description = ""
          CategoryId = None
          Date = DateTime.Now.ToString("yyyy-MM-dd")
          EditingId = None }

/// Form state for adding/editing a category
type CategoryFormState =
    { Name: string
      Icon: string
      Color: string
      MonthlyBudget: string }

    static member Empty =
        { Name = ""
          Icon = "\U0001F4E6"
          Color = "#3498db"
          MonthlyBudget = "" }

/// Root application model
type Model =
    { Categories: Category list
      Expenses: Expense list
      Currency: Currency
      ActiveView: ActiveView
      TimeRange: TimeRange
      SortOrder: SortOrder
      ExpenseForm: ExpenseFormState
      CategoryForm: CategoryFormState
      EditingCategoryId: Guid option
      FilterCategoryId: Guid option
      SearchQuery: string }

/// All possible messages
type Msg =
    // Navigation
    | SetView of ActiveView
    // Expense form
    | SetAmount of string
    | SetDescription of string
    | SetExpenseCategory of Guid option
    | SetExpenseDate of string
    | SubmitExpense
    | EditExpense of Guid
    | DeleteExpense of Guid
    | CancelEdit
    // Category management
    | SetCategoryName of string
    | SetCategoryIcon of string
    | SetCategoryColor of string
    | SetCategoryBudget of string
    | AddCategory
    | EditCategory of Guid
    | SaveCategory
    | DeleteCategory of Guid
    | CancelCategoryEdit
    // Filters and settings
    | SetTimeRange of TimeRange
    | SetSortOrder of SortOrder
    | SetFilterCategory of Guid option
    | SetSearchQuery of string
    | SetCurrency of Currency
    // Data
    | ClearAllExpenses

/// Default categories for new users
module Defaults =
    let categories =
        [ { Id = Guid.NewGuid(); Name = "Food & Drinks"; Icon = "\U0001F354"; Color = "#e74c3c"; MonthlyBudget = Some 200.0 }
          { Id = Guid.NewGuid(); Name = "Transport"; Icon = "\U0001F68C"; Color = "#3498db"; MonthlyBudget = Some 100.0 }
          { Id = Guid.NewGuid(); Name = "Shopping"; Icon = "\U0001F6CD\uFE0F"; Color = "#9b59b6"; MonthlyBudget = Some 150.0 }
          { Id = Guid.NewGuid(); Name = "Entertainment"; Icon = "\U0001F3AC"; Color = "#f39c12"; MonthlyBudget = Some 80.0 }
          { Id = Guid.NewGuid(); Name = "Bills & Utilities"; Icon = "\U0001F4A1"; Color = "#1abc9c"; MonthlyBudget = None }
          { Id = Guid.NewGuid(); Name = "Health"; Icon = "\U0001F3E5"; Color = "#e67e22"; MonthlyBudget = None }
          { Id = Guid.NewGuid(); Name = "Education"; Icon = "\U0001F4DA"; Color = "#2ecc71"; MonthlyBudget = None }
          { Id = Guid.NewGuid(); Name = "Other"; Icon = "\U0001F4E6"; Color = "#95a5a6"; MonthlyBudget = None } ]

    let icons =
        [| "\U0001F354"; "\U0001F68C"; "\U0001F6CD\uFE0F"; "\U0001F3AC"; "\U0001F4A1"
           "\U0001F3E5"; "\U0001F4DA"; "\U0001F4E6"; "\U0001F3E0"; "\u2708\uFE0F"
           "\U0001F4BB"; "\U0001F3CB\uFE0F"; "\U0001F381"; "\u2615"; "\U0001F4B0" |]

/// Helper to format currency amounts
module Format =
    let amount (currency: Currency) (value: float) =
        match currency with
        | HUF -> sprintf "%s %s" (value.ToString("N0")) currency.Symbol
        | _ -> sprintf "%s%s" currency.Symbol (value.ToString("N2"))
