module BudgetLens.Main

open Feliz
open Browser
open BudgetLens.Types
open BudgetLens.App

/// Root React component with state management
[<ReactComponent>]
let AppComponent () =
    let (model, setModel) = React.useState (fun () -> init ())

    let dispatch msg =
        setModel (update msg model)

    // Update document title based on active view
    React.useEffect (
        (fun () ->
            let viewName =
                match model.ActiveView with
                | DashboardView -> "Dashboard"
                | ExpensesView -> "Expenses"
                | AddExpenseView -> "Add Expense"
                | CategoriesView -> "Settings"
            document.title <- sprintf "%s | BudgetLens" viewName
        ),
        [| box model.ActiveView |]
    )

    view model dispatch

/// Mount the application
let root = ReactDOM.createRoot (document.getElementById "app")
root.render (AppComponent ())
