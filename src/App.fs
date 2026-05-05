module BudgetLens.App

open System
open Feliz
open BudgetLens.Types
open BudgetLens.Storage

/// Initialize application state from localStorage
let init () =
    let categories = loadCategories ()
    let expenses = loadExpenses ()
    let currency = loadCurrency ()

    { Categories = categories
      Expenses = expenses
      Currency = currency
      ActiveView = DashboardView
      TimeRange = ThisMonth
      SortOrder = DateDesc
      ExpenseForm = ExpenseFormState.Empty
      CategoryForm = CategoryFormState.Empty
      EditingCategoryId = None
      FilterCategoryId = None
      SearchQuery = "" }

/// Update function — pure state transitions
let update (msg: Msg) (model: Model) : Model =
    match msg with
    // Navigation
    | SetView view ->
        let form =
            if view = AddExpenseView then ExpenseFormState.Empty
            else model.ExpenseForm
        { model with ActiveView = view; ExpenseForm = form }

    // Expense form
    | SetAmount v -> { model with ExpenseForm = { model.ExpenseForm with Amount = v } }
    | SetDescription v -> { model with ExpenseForm = { model.ExpenseForm with Description = v } }
    | SetExpenseCategory id -> { model with ExpenseForm = { model.ExpenseForm with CategoryId = id } }
    | SetExpenseDate v -> { model with ExpenseForm = { model.ExpenseForm with Date = v } }

    | SubmitExpense ->
        match System.Double.TryParse(model.ExpenseForm.Amount) with
        | true, amount when amount > 0.0 && model.ExpenseForm.CategoryId.IsSome ->
            let date =
                match DateTime.TryParse(model.ExpenseForm.Date) with
                | true, d -> d
                | _ -> DateTime.Now

            match model.ExpenseForm.EditingId with
            | Some editId ->
                // Update existing
                let newExpenses =
                    model.Expenses
                    |> List.map (fun e ->
                        if e.Id = editId then
                            { e with
                                Amount = amount
                                Description = model.ExpenseForm.Description.Trim()
                                CategoryId = model.ExpenseForm.CategoryId.Value
                                Date = date }
                        else e)
                saveExpenses newExpenses
                { model with
                    Expenses = newExpenses
                    ExpenseForm = ExpenseFormState.Empty
                    ActiveView = ExpensesView }

            | None ->
                // Add new
                let expense =
                    { Id = Guid.NewGuid()
                      CategoryId = model.ExpenseForm.CategoryId.Value
                      Amount = amount
                      Description = model.ExpenseForm.Description.Trim()
                      Date = date }
                let newExpenses = expense :: model.Expenses
                saveExpenses newExpenses
                { model with
                    Expenses = newExpenses
                    ExpenseForm = ExpenseFormState.Empty
                    ActiveView = ExpensesView }
        | _ -> model

    | EditExpense id ->
        match model.Expenses |> List.tryFind (fun e -> e.Id = id) with
        | Some expense ->
            { model with
                ExpenseForm =
                    { Amount = string expense.Amount
                      Description = expense.Description
                      CategoryId = Some expense.CategoryId
                      Date = expense.Date.ToString("yyyy-MM-dd")
                      EditingId = Some id }
                ActiveView = AddExpenseView }
        | None -> model

    | DeleteExpense id ->
        let newExpenses = model.Expenses |> List.filter (fun e -> e.Id <> id)
        saveExpenses newExpenses
        { model with Expenses = newExpenses }

    | CancelEdit ->
        { model with ExpenseForm = ExpenseFormState.Empty; ActiveView = ExpensesView }

    // Category management
    | SetCategoryName v -> { model with CategoryForm = { model.CategoryForm with Name = v } }
    | SetCategoryIcon v -> { model with CategoryForm = { model.CategoryForm with Icon = v } }
    | SetCategoryColor v -> { model with CategoryForm = { model.CategoryForm with Color = v } }
    | SetCategoryBudget v -> { model with CategoryForm = { model.CategoryForm with MonthlyBudget = v } }

    | AddCategory ->
        let name = model.CategoryForm.Name.Trim()
        if name = "" then model
        else
            let budget =
                match System.Double.TryParse(model.CategoryForm.MonthlyBudget) with
                | true, v when v > 0.0 -> Some v
                | _ -> None
            let cat =
                { Id = Guid.NewGuid()
                  Name = name
                  Icon = model.CategoryForm.Icon
                  Color = model.CategoryForm.Color
                  MonthlyBudget = budget }
            let newCats = model.Categories @ [ cat ]
            saveCategories newCats
            { model with Categories = newCats; CategoryForm = CategoryFormState.Empty }

    | EditCategory id ->
        match model.Categories |> List.tryFind (fun c -> c.Id = id) with
        | Some cat ->
            { model with
                EditingCategoryId = Some id
                CategoryForm =
                    { Name = cat.Name
                      Icon = cat.Icon
                      Color = cat.Color
                      MonthlyBudget =
                        match cat.MonthlyBudget with
                        | Some b -> string b
                        | None -> "" } }
        | None -> model

    | SaveCategory ->
        match model.EditingCategoryId with
        | Some id ->
            let name = model.CategoryForm.Name.Trim()
            if name = "" then model
            else
                let budget =
                    match System.Double.TryParse(model.CategoryForm.MonthlyBudget) with
                    | true, v when v > 0.0 -> Some v
                    | _ -> None
                let newCats =
                    model.Categories
                    |> List.map (fun c ->
                        if c.Id = id then
                            { c with
                                Name = name
                                Icon = model.CategoryForm.Icon
                                Color = model.CategoryForm.Color
                                MonthlyBudget = budget }
                        else c)
                saveCategories newCats
                { model with
                    Categories = newCats
                    CategoryForm = CategoryFormState.Empty
                    EditingCategoryId = None }
        | None -> model

    | DeleteCategory id ->
        let newCats = model.Categories |> List.filter (fun c -> c.Id <> id)
        saveCategories newCats
        { model with Categories = newCats }

    | CancelCategoryEdit ->
        { model with EditingCategoryId = None; CategoryForm = CategoryFormState.Empty }

    // Filters
    | SetTimeRange range -> { model with TimeRange = range }
    | SetSortOrder order -> { model with SortOrder = order }
    | SetFilterCategory id -> { model with FilterCategoryId = id }
    | SetSearchQuery query -> { model with SearchQuery = query }

    | SetCurrency curr ->
        saveCurrency curr
        { model with Currency = curr }

    // Data
    | ClearAllExpenses ->
        saveExpenses []
        { model with Expenses = [] }

