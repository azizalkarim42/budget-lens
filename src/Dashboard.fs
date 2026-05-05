module BudgetLens.Dashboard

open System
open Feliz
open BudgetLens.Types

/// Get expenses for the current month
let private currentMonthExpenses (expenses: Expense list) =
    let now = DateTime.Now
    expenses |> List.filter (fun e -> e.Date.Year = now.Year && e.Date.Month = now.Month)

/// Get expenses for the previous calendar month
let private lastMonthExpenses (expenses: Expense list) =
    let now = DateTime.Now
    let lastMonth = now.AddMonths(-1)
    expenses |> List.filter (fun e -> e.Date.Year = lastMonth.Year && e.Date.Month = lastMonth.Month)

/// Monthly trend indicator: compares this month vs last month total spending
let private trendIndicator (expenses: Expense list) (currency: Currency) =
    let thisTotal = currentMonthExpenses expenses |> List.sumBy (fun e -> e.Amount)
    let lastTotal = lastMonthExpenses expenses |> List.sumBy (fun e -> e.Amount)
    let (arrow, colorClass, label) =
        if lastTotal = 0.0 then
            ("→", "trend-neutral", "No data for last month")
        else
            let pct = (thisTotal - lastTotal) / lastTotal * 100.0
            if pct > 0.5 then
                (sprintf "↑ %.1f%%%%" pct, "trend-up", sprintf "vs %s last month" (Format.amount currency lastTotal))
            elif pct < -0.5 then
                (sprintf "↓ %.1f%%%%" (abs pct), "trend-down", sprintf "vs %s last month" (Format.amount currency lastTotal))
            else
                ("→ ~0%", "trend-neutral", sprintf "vs %s last month" (Format.amount currency lastTotal))
    Html.div [
        prop.className "stat-card trend-card"
        prop.children [
            Html.div [
                prop.className (sprintf "stat-icon trend-icon %s" colorClass)
                prop.text "\U0001F4C8"
            ]
            Html.div [
                prop.className "stat-content"
                prop.children [
                    Html.div [ prop.className (sprintf "stat-value %s" colorClass); prop.text arrow ]
                    Html.div [ prop.className "stat-label"; prop.text "vs Last Month" ]
                    Html.div [ prop.className "trend-sublabel"; prop.text label ]
                ]
            ]
        ]
    ]

/// Spending per category for given expenses
let private categorySpending (categories: Category list) (expenses: Expense list) =
    categories
    |> List.choose (fun cat ->
        let total = expenses |> List.filter (fun e -> e.CategoryId = cat.Id) |> List.sumBy (fun e -> e.Amount)
        if total > 0.0 then Some (cat, total) else None)
    |> List.sortByDescending snd

/// Daily spending for the last N days
let private dailySpending (days: int) (expenses: Expense list) =
    let today = DateTime.Now.Date
    [ for i in (days - 1) .. -1 .. 0 do
        let date = today.AddDays(float -i)
        let total =
            expenses
            |> List.filter (fun e -> e.Date.Date = date)
            |> List.sumBy (fun e -> e.Amount)
        (date, total) ]

/// Summary stat card
let private statCard (label: string) (value: string) (icon: string) (color: string) =
    Html.div [
        prop.className "stat-card"
        prop.children [
            Html.div [
                prop.className "stat-icon"
                prop.style [ style.backgroundColor color ]
                prop.text icon
            ]
            Html.div [
                prop.className "stat-content"
                prop.children [
                    Html.div [ prop.className "stat-value"; prop.text value ]
                    Html.div [ prop.className "stat-label"; prop.text label ]
                ]
            ]
        ]
    ]

