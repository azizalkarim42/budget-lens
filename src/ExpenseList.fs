module BudgetLens.ExpenseList

open System
open Feliz
open BudgetLens.Types

/// Format a date nicely
let private formatDate (dt: DateTime) =
    sprintf "%04d-%02d-%02d" dt.Year dt.Month dt.Day

/// Find category by id
let private findCategory (categories: Category list) (id: Guid) =
    categories |> List.tryFind (fun c -> c.Id = id)

/// Render a single expense row
let private expenseRow (categories: Category list) (currency: Currency) (expense: Expense) (dispatch: Msg -> unit) =
    let category = findCategory categories expense.CategoryId
    let catIcon = category |> Option.map (fun c -> c.Icon) |> Option.defaultValue "\U0001F4E6"
    let catName = category |> Option.map (fun c -> c.Name) |> Option.defaultValue "Unknown"
    let catColor = category |> Option.map (fun c -> c.Color) |> Option.defaultValue "#95a5a6"

    Html.div [
        prop.className "expense-row"
        prop.children [
            Html.div [
                prop.className "expense-icon"
                prop.style [ style.backgroundColor catColor ]
                prop.text catIcon
            ]
            Html.div [
                prop.className "expense-details"
                prop.children [
                    Html.div [
                        prop.className "expense-desc"
                        prop.text (if expense.Description = "" then catName else expense.Description)
                    ]
                    Html.div [
                        prop.className "expense-meta"
                        prop.text (sprintf "%s \u2022 %s" catName (formatDate expense.Date))
                    ]
                ]
            ]
            Html.div [
                prop.className "expense-amount"
                prop.text (Format.amount currency expense.Amount)
            ]
            Html.div [
                prop.className "expense-actions"
                prop.children [
                    Html.button [
                        prop.className "btn-icon"
                        prop.title "Edit"
                        prop.text "\u270E"
                        prop.onClick (fun _ -> dispatch (EditExpense expense.Id))
                    ]
                    Html.button [
                        prop.className "btn-icon btn-delete"
                        prop.title "Delete"
                        prop.text "\u00D7"
                        prop.onClick (fun _ -> dispatch (DeleteExpense expense.Id))
                    ]
                ]
            ]
        ]
    ]

/// Filter and sort expenses
let private filterAndSort (model: Model) =
    let now = DateTime.Now
    let filtered =
        model.Expenses
        |> List.filter (fun e ->
            // Time range filter
            let inRange =
                match model.TimeRange with
                | ThisWeek ->
                    let startOfWeek = now.AddDays(-(float now.DayOfWeek))
                    e.Date >= startOfWeek.Date
                | ThisMonth ->
                    e.Date.Year = now.Year && e.Date.Month = now.Month
                | Last30Days -> e.Date >= now.AddDays(-30.0)
                | Last90Days -> e.Date >= now.AddDays(-90.0)
                | AllTime -> true
            // Category filter
            let inCategory =
                match model.FilterCategoryId with
                | Some catId -> e.CategoryId = catId
                | None -> true
            // Search filter
            let matchesSearch =
                if model.SearchQuery = "" then true
                else e.Description.ToLower().Contains(model.SearchQuery.ToLower())
            inRange && inCategory && matchesSearch)

    // Sort
    match model.SortOrder with
    | DateDesc -> filtered |> List.sortByDescending (fun e -> e.Date)
    | DateAsc -> filtered |> List.sortBy (fun e -> e.Date)
    | AmountDesc -> filtered |> List.sortByDescending (fun e -> e.Amount)
    | AmountAsc -> filtered |> List.sortBy (fun e -> e.Amount)

