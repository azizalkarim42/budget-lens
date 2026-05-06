module BudgetLens.ExpenseForm

open System
open Feliz
open BudgetLens.Types

/// Render a category option in the selector
let private categoryOption (cat: Category) (isSelected: bool) (dispatch: Msg -> unit) =
    Html.div [
        prop.className (if isSelected then "cat-chip selected" else "cat-chip")
        prop.onClick (fun _ -> dispatch (SetExpenseCategory (Some cat.Id)))
        prop.children [
            Html.span [ prop.className "cat-chip-icon"; prop.text cat.Icon ]
            Html.span [ prop.className "cat-chip-name"; prop.text cat.Name ]
        ]
        prop.style [
            if isSelected then
                style.backgroundColor cat.Color
                style.color "white"
                style.borderColor cat.Color
        ]
    ]

/// Category selector grid
let private categorySelector (categories: Category list) (selected: Guid option) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "category-grid"
        prop.children [
            for cat in categories do
                categoryOption cat (selected = Some cat.Id) dispatch
        ]
    ]

/// Numeric input with label
let private formField (label: string) (children: ReactElement list) =
    Html.div [
        prop.className "form-field"
        prop.children [
            Html.label [ prop.className "form-label"; prop.text label ]
            yield! children
        ]
    ]

/// Quick amount buttons
let private quickAmounts (currency: Currency) (dispatch: Msg -> unit) =
    let amounts =
        match currency with
        | HUF -> [ 500.0; 1000.0; 2000.0; 5000.0 ]
        | _ -> [ 5.0; 10.0; 20.0; 50.0 ]

    Html.div [
        prop.className "quick-amounts"
        prop.children [
            for amt in amounts do
                Html.button [
                    prop.className "quick-amt-btn"
                    prop.text (Format.amount currency amt)
                    prop.onClick (fun _ -> dispatch (SetAmount (string amt)))
                ]
        ]
    ]

/// Main expense form view
let view (model: Model) (dispatch: Msg -> unit) =
    let isEditing = model.ExpenseForm.EditingId.IsSome
    let amountInvalid =
        model.ExpenseForm.Amount <> ""
        && (match System.Double.TryParse(model.ExpenseForm.Amount) with
            | true, v -> v <= 0.0
            | _ -> true)
    let canSubmit =
        model.ExpenseForm.Amount <> ""
        && not amountInvalid
        && model.ExpenseForm.CategoryId.IsSome

    Html.div [
        prop.className "expense-form-page"
        prop.children [
            Html.h2 [
                prop.text (if isEditing then "Edit Expense" else "Add Expense")
            ]

            // Amount input
            formField "Amount" [
                Html.div [
                    prop.className (if amountInvalid then "amount-input-wrap invalid" else "amount-input-wrap")
                    prop.children [
                        Html.span [
                            prop.className "currency-symbol"
                            prop.text model.Currency.Symbol
                        ]
                        Html.input [
                            prop.className "amount-input"
                            prop.type'.number
                            prop.placeholder "0.00"
                            prop.value model.ExpenseForm.Amount
                            prop.autoFocus true
                            prop.onChange (fun (v: string) -> dispatch (SetAmount v))
                        ]
                    ]
                ]
                if amountInvalid then
                    Html.p [ prop.className "field-error"; prop.text "Enter a valid amount greater than 0" ]
                quickAmounts model.Currency dispatch
            ]

            // Description
            formField "Description" [
                Html.input [
                    prop.className "text-input"
                    prop.placeholder "What did you spend on?"
                    prop.value model.ExpenseForm.Description
                    prop.onChange (fun (v: string) -> dispatch (SetDescription v))
                ]
            ]

            // Date
            formField "Date" [
                Html.input [
                    prop.className "text-input"
                    prop.type'.date
                    prop.value model.ExpenseForm.Date
                    prop.onChange (fun (v: string) -> dispatch (SetExpenseDate v))
                ]
            ]

            // Category selector
            formField "Category" [
                categorySelector model.Categories model.ExpenseForm.CategoryId dispatch
            ]

            // Submit buttons
            Html.div [
                prop.className "form-actions"
                prop.children [
                    Html.button [
                        prop.className "btn btn-primary btn-large"
                        prop.text (if isEditing then "Save Changes" else "Add Expense")
                        prop.disabled (not canSubmit)
                        prop.onClick (fun _ -> dispatch SubmitExpense)
                    ]
                    if isEditing then
                        Html.button [
                            prop.className "btn btn-secondary"
                            prop.text "Cancel"
                            prop.onClick (fun _ -> dispatch CancelEdit)
                        ]
                ]
            ]
        ]
    ]