/// Horizontal bar chart for category spending
let private categoryChart (categories: (Category * float) list) (currency: Currency) =
    if categories.IsEmpty then Html.none
    else
        let maxVal = categories |> List.map snd |> List.max |> max 1.0
        let barHeight = 32.0
        let gap = 10.0
        let labelWidth = 130.0
        let chartWidth = 400.0
        let totalHeight = float categories.Length * (barHeight + gap) + 10.0

        Html.div [
            prop.className "chart-container"
            prop.children [
                Html.svg [
                    prop.width (int (labelWidth + chartWidth + 80.0))
                    prop.height (int totalHeight)
                    prop.custom ("viewBox", sprintf "0 0 %g %g" (labelWidth + chartWidth + 80.0) totalHeight)
                    prop.style [ style.maxWidth (length.percent 100) ]
                    prop.children [
                        yield! categories |> List.mapi (fun i (cat, amount) ->
                            let y = float i * (barHeight + gap) + 5.0
                            let barWidth = (amount / maxVal) * chartWidth

                            Html.g [
                                prop.children [
                                    Html.text [
                                        prop.x (labelWidth - 8.0)
                                        prop.y (y + barHeight / 2.0)
                                        prop.custom ("fill", "var(--text-secondary)")
                                        prop.fontSize 12
                                        prop.textAnchor.endOfText
                                        prop.dominantBaseline.central
                                        prop.text (sprintf "%s %s" cat.Icon (if cat.Name.Length > 12 then cat.Name.[..9] + "..." else cat.Name))
                                    ]
                                    Html.rect [
                                        prop.x labelWidth; prop.y y
                                        prop.width chartWidth; prop.height barHeight
                                        prop.rx 6; prop.ry 6
                                        prop.custom ("fill", "rgba(255,255,255,0.05)")
                                    ]
                                    Html.rect [
                                        prop.x labelWidth; prop.y y
                                        prop.width (max barWidth 4.0); prop.height barHeight
                                        prop.rx 6; prop.ry 6
                                        prop.custom ("fill", cat.Color)
                                        prop.style [
                                            style.transitionProperty "width"
                                            style.transitionDurationSeconds 0.5
                                        ]
                                    ]
                                    Html.text [
                                        prop.x (labelWidth + barWidth + 8.0)
                                        prop.y (y + barHeight / 2.0)
                                        prop.custom ("fill", "var(--text-secondary)")
                                        prop.fontSize 11
                                        prop.dominantBaseline.central
                                        prop.text (Format.amount currency amount)
                                    ]
                                ]
                            ]
                        )
                    ]
                ]
            ]
        ]

/// Daily spending bar chart (last 14 days)
let private dailyChart (data: (DateTime * float) list) (currency: Currency) =
    if data.IsEmpty then Html.none
    else
        let maxVal = data |> List.map snd |> List.max |> max 1.0
        let dayNames = [| "Sun"; "Mon"; "Tue"; "Wed"; "Thu"; "Fri"; "Sat" |]

        Html.div [
            prop.className "daily-chart"
            prop.children [
                Html.div [
                    prop.className "daily-bars"
                    prop.children [
                        for (date, amount) in data do
                            let heightPct = (amount / maxVal) * 100.0
                            let dayName = dayNames.[int date.DayOfWeek]
                            let isToday = date.Date = DateTime.Now.Date
                            Html.div [
                                prop.className "daily-bar-col"
                                prop.children [
                                    Html.div [
                                        prop.className "daily-bar-value"
                                        prop.text (if amount > 0.0 then Format.amount currency amount else "")
                                    ]
                                    Html.div [
                                        prop.className "daily-bar-track"
                                        prop.children [
                                            Html.div [
                                                prop.className "daily-bar-fill"
                                                prop.style [
                                                    style.height (length.percent heightPct)
                                                    style.backgroundColor (if isToday then "#e74c3c" else "#3498db")
                                                ]
                                            ]
                                        ]
                                    ]
                                    Html.span [
                                        prop.className (if isToday then "daily-bar-label today" else "daily-bar-label")
                                        prop.text (sprintf "%s\n%d" dayName date.Day)
                                    ]
                                ]
                            ]
                    ]
                ]
            ]
        ]