/// Bottom navigation bar
let private navbar (activeView: ActiveView) (dispatch: Msg -> unit) =
    let tabButton (view: ActiveView) (icon: string) (label: string) =
        Html.button [
            prop.className (if activeView = view then "nav-tab active" else "nav-tab")
            prop.onClick (fun _ -> dispatch (SetView view))
            prop.children [
                Html.span [ prop.className "nav-icon"; prop.text icon ]
                Html.span [ prop.className "nav-label"; prop.text label ]
            ]
        ]

    Html.nav [
        prop.className "navbar"
        prop.children [
            tabButton DashboardView "\U0001F4CA" "Dashboard"
            tabButton ExpensesView "\U0001F4CB" "Expenses"
            tabButton AddExpenseView "\u2795" "Add"
            tabButton CategoriesView "\u2699\uFE0F" "Settings"
        ]
    ]

/// Main application view
let view (model: Model) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "app-container"
        prop.children [
            Html.header [
                prop.className "app-header"
                prop.children [
                    Html.h1 [ prop.text "BudgetLens" ]
                    Html.span [ prop.className "app-subtitle"; prop.text "Personal Expense Tracker" ]
                ]
            ]

            Html.main [
                prop.className "app-main"
                prop.children [
                    Html.div [
                        prop.key (string model.ActiveView)
                        prop.className "page-fade-in"
                        prop.children [
                            match model.ActiveView with
                            | DashboardView -> Dashboard.view model dispatch
                            | ExpensesView -> ExpenseList.view model dispatch
                            | AddExpenseView -> ExpenseForm.view model dispatch
                            | CategoriesView -> CategoryManager.view model dispatch
                        ]
                    ]
                ]
            ]

            navbar model.ActiveView dispatch
        ]
    ]