/// Filter bar with time range, category filter, search
let private filterBar (model: Model) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "filter-bar"
        prop.children [
            // Search
            Html.div [
                prop.className "search-wrap"
                prop.children [
                    Html.span [ prop.className "search-icon"; prop.text "\U0001F50D" ]
                    Html.input [
                        prop.className "search-input"
                        prop.placeholder "Search expenses..."
                        prop.value model.SearchQuery
                        prop.onChange (fun (v: string) -> dispatch (SetSearchQuery v))
                    ]
                ]
            ]

            // Time range selector
            Html.div [
                prop.className "time-range-pills"
                prop.children [
                    let ranges = [ ThisWeek, "Week"; ThisMonth, "Month"; Last30Days, "30d"; AllTime, "All" ]
                    for (range, label) in ranges do
                        Html.button [
                            prop.className (if model.TimeRange = range then "pill active" else "pill")
                            prop.text label
                            prop.onClick (fun _ -> dispatch (SetTimeRange range))
                        ]
                ]
            ]

            // Category filter
            Html.select [
                prop.className "cat-filter-select"
                prop.value (
                    match model.FilterCategoryId with
                    | Some id -> string id
                    | None -> "")
                prop.onChange (fun (v: string) ->
                    if v = "" then dispatch (SetFilterCategory None)
                    else dispatch (SetFilterCategory (Some (Guid.Parse v))))
                prop.children [
                    Html.option [ prop.value ""; prop.text "All categories" ]
                    for cat in model.Categories do
                        Html.option [
                            prop.value (string cat.Id)
                            prop.text (sprintf "%s %s" cat.Icon cat.Name)
                        ]
                ]
            ]

            // Sort selector
            Html.select [
                prop.className "sort-select"
                prop.value (
                    match model.SortOrder with
                    | DateDesc -> "date-desc"
                    | DateAsc -> "date-asc"
                    | AmountDesc -> "amt-desc"
                    | AmountAsc -> "amt-asc")
                prop.onChange (fun (v: string) ->
                    let order =
                        match v with
                        | "date-asc" -> DateAsc
                        | "amt-desc" -> AmountDesc
                        | "amt-asc" -> AmountAsc
                        | _ -> DateDesc
                    dispatch (SetSortOrder order))
                prop.children [
                    Html.option [ prop.value "date-desc"; prop.text "Newest first" ]
                    Html.option [ prop.value "date-asc"; prop.text "Oldest first" ]
                    Html.option [ prop.value "amt-desc"; prop.text "Highest amount" ]
                    Html.option [ prop.value "amt-asc"; prop.text "Lowest amount" ]
                ]
            ]
        ]
    ]

/// Group expenses by date
let private groupByDate (expenses: Expense list) =
    expenses
    |> List.groupBy (fun e -> e.Date.Date)
    |> List.sortByDescending fst

/// Main expense list view
let view (model: Model) (dispatch: Msg -> unit) =
    let filtered = filterAndSort model
    let totalFiltered = filtered |> List.sumBy (fun e -> e.Amount)
    let grouped = groupByDate filtered

    Html.div [
        prop.className "expenses-page"
        prop.children [
            Html.div [
                prop.className "page-header"
                prop.children [
                    Html.h2 [ prop.text "Expenses" ]
                    Html.button [
                        prop.className "btn btn-primary btn-small"
                        prop.text "+ Add"
                        prop.onClick (fun _ -> dispatch (SetView AddExpenseView))
                    ]
                ]
            ]

            filterBar model dispatch

            // Summary
            Html.div [
                prop.className "filter-summary"
                prop.text (sprintf "%d expenses \u2022 %s total" (List.length filtered) (Format.amount model.Currency totalFiltered))
            ]

            if filtered.IsEmpty then
                Html.div [
                    prop.className "empty-state"
                    prop.children [
                        Html.div [ prop.className "empty-icon"; prop.text "\U0001F4B8" ]
                        Html.p [ prop.text "No expenses found." ]
                        Html.p [
                            prop.className "empty-hint"
                            prop.text "Add your first expense to start tracking your spending!"
                        ]
                    ]
                ]
            else
                Html.div [
                    prop.className "expense-groups"
                    prop.children [
                        for (date, expenses) in grouped do
                            let dayTotal = expenses |> List.sumBy (fun e -> e.Amount)
                            Html.div [
                                prop.className "date-group"
                                prop.children [
                                    Html.div [
                                        prop.className "date-header"
                                        prop.children [
                                            Html.span [
                                                prop.className "date-label"
                                                prop.text (formatDate date)
                                            ]
                                            Html.span [
                                                prop.className "date-total"
                                                prop.text (Format.amount model.Currency dayTotal)
                                            ]
                                        ]
                                    ]
                                    for expense in expenses do
                                        expenseRow model.Categories model.Currency expense dispatch
                                ]
                            ]
                    ]
                ]
        ]
    ]