/// Budget progress bars
let private budgetProgress (categories: Category list) (expenses: Expense list) (currency: Currency) =
    let monthExpenses = currentMonthExpenses expenses
    let catsWithBudget =
        categories
        |> List.choose (fun cat ->
            match cat.MonthlyBudget with
            | Some budget ->
                let spent =
                    monthExpenses
                    |> List.filter (fun e -> e.CategoryId = cat.Id)
                    |> List.sumBy (fun e -> e.Amount)
                Some (cat, spent, budget)
            | None -> None)

    if catsWithBudget.IsEmpty then Html.none
    else
        Html.div [
            prop.className "budget-section"
            prop.children [
                Html.h3 [ prop.text "Monthly Budgets" ]
                Html.div [
                    prop.className "budget-list"
                    prop.children [
                        for (cat, spent, budget) in catsWithBudget do
                            let pct = min (spent / budget * 100.0) 100.0
                            let isOver = spent > budget
                            Html.div [
                                prop.className "budget-item"
                                prop.children [
                                    Html.div [
                                        prop.className "budget-header"
                                        prop.children [
                                            Html.span [
                                                prop.text (sprintf "%s %s" cat.Icon cat.Name)
                                            ]
                                            Html.span [
                                                prop.className (if isOver then "budget-amount over" else "budget-amount")
                                                prop.text (sprintf "%s / %s" (Format.amount currency spent) (Format.amount currency budget))
                                            ]
                                        ]
                                    ]
                                    Html.div [
                                        prop.className "budget-bar-track"
                                        prop.children [
                                            Html.div [
                                                prop.className (if isOver then "budget-bar-fill over" else "budget-bar-fill")
                                                prop.style [
                                                    style.width (length.percent pct)
                                                    style.backgroundColor (if isOver then "#e74c3c" else cat.Color)
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                    ]
                ]
            ]
        ]

/// Main dashboard view
let view (model: Model) (dispatch: Msg -> unit) =
    let monthExpenses = currentMonthExpenses model.Expenses
    let monthTotal = monthExpenses |> List.sumBy (fun e -> e.Amount)
    let todayTotal =
        model.Expenses
        |> List.filter (fun e -> e.Date.Date = DateTime.Now.Date)
        |> List.sumBy (fun e -> e.Amount)
    let avgDaily =
        if monthExpenses.IsEmpty then 0.0
        else monthTotal / float DateTime.Now.Day
    let catSpending = categorySpending model.Categories monthExpenses
    let daily = dailySpending 14 model.Expenses

    Html.div [
        prop.className "dashboard-page"
        prop.children [
            Html.h2 [ prop.text "Dashboard" ]
            Html.p [
                prop.className "dash-subtitle"
                prop.text (sprintf "%s %d" (DateTime.Now.ToString("MMMM")) DateTime.Now.Year)
            ]

            // Stat cards
            Html.div [
                prop.className "stat-cards"
                prop.children [
                    statCard "This Month" (Format.amount model.Currency monthTotal) "\U0001F4B0" "#3498db"
                    statCard "Today" (Format.amount model.Currency todayTotal) "\U0001F4C5" "#e74c3c"
                    statCard "Daily Avg" (Format.amount model.Currency avgDaily) "\U0001F4CA" "#2ecc71"
                    statCard "Transactions" (string (List.length monthExpenses)) "\U0001F4CB" "#f39c12"
                    trendIndicator model.Expenses model.Currency
                ]
            ]

            // Budget progress
            budgetProgress model.Categories model.Expenses model.Currency

            // Daily spending chart
            Html.div [
                prop.className "chart-section"
                prop.children [
                    Html.h3 [ prop.text "Last 14 Days" ]
                    dailyChart daily model.Currency
                ]
            ]

            // Category breakdown
            Html.div [
                prop.className "chart-section"
                prop.children [
                    Html.h3 [ prop.text "Spending by Category" ]
                    categoryChart catSpending model.Currency
                ]
            ]

            // Quick add button
            Html.button [
                prop.className "fab"
                prop.text "+"
                prop.title "Add expense"
                prop.onClick (fun _ -> dispatch (SetView AddExpenseView))
            ]
        ]
    ]
